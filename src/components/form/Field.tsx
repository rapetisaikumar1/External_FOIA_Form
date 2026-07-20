import type { ReactNode } from 'react'

export interface FieldProps {
  /** Matches the control's id so the label is clickable + accessible. */
  id?: string
  label: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  /** ids placed on the hint/error text so a control can aria-describedby them. */
  hintId?: string
  errorId?: string
  className?: string
  children: ReactNode
}

/**
 * Label + hint + error wrapper shared by every text-style control.
 * Keeping this in one place gives all fields consistent spacing and a11y.
 */
export default function Field({
  id,
  label,
  required,
  optional,
  hint,
  error,
  hintId,
  errorId,
  className,
  children,
}: FieldProps) {
  return (
    <div className={`field${className ? ` ${className}` : ''}`}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="field__req" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="field__optional">(optional)</span>}
      </label>
      {children}
      {hint && !error && (
        <span className="field__hint" id={hintId}>
          {hint}
        </span>
      )}
      {error && (
        <span className="field__error" id={errorId} role="alert">
          {error}
        </span>
      )}
    </div>
  )
}
