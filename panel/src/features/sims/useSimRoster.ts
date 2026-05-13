import { useCallback, useMemo, useState } from 'react'
import type { TrackedSim, WorldStateWire } from './types'

export interface SimRoster {
  instanced: TrackedSim[]
  offInstance: TrackedSim[]
}

export function useSimRoster(): SimRoster & { handleWorldState: (state: WorldStateWire) => void } {
  const [simMap, setSimMap] = useState<ReadonlyMap<string, TrackedSim>>(new Map())

  const handleWorldState = useCallback((state: WorldStateWire) => {
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
  }, [])

  const instanced = useMemo(
    () => [...simMap.values()].filter((s) => s.instanced),
    [simMap],
  )

  const offInstance = useMemo(
    () => [...simMap.values()].filter((s) => !s.instanced),
    [simMap],
  )

  return { instanced, offInstance, handleWorldState }
}
