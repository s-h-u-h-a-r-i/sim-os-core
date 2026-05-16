import { Show } from 'solid-js'
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

export function SimCard(props: SimCardProps) {
  const activeInteractions = () => props.sim.interactions_running.filter((i) => i.category === 'active')
  const passiveInteractions = () => props.sim.interactions_running.filter((i) => i.category === 'passive')

  return (
    <article
      class="sim-card"
      data-instanced={props.sim.instanced ? 'true' : 'false'}
      data-pinned={props.isPinned ? 'true' : 'false'}
    >
      <header class="sim-card__header">
        <div class="sim-card__identity">
          <span class="sim-card__name">
            {props.sim.first_name} {props.sim.last_name}
          </span>
          <div class="sim-card__tags">
            <Show when={props.sim.age}>
              <span class="sim-card__tag sim-card__tag--age">{props.sim.age?.replace('_', ' ')}</span>
            </Show>
            <Show when={props.sim.is_npc}>
              <span class="sim-card__tag sim-card__tag--npc">NPC</span>
            </Show>
            <Show when={!props.sim.instanced}>
              <span class="sim-card__tag sim-card__tag--away">Away</span>
            </Show>
          </div>
        </div>
        <button
          type="button"
          class="sim-card__pin-btn"
          onClick={() => props.onTogglePin(props.sim.sim_id)}
          aria-pressed={props.isPinned}
          aria-label={props.isPinned ? 'Unpin sim' : 'Pin sim'}
        >
          <Show when={props.isPinned} fallback={<Pin size={15} />}>
            <PinOff size={15} />
          </Show>
        </button>
      </header>

      <Show when={activeInteractions().length > 0}>
        <InteractionList label="Active" interactions={activeInteractions()} variant="active" />
      </Show>
      <Show when={props.sim.interactions_queue.length > 0}>
        <InteractionList label="Planned" interactions={props.sim.interactions_queue} variant="queued" />
      </Show>
      <Show when={passiveInteractions().length > 0}>
        <InteractionList label="Passive" interactions={passiveInteractions()} variant="passive" />
      </Show>
    </article>
  )
}
