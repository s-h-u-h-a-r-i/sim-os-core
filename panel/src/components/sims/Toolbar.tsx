import type { ReactNode } from 'react'

import './Toolbar.css'

export function ModLogToolbar({ children }: { children: ReactNode }) {
  return <div className="mod-log-toolbar">{children}</div>
}

export function ModLogToolbarBtns({ children }: { children: ReactNode }) {
  return <div className="mod-log-toolbar-btns">{children}</div>
}

export function ToolbarField({
  label,
  children,
  disabled = false,
}: {
  label: string
  children: ReactNode
  disabled?: boolean
}) {
  const cls = ['toolbar-field', disabled && 'toolbar-field--disabled']
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls}>
      <span className="toolbar-label">{label}</span>
      {children}
    </div>
  )
}

export function ToolbarLabeledControl({
  label,
  children,
  disabled = false,
}: {
  label: string
  children: ReactNode
  disabled?: boolean
}) {
  const cls = ['toolbar-field', disabled && 'toolbar-field--disabled']
    .filter(Boolean)
    .join(' ')
  return (
    <label className={cls}>
      <span className="toolbar-label">{label}</span>
      {children}
    </label>
  )
}

export function ModLogCount({ children }: { children: ReactNode }) {
  return <span className="mod-log-count">{children}</span>
}
