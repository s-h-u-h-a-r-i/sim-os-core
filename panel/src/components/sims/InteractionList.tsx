import type { QueuedInteractionWire, RunningInteractionWire } from '../../features/sims/types'
import { formatInteractionName } from '../../features/sims/interactionUtils'

import './InteractionList.css'

export type InteractionListVariant = 'active' | 'queued' | 'passive'

export interface InteractionListProps {
  label: string
  interactions: RunningInteractionWire[] | QueuedInteractionWire[]
  variant: InteractionListVariant
}

export function InteractionList({ label, interactions, variant }: InteractionListProps) {
  return (
    <section className="interaction-list" data-variant={variant}>
      <span className="interaction-list__label">{label}</span>
      <ul className="interaction-list__items">
        {interactions.map((i) => (
          <li key={i.interaction_id_str} className="interaction-list__item">
            {formatInteractionName(i.class_name)}
            {'source_name' in i && (
              <span className="interaction-list__source">{i.source_name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
