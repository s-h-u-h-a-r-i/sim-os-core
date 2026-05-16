import { For, Show } from 'solid-js'

import type { QueuedInteractionWire, RunningInteractionWire } from '../../features/sims/types'
import { formatInteractionName } from '../../features/sims/interactionUtils'

import './InteractionList.css'

export type InteractionListVariant = 'active' | 'queued' | 'passive'

export interface InteractionListProps {
  label: string
  interactions: RunningInteractionWire[] | QueuedInteractionWire[]
  variant: InteractionListVariant
}

export function InteractionList(props: InteractionListProps) {
  return (
    <section class="interaction-list" data-variant={props.variant}>
      <span class="interaction-list__label">{props.label}</span>
      <ul class="interaction-list__items">
        <For each={props.interactions}>
          {(i) => (
            <li class="interaction-list__item">
              {formatInteractionName(i.class_name)}
              <Show when={'source_name' in i}>
                <span class="interaction-list__source">{(i as RunningInteractionWire).source_name}</span>
              </Show>
            </li>
          )}
        </For>
      </ul>
    </section>
  )
}
