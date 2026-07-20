import Field from './Field'

export interface TextAreaProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  maxLength?: number
}

export default function TextArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 6,
  required,
  optional,
  hint,
  error,
  maxLength,
}: TextAreaProps) {
  const hintId = hint && !error ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <Field
      id={id}
      label={label}
      required={required}
      optional={optional}
      hint={hint}
      error={error}
      hintId={hintId}
      errorId={errorId}
    >
      <textarea
        id={id}
        className={`textarea${error ? ' textarea--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        required={required}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
    </Field>
  )
}
