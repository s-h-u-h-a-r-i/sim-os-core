import { useCallback, useMemo, useState } from 'react';

import type { PanelLogEntry } from './types';

/**
 * Append-only React memory store for panel logs (clears on full page reload only).
 * When the cap is exceeded, oldest rows are dropped first (FIFO).
 */

/** Rows kept in memory; tune for UI responsiveness vs. history length. */
const PANEL_LOG_MAX_ENTRIES = 1000;

export interface InMemoryLogs {
  entries: readonly PanelLogEntry[];
  append: (row: PanelLogEntry) => void;
  appendMany: (rows: PanelLogEntry[]) => void;
  clear: () => void;
}

export function useInMemoryLogs(maxEntries = PANEL_LOG_MAX_ENTRIES): InMemoryLogs {
  const [entries, setEntries] = useState<PanelLogEntry[]>([]);

  const append = useCallback(
    (row: PanelLogEntry) => {
      setEntries((prev) => {
        const next = [...prev, row];
        if (next.length <= maxEntries) return next;
        return next.slice(-maxEntries);
      });
    },
    [maxEntries]
  );

  const appendMany = useCallback(
    (rows: PanelLogEntry[]) => {
      if (rows.length === 0) return;
      setEntries((prev) => {
        const next = [...prev, ...rows];
        if (next.length <= maxEntries) return next;
        return next.slice(-maxEntries);
      });
    },
    [maxEntries]
  );

  const clear = useCallback(() => {
    setEntries([]);
  }, []);

  return useMemo(
    () => ({
      entries,
      append,
      appendMany,
      clear,
    }),
    [entries, append, appendMany, clear]
  );
}
