import { useEffect, useRef } from 'react'

const MAX_BACKOFF_MS = 30_000

function nextBackoffMs(attempt: number): number {
  return Math.min(MAX_BACKOFF_MS, 1000 * 2 ** attempt)
}

/**
 * Low-level WebSocket connection to same-origin ``/ws`` with exponential backoff reconnect.
 * Calls ``onMessage`` for every non-ping JSON frame; ref-stabilised so callers need not memoise.
 */
export function useWsRawStream(onMessage: (raw: unknown) => void): void {
  const onMessageRef = useRef(onMessage)

  useEffect(() => {
    onMessageRef.current = onMessage
  }, [onMessage])

  useEffect(() => {
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${proto}//${window.location.host}/ws`

    let cancelled = false
    let ws: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0
    let gen = 0

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
      if (cancelled) return
      clearTimers()
      const myGen = ++gen
      const myWs = new WebSocket(url)
      ws = myWs

      myWs.onopen = () => {
        if (cancelled || myGen !== gen) {
          myWs.close()
          return
        }
        attempt = 0
      }

      myWs.onmessage = (ev: MessageEvent) => {
        if (typeof ev.data !== 'string') return
        let raw: unknown
        try {
          raw = JSON.parse(ev.data) as unknown
        } catch {
          return
        }
        if (typeof raw === 'object' && raw !== null && (raw as { type?: string }).type === 'ping') {
          return
        }
        onMessageRef.current(raw)
      }

      myWs.onclose = () => {
        if (myGen !== gen) return
        ws = null
        if (!cancelled) scheduleReconnect()
      }
    }

    connect()

    return () => {
      cancelled = true
      clearTimers()
      const s = ws
      ws = null
      if (!s) return
      if (s.readyState === WebSocket.OPEN) s.close()
    }
  }, [])
}
