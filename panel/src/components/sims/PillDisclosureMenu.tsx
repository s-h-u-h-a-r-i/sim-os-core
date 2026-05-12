import { useEffect, useRef, useState } from 'react'

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

export function PillDisclosureMenu<T extends string>({
  options,
  value,
  onChange,
  listboxAriaLabel,
}: PillDisclosureMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? String(value)

  useEffect(() => {
    if (!open) {
      return
    }
    function onDocMouseDown(e: MouseEvent) {
      const el = rootRef.current
      if (el && !el.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocMouseDown)
    return () => document.removeEventListener('mousedown', onDocMouseDown)
  }, [open])

  return (
    <div
      ref={rootRef}
      className="sims-pill-disclosure"
      data-open={open ? 'true' : 'false'}
    >
      <button
        type="button"
        className="sims-pill-disclosure__trigger"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="sims-pill-disclosure__value">{selectedLabel}</span>
        <span className="sims-pill-disclosure__chevron" aria-hidden>
          &#9660;
        </span>
      </button>
      {open ? (
        <ul
          className="sims-pill-disclosure__menu"
          role="listbox"
          aria-label={listboxAriaLabel}
        >
          {options.map((opt) => (
            <li key={opt.value} role="none">
              <button
                type="button"
                className="sims-pill-disclosure__option"
                role="option"
                aria-selected={value === opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
