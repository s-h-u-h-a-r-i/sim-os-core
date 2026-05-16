import { Show, type JSXElement } from 'solid-js'

import './ModLogPanelHeader.css'

export interface ModLogPanelHeaderProps {
  readonly title: string
  readonly toolbar?: JSXElement
}

export function ModLogPanelHeader(props: ModLogPanelHeaderProps) {
  return (
    <div class="mod-log-panel-header">
      <div class="mod-log-panel-title-block">
        <h1>{props.title}</h1>
      </div>
      <Show when={props.toolbar != null}>
        <div class="mod-log-panel-actions">{props.toolbar}</div>
      </Show>
    </div>
  )
}
