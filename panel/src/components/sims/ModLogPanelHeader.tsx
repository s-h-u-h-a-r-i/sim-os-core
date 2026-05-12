import type { ReactNode } from 'react'

import './ModLogPanelHeader.css'

export interface ModLogPanelHeaderProps {
  readonly title: string
  readonly subtitle?: ReactNode
  readonly onClose: () => void
  readonly closeAriaLabel?: string
}

export function ModLogPanelHeader({
  title,
  subtitle,
  onClose,
  closeAriaLabel = 'Close',
}: ModLogPanelHeaderProps) {
  return (
    <div className="mod-log-panel-header">
      <div className="mod-log-panel-title-block">
        <h2 className="mod-log-title">{title}</h2>
        {subtitle != null ? <div className="mod-log-panel-sub">{subtitle}</div> : null}
      </div>
      <button
        type="button"
        className="mod-log-close-btn"
        onClick={onClose}
        aria-label={closeAriaLabel}
      >
        ×
      </button>
    </div>
  )
}
