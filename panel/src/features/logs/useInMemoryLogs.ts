import { createSignal } from 'solid-js'

import type { Accessor } from 'solid-js'
import type { PanelLogEntry } from './types'

/** Rows kept in memory; tune for UI responsiveness vs. history length. */
const PANEL_LOG_MAX_ENTRIES = 1000

export interface InMemoryLogs {
  entries: Accessor<readonly PanelLogEntry[]>
  append: (row: PanelLogEntry) => void
  appendMany: (rows: PanelLogEntry[]) => void
  clear: () => void
}

export function useInMemoryLogs(maxEntries = PANEL_LOG_MAX_ENTRIES): InMemoryLogs {
  const [entries, setEntries] = createSignal<PanelLogEntry[]>([])

  const append = (row: PanelLogEntry) => {
    setEntries((prev) => {
      const next = [...prev, row]
      if (next.length <= maxEntries) return next
      return next.slice(-maxEntries)
    })
  }

  const appendMany = (rows: PanelLogEntry[]) => {
    if (rows.length === 0) return
    setEntries((prev) => {
      const next = [...prev, ...rows]
      if (next.length <= maxEntries) return next
      return next.slice(-maxEntries)
    })
  }

  const clear = () => {
    setEntries([])
  }

  return {
    entries,
    append,
    appendMany,
    clear,
  }
}
