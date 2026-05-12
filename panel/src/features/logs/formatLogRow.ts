import type { PanelLogEntry } from './types'

/** Local time + milliseconds for table display (no extra Intl options for TS lib compatibility). */

export function formatLogTimestamp(tsSeconds: number): string {
  const d = new Date(tsSeconds * 1000)
  const t = d.toLocaleTimeString(undefined, { hour12: false })
  const ms = String(d.getMilliseconds()).padStart(3, '0')
  return `${t}.${ms}`
}

export function logRowLabel(entry: PanelLogEntry): string {
  return `[${formatLogTimestamp(entry.ts)}] [${entry.level}] [${entry.key}] ${entry.message}`
}
