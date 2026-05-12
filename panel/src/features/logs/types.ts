/** Structured log rows — kept only in React state (never persisted here). */

export type LogLevel = 'info' | 'debug' | 'warn' | 'error'

export interface PanelLogEntry {
  ts: number
  level: LogLevel
  key: string
  message: string
}

export interface RawLogEnvelope {
  type: 'log'
  ts: number
  level: string
  key: string
  message: string
  fields?: Record<string, unknown>
}

const LEVELS = new Set<LogLevel>(['info', 'debug', 'warn', 'error'])

function parseLevel(raw: string): LogLevel {
  const l = raw.toLowerCase()
  return LEVELS.has(l as LogLevel) ? (l as LogLevel) : 'info'
}

export function asPanelLogEnvelope(raw: unknown): PanelLogEntry | null {
  if (typeof raw !== 'object' || raw === null) return null
  const o = raw as Record<string, unknown>
  if (o.type !== 'log') return null
  if (typeof o.message !== 'string') return null
  const ts =
    typeof o.ts === 'number' && Number.isFinite(o.ts) ? o.ts : Date.now() / 1000
  const key = typeof o.key === 'string' && o.key.length > 0 ? o.key : 'unknown'
  const level =
    typeof o.level === 'string' ? parseLevel(o.level) : ('info' as const)
  return { ts, level, key, message: o.message }
}
