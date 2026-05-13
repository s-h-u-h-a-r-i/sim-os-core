export type InteractionCategory = 'active' | 'passive'

export interface RunningInteractionWire {
  interaction_id: number
  interaction_id_str: string
  class_name: string
  category: InteractionCategory
  source_name: string
}

export interface QueuedInteractionWire {
  interaction_id: number
  interaction_id_str: string
  class_name: string
  is_queue_head: boolean
}

export interface SerializedSimWire {
  sim_id: string
  sim_id_str: string
  first_name: string
  last_name: string
  age: string | null
  gender: string | null
  is_npc: boolean
  household_id: number | null
  zone_id: number | null
  interactions_running: RunningInteractionWire[]
  interactions_queue: QueuedInteractionWire[]
  social_partner_sim_ids: string[]
}

export interface WorldStateWire {
  lot_id: number | null
  zone_id: number | null
  sims: SerializedSimWire[]
}

export interface TrackedSim extends SerializedSimWire {
  instanced: boolean
}

export function asWorldStateWire(raw: unknown): WorldStateWire | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  if (o.type !== 'log') return null
  const fields = o.fields
  if (typeof fields !== 'object' || fields === null) return null
  const state = (fields as Record<string, unknown>).state
  if (typeof state !== 'object' || state === null) return null
  const s = state as Record<string, unknown>
  if (!Array.isArray(s.sims)) return null
  return state as WorldStateWire
}
