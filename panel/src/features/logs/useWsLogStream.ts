import { useWsRawStream } from '../../hooks/useWsRawStream'
import { asPanelLogEnvelope, type PanelLogEntry } from './types'

/** Live log stream from ModBridge ``/ws`` — thin parser wrapper over ``useWsRawStream``. */
export function useWsLogStream(append: (row: PanelLogEntry) => void): void {
  useWsRawStream((raw) => {
    const row = asPanelLogEnvelope(raw)
    if (row) append(row)
  })
}
