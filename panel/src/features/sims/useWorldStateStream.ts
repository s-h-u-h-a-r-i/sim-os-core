import { useWsRawStream } from '../../hooks/useWsRawStream'
import { asWorldStateWire, type WorldStateWire } from './types'

/** Live world-state stream from ModBridge ``/ws`` — thin parser wrapper over ``useWsRawStream``. */
export function useWorldStateStream(onWorldState: (state: WorldStateWire) => void): void {
  useWsRawStream((raw) => {
    const state = asWorldStateWire(raw)
    if (state) onWorldState(state)
  })
}
