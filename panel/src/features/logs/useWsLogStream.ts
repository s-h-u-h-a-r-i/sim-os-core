import { useEffect, useRef } from 'react'
import { asPanelLogEnvelope, type PanelLogEntry } from './types'

const MAX_BACKOFF_MS = 30_000

function nextBackoffMs(attempt: number): number {
  return Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt)
}

/**
 * Live log stream from ModBridge: same-origin ``/ws`` (Vite dev proxies WebSocket to the bridge).
 *
 * Security boundary is ``127.0.0.1`` listen only — no shared secret on the wire.
 *
 * Retries with exponential backoff until the bridge is up (e.g. Vite before the game loads).
 */
export function useWsLogStream(append: (row: PanelLogEntry) => void): void {
  const appendRef = useRef(append)

  useEffect(() => {
    appendRef.current = append
  }, [append])

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${proto}//${window.location.host}/ws`

    let cancelled = false
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0

    const clearTimers = () => {
      if (reconnectTimer !== null) {
        clearTimeout(reconnectTimer)
        reconnectTimer = null
      }
    }

    const scheduleReconnect = () => {
      clearTimers()
      const delay = nextBackoffMs(attempt)
      attempt = Math.min(attempt + 1, 16)
      reconnectTimer = setTimeout(connect, delay)
    }

    const connect = () => {
      if (cancelled) {
        return
      }
      clearTimers()
      ws = new WebSocket(url)

      ws.onopen = () => {
        attempt = 0
      }

      ws.onmessage = (ev: MessageEvent) => {
        if (typeof ev.data !== 'string') {
          return
        }
        let raw: unknown
        try {
          raw = JSON.parse(ev.data) as unknown
        } catch {
          return
        }
        if (typeof raw === 'object' && raw !== null && (raw as { type?: string }).type === 'ping') {
          return
        }
        const row = asPanelLogEnvelope(raw)
        if (row) {
          appendRef.current(row)
        }
      }

      ws.onclose = () => {
        ws = null
        if (!cancelled) {
          scheduleReconnect()
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimers()
      ws?.close()
    }
  }, [])
}
