import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
} from 'react'
import {
  ActionButton,
  ModLogCount,
  ModLogPanelHeader,
  ModLogToolbar,
  ModLogToolbarBtns,
  PillDisclosureMenu,
  ToolbarField,
  ToolbarLabeledControl,
} from '../../components/sims'
import { formatLogTimestamp } from './formatLogRow'
import type { LogLevel, PanelLogEntry } from './types'
import { useInMemoryLogs } from './useInMemoryLogs'
import { useWsLogStream } from './useWsLogStream'

import './logsPanel.css'

const MIN_SHEET_PX = 160
const DEFAULT_SHEET_PX = 320

type LevelFilter = 'all' | LogLevel

const FILTER_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'All levels' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
]

function clampSheetHeight(px: number): number {
  if (typeof window === 'undefined') {
    return px
  }
  const max = Math.floor(window.innerHeight * 0.92)
  return Math.max(MIN_SHEET_PX, Math.min(max, px))
}

function filterEntries(
  list: readonly PanelLogEntry[],
  levelFilter: LevelFilter,
  showDebug: boolean,
): PanelLogEntry[] {
  if (levelFilter === 'all' && !showDebug) {
    return list.filter((e) => e.level !== 'debug')
  }
  if (levelFilter !== 'all') {
    return list.filter((e) => e.level === levelFilter)
  }
  return [...list]
}

/** In-memory structured log table in a bottom dock; live rows from ModBridge ``/ws``. */

export default function LogsPanel() {
  const { entries, append, clear } = useInMemoryLogs()
  useWsLogStream(append)

  const [dockOpen, setDockOpen] = useState(true)
  const [sheetHeight, setSheetHeight] = useState(DEFAULT_SHEET_PX)
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const [showDebug, setShowDebug] = useState(true)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)

  useEffect(() => {
    function onResize() {
      setSheetHeight((h) => clampSheetHeight(h))
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const filteredEntries = useMemo(
    () => filterEntries(entries, levelFilter, showDebug),
    [entries, levelFilter, showDebug],
  )

  const rows = useMemo(
    () =>
      filteredEntries.map((e: PanelLogEntry, i: number) => (
        <tr key={`${e.ts}-${i}-${e.key}`} data-level={e.level}>
          <td className="cell-ts">{formatLogTimestamp(e.ts)}</td>
          <td className="cell-level">{e.level}</td>
          <td className="cell-key">{e.key}</td>
          <td className="cell-msg">{e.message}</td>
        </tr>
      )),
    [filteredEntries],
  )

  function pushDemo(): void {
    append({
      ts: Date.now() / 1000,
      level: 'info',
      key: 'panel.demo',
      message: 'Sample in-memory row.',
    })
  }

  const onHandlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startH: sheetHeight }
  }, [sheetHeight])

  const onHandlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return
    }
    const delta = dragRef.current.startY - e.clientY
    setSheetHeight(clampSheetHeight(dragRef.current.startH + delta))
  }, [])

  const onHandlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
  }, [])

  const debugCheckboxDisabled = levelFilter !== 'all'

  return (
    <div className="logs-dock-root" data-open={dockOpen ? 'true' : 'false'}>
      <button
        type="button"
        className="logs-dock-tray"
        onClick={() => setDockOpen(true)}
        aria-expanded={dockOpen}
        aria-controls="logs-dock-sheet"
      >
        <span className="logs-dock-tray-title">sim_os logs</span>
        <span className="logs-dock-tray-meta">
          {entries.length} row{entries.length === 1 ? '' : 's'}
        </span>
        <span className="logs-dock-tray-chevron" aria-hidden>
          {dockOpen ? '▼' : '▲'}
        </span>
      </button>

      <div
        id="logs-dock-sheet"
        className="logs-dock-sheet"
        style={{ height: dockOpen ? sheetHeight : 0 }}
        role="region"
        aria-label="Structured log stream"
        hidden={!dockOpen}
      >
        <div
          className="logs-dock-handle"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          role="separator"
          aria-orientation="horizontal"
          aria-valuenow={Math.round(sheetHeight)}
          tabIndex={0}
        >
          <span className="logs-dock-handle-grip" />
        </div>

        <div className="logs-shell">
          <header className="logs-header">
            <ModLogPanelHeader
              title="sim_os logs"
              closeAriaLabel="Hide log panel"
              onClose={() => setDockOpen(false)}
              subtitle={
                <>
                  Rows stay in memory until you reload. Live lines arrive over a WebSocket to this
                  origin&apos;s <code className="logs-inline-code">/ws</code> (the mod listens on
                  loopback only).
                </>
              }
            />

            <ModLogToolbar>
              <ModLogToolbarBtns>
                <ActionButton variant="secondary" compact onClick={clear}>
                  Clear
                </ActionButton>
                <ActionButton compact onClick={pushDemo}>
                  Add demo row
                </ActionButton>
              </ModLogToolbarBtns>

              <ToolbarField label="Level">
                <PillDisclosureMenu<LevelFilter>
                  options={FILTER_OPTIONS}
                  value={levelFilter}
                  onChange={setLevelFilter}
                  listboxAriaLabel="Log level filter"
                />
              </ToolbarField>

              <ToolbarLabeledControl label="Debug" disabled={debugCheckboxDisabled}>
                <input
                  type="checkbox"
                  className="sims-toolbar-checkbox"
                  checked={showDebug}
                  disabled={debugCheckboxDisabled}
                  onChange={(e) => setShowDebug(e.target.checked)}
                />
              </ToolbarLabeledControl>

              <ModLogCount>
                {filteredEntries.length} shown
                {filteredEntries.length !== entries.length ? ` · ${entries.length} total` : ''}
              </ModLogCount>
            </ModLogToolbar>
          </header>

          <div className="logs-table-wrap">
            <table className="logs-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Key</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
