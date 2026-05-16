import { createMemo, createSignal } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { TrackedSim, WorldStateWire } from './types'

export interface SimRoster {
  instanced: Accessor<TrackedSim[]>
  offInstance: Accessor<TrackedSim[]>
}

export function useSimRoster(): SimRoster & { handleWorldState: (state: WorldStateWire) => void } {
  const [simMap, setSimMap] = createSignal<ReadonlyMap<string, TrackedSim>>(new Map())

  const handleWorldState = (state: WorldStateWire) => {
    setSimMap((prev) => {
      const next = new Map(prev)
      for (const [id, sim] of next) {
        next.set(id, { ...sim, instanced: false })
      }
      for (const sim of state.sims) {
        next.set(sim.sim_id, { ...sim, instanced: true })
      }
      return next
    })
  }

  const instanced = createMemo(() => [...simMap().values()].filter((s) => s.instanced))

  const offInstance = createMemo(() => [...simMap().values()].filter((s) => !s.instanced))

  return { instanced, offInstance, handleWorldState }
}
