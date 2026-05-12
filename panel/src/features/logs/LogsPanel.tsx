import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type UIEvent,
} from 'react'
import {
  ActionButton,
  ModLogCount,
  ModLogPanelHeader,
  ModLogToolbarBtns,
  PillDisclosureMenu,
  ToolbarField,
} from '../../components/sims'
import { formatLogTimestamp } from './formatLogRow'
import type { LogLevel, PanelLogEntry } from './types'
import { useInMemoryLogs } from './useInMemoryLogs'
import { useWsLogStream } from './useWsLogStream'

import './logsPanel.css'

const MIN_SHEET_REM = 10
const DEFAULT_SHEET_REM = 20

/** If the user releases the resize handle at (nominal) minimum height, hide the sheet like the old close control. */
const SHEET_DRAG_COLLAPSE_EPS_REM = 0.125

/** Collapse dock when viewport height crosses down through this value (edge-triggered; avoids instant re-close after tray open on short viewports). */
const DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX = 520

/** Distance from the bottom of the log scroller to still count as “at bottom” for live follow. */
const LOG_SCROLL_STICK_BOTTOM_PX = 48

function scrollWrapIsNearBottom(el: HTMLDivElement): boolean {
  return (
    el.scrollHeight - el.scrollTop - el.clientHeight <= LOG_SCROLL_STICK_BOTTOM_PX
  )
}

function rootFontPx(): number {
  if (typeof document === 'undefined') {
    return 16
  }
  return parseFloat(getComputedStyle(document.documentElement).fontSize)
}

function clampSheetHeightRem(rem: number): number {
  if (typeof window === 'undefined') {
    return rem
  }
  const maxRem = (window.innerHeight * 0.92) / rootFontPx()
  return Math.max(MIN_SHEET_REM, Math.min(maxRem, rem))
}

type LevelFilter = 'all' | LogLevel

const FILTER_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'All levels' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' },
  { value: 'warn', label: 'Warn' },
  { value: 'error', label: 'Error' },
]

function filterEntries(
  list: readonly PanelLogEntry[],
  levelFilter: LevelFilter,
): PanelLogEntry[] {
  if (levelFilter === 'all') {
    return [...list]
  }
  return list.filter((e) => e.level === levelFilter)
}

/** In-memory structured log table in a bottom dock; live rows from ModBridge ``/ws``. */

export default function LogsPanel() {
  const { entries, append, clear } = useInMemoryLogs()
  useWsLogStream(append)

  const [dockOpen, setDockOpen] = useState(false)
  const [sheetHeightRem, setSheetHeightRem] = useState(DEFAULT_SHEET_REM)
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all')
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)
  const tableWrapRef = useRef<HTMLDivElement | null>(null)
  /** When true, new rows scroll the table to the end; scrolling up clears this until the user nears the bottom again. */
  const stickToBottomRef = useRef(true)
  const viewportHRef = useRef(
    typeof window === 'undefined' ? DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX + 1 : window.innerHeight,
  )

  const onTableWrapScroll = useCallback((e: UIEvent<HTMLDivElement>) => {
    stickToBottomRef.current = scrollWrapIsNearBottom(e.currentTarget)
  }, [])

  useEffect(() => {
    function onResize() {
      const h = window.innerHeight
      setSheetHeightRem((rem) => clampSheetHeightRem(rem))
      if (
        viewportHRef.current > DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX &&
        h <= DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX
      ) {
        setDockOpen(false)
      }
      viewportHRef.current = h
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const openDock = useCallback(() => {
    setDockOpen(true)
    if (typeof window === 'undefined') {
      return
    }
    if (window.innerHeight <= DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX) {
      setSheetHeightRem((rem) =>
        clampSheetHeightRem(Math.max(rem, DEFAULT_SHEET_REM, MIN_SHEET_REM + 2.5)),
      )
    }
  }, [])

  const filteredEntries = useMemo(
    () => filterEntries(entries, levelFilter),
    [entries, levelFilter],
  )

  useLayoutEffect(() => {
    if (!dockOpen) {
      return
    }
    const el = tableWrapRef.current
    if (!el || !stickToBottomRef.current) {
      return
    }
    el.scrollTop = el.scrollHeight - el.clientHeight
  }, [filteredEntries, dockOpen])

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

  const onHandlePointerDown = useCallback((e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startY: e.clientY, startH: sheetHeightRem }
  }, [sheetHeightRem])

  const onHandlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) {
      return
    }
    const deltaPx = dragRef.current.startY - e.clientY
    const deltaRem = deltaPx / rootFontPx()
    setSheetHeightRem(clampSheetHeightRem(dragRef.current.startH + deltaRem))
  }, [])

  const onHandlePointerUp = useCallback((e: PointerEvent<HTMLDivElement>) => {
    dragRef.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setSheetHeightRem((rem) => {
      if (rem <= MIN_SHEET_REM + SHEET_DRAG_COLLAPSE_EPS_REM) {
        setDockOpen(false)
      }
      return rem
    })
  }, [])

  return (
    <div className="logs-dock-root" data-open={dockOpen ? 'true' : 'false'}>
      <button
        type="button"
        className="logs-dock-tray"
        onClick={openDock}
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
        style={{ height: dockOpen ? `${sheetHeightRem}rem` : 0 }}
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
          aria-valuenow={Math.round(sheetHeightRem * rootFontPx())}
          tabIndex={0}
        >
          <span className="logs-dock-handle-grip" />
        </div>

        <div className="logs-shell">
          <header className="logs-header">
            <ModLogPanelHeader
              title="sim_os logs"
              toolbar={
                <>
                  <ModLogToolbarBtns>
                    <ActionButton variant="secondary" compact onClick={clear}>
                      Clear
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

                  <ModLogCount>
                    {filteredEntries.length} shown
                    {filteredEntries.length !== entries.length ? ` · ${entries.length} total` : ''}
                  </ModLogCount>
                </>
              }
            />
          </header>

          <div
            ref={tableWrapRef}
            className="logs-table-wrap"
            onScroll={onTableWrapScroll}
          >
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
