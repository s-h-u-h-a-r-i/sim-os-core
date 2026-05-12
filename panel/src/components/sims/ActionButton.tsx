import type { ButtonHTMLAttributes } from 'react'

import './ActionButton.css'

export type ActionButtonVariant = 'primary' | 'secondary'

export interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ActionButtonVariant
  compact?: boolean
}

export function ActionButton({
  variant = 'primary',
  compact = false,
  className,
  type = 'button',
  ...rest
}: ActionButtonProps) {
  const classes = [
    'action-btn',
    variant === 'secondary' && 'action-btn--secondary',
    compact && 'action-btn--compact',
    className,
  ]
    .filter(Boolean)
    .join(' ')
  return <button type={type} className={classes} {...rest} />
}
