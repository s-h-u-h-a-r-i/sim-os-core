import { createSignal } from 'solid-js'

import type { Accessor } from 'solid-js'

const STORAGE_KEY = 'sim_os_pinned_sims'

function loadPins(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return Array.isArray(parsed) ? new Set(parsed as string[]) : new Set()
  } catch {
    return new Set()
  }
}

function savePins(pins: Set<string>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...pins]))
  } catch {
    // localStorage may be unavailable in some contexts
  }
}

export function useSimPins(): { pinnedIds: Accessor<ReadonlySet<string>>; togglePin: (simId: string) => void } {
  const [pinnedIds, setPinnedIds] = createSignal<ReadonlySet<string>>(loadPins())

  const togglePin = (simId: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(simId)) {
        next.delete(simId)
      } else {
        next.add(simId)
      }
      savePins(next)
      return next
    })
  }

  return { pinnedIds, togglePin }
}
