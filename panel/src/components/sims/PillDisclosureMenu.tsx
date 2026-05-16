import { For, Show, createMemo, createSignal, onCleanup, createEffect } from 'solid-js'

import './PillDisclosureMenu.css'

export interface PillDisclosureOption<T extends string> {
  readonly value: T
  readonly label: string
}

export interface PillDisclosureMenuProps<T extends string> {
  readonly options: readonly PillDisclosureOption<T>[]
  readonly value: T
  readonly onChange: (next: T) => void
  readonly listboxAriaLabel: string
}

export function PillDisclosureMenu<T extends string>(props: PillDisclosureMenuProps<T>) {
  const [open, setOpen] = createSignal(false)
  let rootRef: HTMLDivElement | undefined

  const selectedLabel = createMemo(
    () => props.options.find((o) => o.value === props.value)?.label ?? String(props.value),
  )

  createEffect(() => {
    if (!open()) {
      return
    }
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef
      if (el && !el.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    onCleanup(() => document.removeEventListener('mousedown', onDocMouseDown))
  })

  return (
    <div
      ref={rootRef}
      class="sims-pill-disclosure"
      data-open={open() ? 'true' : 'false'}
    >
      <button
        type="button"
        class="sims-pill-disclosure__trigger"
        aria-expanded={open()}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
      >
        <span class="sims-pill-disclosure__value">{selectedLabel()}</span>
        <span class="sims-pill-disclosure__chevron" aria-hidden>
          &#9660;
        </span>
      </button>
      <Show when={open()}>
        <ul
          class="sims-pill-disclosure__menu"
          role="listbox"
          aria-label={props.listboxAriaLabel}
        >
          <For each={props.options}>
            {(opt) => (
              <li role="none">
                <button
                  type="button"
                  class="sims-pill-disclosure__option"
                  role="option"
                  aria-selected={props.value === opt.value}
                  onClick={() => {
                    props.onChange(opt.value)
                    setOpen(false)
                  }}
                >
                  {opt.label}
                </button>
              </li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  )
}
