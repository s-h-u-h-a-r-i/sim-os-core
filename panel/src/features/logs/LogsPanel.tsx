import { For, createEffect, createMemo, createSignal, onMount } from 'solid-js'
import type { JSX } from 'solid-js'
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
const SHEET_DRAG_COLLAPSE_EPS_REM = 0.125
const DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX = 520
const LOG_SCROLL_STICK_BOTTOM_PX = 48

function scrollWrapIsNearBottom(el: HTMLDivElement): boolean {
  return el.scrollHeight - el.scrollTop - el.clientHeight <= LOG_SCROLL_STICK_BOTTOM_PX
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

function filterEntries(list: readonly PanelLogEntry[], levelFilter: LevelFilter): PanelLogEntry[] {
  if (levelFilter === 'all') {
    return [...list]
  }
  return list.filter((e) => e.level === levelFilter)
}

export default function LogsPanel() {
  const { entries, append, clear } = useInMemoryLogs()
  useWsLogStream(append)

  const [dockOpen, setDockOpen] = createSignal(false)
  const [sheetHeightRem, setSheetHeightRem] = createSignal(DEFAULT_SHEET_REM)
  const [levelFilter, setLevelFilter] = createSignal<LevelFilter>('all')

  let dragState: { startY: number; startH: number } | null = null
  let tableWrapRef: HTMLDivElement | undefined
  let stickToBottom = true
  let viewportH =
    typeof window === 'undefined' ? DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX + 1 : window.innerHeight

  const onTableWrapScroll: JSX.EventHandler<HTMLDivElement, Event> = (e) => {
    stickToBottom = scrollWrapIsNearBottom(e.currentTarget)
  }

  onMount(() => {
    const onResize = () => {
      const h = window.innerHeight
      setSheetHeightRem((rem) => clampSheetHeightRem(rem))
      if (viewportH > DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX && h <= DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX) {
        setDockOpen(false)
      }
      viewportH = h
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  const openDock = () => {
    setDockOpen(true)
    if (typeof window === 'undefined') {
      return
    }
    if (window.innerHeight <= DOCK_COLLAPSE_VIEWPORT_HEIGHT_PX) {
      setSheetHeightRem((rem) =>
        clampSheetHeightRem(Math.max(rem, DEFAULT_SHEET_REM, MIN_SHEET_REM + 2.5)),
      )
    }
  }

  const filteredEntries = createMemo(() => filterEntries(entries(), levelFilter()))

  createEffect(() => {
    filteredEntries()
    if (!dockOpen()) {
      return
    }
    const el = tableWrapRef
    if (!el || !stickToBottom) {
      return
    }
    el.scrollTop = el.scrollHeight - el.clientHeight
  })

  const onHandlePointerDown: JSX.EventHandler<HTMLDivElement, PointerEvent> = (e) => {
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragState = { startY: e.clientY, startH: sheetHeightRem() }
  }

  const onHandlePointerMove: JSX.EventHandler<HTMLDivElement, PointerEvent> = (e) => {
    if (!dragState) {
      return
    }
    const deltaPx = dragState.startY - e.clientY
    const deltaRem = deltaPx / rootFontPx()
    setSheetHeightRem(clampSheetHeightRem(dragState.startH + deltaRem))
  }

  const onHandlePointerUp: JSX.EventHandler<HTMLDivElement, PointerEvent> = (e) => {
    dragState = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    setSheetHeightRem((rem) => {
      if (rem <= MIN_SHEET_REM + SHEET_DRAG_COLLAPSE_EPS_REM) {
        setDockOpen(false)
      }
      return rem
    })
  }

  return (
    <div class="logs-dock-root" data-open={dockOpen() ? 'true' : 'false'}>
      <button
        type="button"
        class="logs-dock-tray"
        onClick={openDock}
        aria-expanded={dockOpen()}
        aria-controls="logs-dock-sheet"
      >
        <span class="logs-dock-tray-title">sim_os logs</span>
        <span class="logs-dock-tray-meta">
          {entries().length} row{entries().length === 1 ? '' : 's'}
        </span>
        <span class="logs-dock-tray-chevron" aria-hidden>
          {dockOpen() ? '▼' : '▲'}
        </span>
      </button>

      <div
        id="logs-dock-sheet"
        class="logs-dock-sheet"
        style={{ height: dockOpen() ? `${sheetHeightRem()}rem` : '0' }}
        role="region"
        aria-label="Structured log stream"
        hidden={!dockOpen()}
      >
        <div
          class="logs-dock-handle"
          onPointerDown={onHandlePointerDown}
          onPointerMove={onHandlePointerMove}
          onPointerUp={onHandlePointerUp}
          onPointerCancel={onHandlePointerUp}
          role="separator"
          aria-orientation="horizontal"
          aria-valuenow={Math.round(sheetHeightRem() * rootFontPx())}
          tabIndex={0}
        >
          <span class="logs-dock-handle-grip" />
        </div>

        <div class="logs-shell">
          <header class="logs-header">
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
                      value={levelFilter()}
                      onChange={setLevelFilter}
                      listboxAriaLabel="Log level filter"
                    />
                  </ToolbarField>

                  <ModLogCount>
                    {filteredEntries().length} shown
                    {filteredEntries().length !== entries().length ? ` · ${entries().length} total` : ''}
                  </ModLogCount>
                </>
              }
            />
          </header>

          <div
            ref={tableWrapRef}
            class="logs-table-wrap"
            onScroll={onTableWrapScroll}
          >
            <table class="logs-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Type</th>
                  <th>Key</th>
                  <th>Message</th>
                </tr>
              </thead>
              <tbody>
                <For each={filteredEntries()}>
                  {(e) => (
                    <tr data-level={e.level}>
                      <td class="cell-ts">{formatLogTimestamp(e.ts)}</td>
                      <td class="cell-level">{e.level}</td>
                      <td class="cell-key">{e.key}</td>
                      <td class="cell-msg">{e.message}</td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
