import Pin from '../../icons/pin'
import PinOff from '../../icons/pin-off'

import type { TrackedSim } from '../../features/sims/types'
import { InteractionList } from './InteractionList'

import './SimCard.css'

export interface SimCardProps {
  sim: TrackedSim
  isPinned: boolean
  onTogglePin: (simId: string) => void
}

export function SimCard({ sim, isPinned, onTogglePin }: SimCardProps) {
  const activeInteractions = sim.interactions_running.filter((i) => i.category === 'active')
  const passiveInteractions = sim.interactions_running.filter((i) => i.category === 'passive')

  return (
    <article
      className="sim-card"
      data-instanced={sim.instanced ? 'true' : 'false'}
      data-pinned={isPinned ? 'true' : 'false'}
    >
      <header className="sim-card__header">
        <div className="sim-card__identity">
          <span className="sim-card__name">
            {sim.first_name} {sim.last_name}
          </span>
          <div className="sim-card__tags">
            {sim.age && <span className="sim-card__tag sim-card__tag--age">{sim.age.replace('_', ' ')}</span>}
            {sim.is_npc && <span className="sim-card__tag sim-card__tag--npc">NPC</span>}
            {!sim.instanced && <span className="sim-card__tag sim-card__tag--away">Away</span>}
          </div>
        </div>
        <button
          type="button"
          className="sim-card__pin-btn"
          onClick={() => onTogglePin(sim.sim_id)}
          aria-pressed={isPinned}
          aria-label={isPinned ? 'Unpin sim' : 'Pin sim'}
        >
          {isPinned ? <PinOff size={15} /> : <Pin size={15} />}
        </button>
      </header>

      {activeInteractions.length > 0 && (
        <InteractionList label="Active" interactions={activeInteractions} variant="active" />
      )}
      {sim.interactions_queue.length > 0 && (
        <InteractionList label="Planned" interactions={sim.interactions_queue} variant="queued" />
      )}
      {passiveInteractions.length > 0 && (
        <InteractionList label="Passive" interactions={passiveInteractions} variant="passive" />
      )}
    </article>
  )
}
