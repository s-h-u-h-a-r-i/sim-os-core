import { For, Show, createMemo } from 'solid-js'
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

  const sortedInstanced = createMemo(() => sortSims(instanced(), pinnedIds()))

  const sortedOffInstance = createMemo(() => sortSims(offInstance(), pinnedIds()))

  return (
    <main class="sims-panel">
      <ModLogPanelHeader
        title="Sims"
        toolbar={<ModLogCount>{instanced().length} on lot</ModLogCount>}
      />
      <div class="sims-panel__body">
        <Show when={sortedInstanced().length > 0 || sortedOffInstance().length > 0} fallback={<p class="sims-panel__empty">No sims on lot</p>}>
          <div class="sims-panel__grid">
            <For each={sortedInstanced()}>
              {(s) => (
                <SimCard
                  sim={s}
                  isPinned={pinnedIds().has(s.sim_id)}
                  onTogglePin={togglePin}
                />
              )}
            </For>
          </div>
          <Show when={sortedOffInstance().length > 0}>
            <div class="sims-panel__section-divider">
              <span class="sims-panel__section-label">Off Lot</span>
            </div>
            <div class="sims-panel__grid">
              <For each={sortedOffInstance()}>
                {(s) => (
                  <SimCard
                    sim={s}
                    isPinned={pinnedIds().has(s.sim_id)}
                    onTogglePin={togglePin}
                  />
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </main>
  )
}
