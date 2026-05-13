import { useMemo } from 'react'
import { ModLogCount, ModLogPanelHeader, SimCard } from '../../components/sims'
import type { TrackedSim } from './types'
import { useSimPins } from './useSimPins'
import { useSimRoster } from './useSimRoster'
import { useWorldStateStream } from './useWorldStateStream'

import './simsPanel.css'

function sortSims(list: TrackedSim[], pinnedIds: ReadonlySet<string>): TrackedSim[] {
  return [...list].sort((a, b) => {
    const pa = pinnedIds.has(a.sim_id)
    const pb = pinnedIds.has(b.sim_id)
    if (pa !== pb) return pa ? -1 : 1
    return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
  })
}

export default function SimsPanel() {
  const { instanced, offInstance, handleWorldState } = useSimRoster()
  const { pinnedIds, togglePin } = useSimPins()
  useWorldStateStream(handleWorldState)

  const sortedInstanced = useMemo(
    () => sortSims(instanced, pinnedIds),
    [instanced, pinnedIds],
  )

  const sortedOffInstance = useMemo(
    () => sortSims(offInstance, pinnedIds),
    [offInstance, pinnedIds],
  )

  return (
    <main className="sims-panel">
      <ModLogPanelHeader
        title="Sims"
        toolbar={<ModLogCount>{instanced.length} on lot</ModLogCount>}
      />
      <div className="sims-panel__body">
        {sortedInstanced.length === 0 && sortedOffInstance.length === 0 ? (
          <p className="sims-panel__empty">No sims on lot</p>
        ) : null}
        <div className="sims-panel__grid">
          {sortedInstanced.map((s) => (
            <SimCard
              key={s.sim_id}
              sim={s}
              isPinned={pinnedIds.has(s.sim_id)}
              onTogglePin={togglePin}
            />
          ))}
        </div>
        {sortedOffInstance.length > 0 && (
          <>
            <div className="sims-panel__section-divider">
              <span className="sims-panel__section-label">Off Lot</span>
            </div>
            <div className="sims-panel__grid">
              {sortedOffInstance.map((s) => (
                <SimCard
                  key={s.sim_id}
                  sim={s}
                  isPinned={pinnedIds.has(s.sim_id)}
                  onTogglePin={togglePin}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
