import type { JSXElement } from 'solid-js'

import './Toolbar.css'

export function ModLogToolbarBtns(props: { children: JSXElement }) {
  return <div class="mod-log-toolbar-btns">{props.children}</div>
}

export function ToolbarField(props: {
  label: string
  children: JSXElement
  disabled?: boolean
}) {
  const cls = ['toolbar-field', props.disabled && 'toolbar-field--disabled'].filter(Boolean).join(' ')
  return (
    <div class={cls}>
      <span class="toolbar-label">{props.label}</span>
      {props.children}
    </div>
  )
}

export function ModLogCount(props: { children: JSXElement }) {
  return <span class="mod-log-count">{props.children}</span>
}
