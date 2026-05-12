import type { ReactNode } from 'react'

import './ModLogPanelHeader.css'

export interface ModLogPanelHeaderProps {
  readonly title: string
  /** Inline actions (e.g. clear, filters, count) — same row as title. */
  readonly toolbar?: ReactNode
}

export function ModLogPanelHeader({ title, toolbar }: ModLogPanelHeaderProps) {
  return (
    <div className="mod-log-panel-header">
      <div className="mod-log-panel-title-block">
        <h1>{title}</h1>
      </div>
      {toolbar != null ? <div className="mod-log-panel-actions">{toolbar}</div> : null}
    </div>
  )
}
