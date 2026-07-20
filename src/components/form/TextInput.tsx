import Field from './Field'

export interface TextInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'tel' | 'email' | 'date'
  placeholder?: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
  autoComplete?: string
  inputMode?: 'text' | 'tel' | 'email' | 'numeric'
  maxLength?: number
}

export default function TextInput({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  optional,
  hint,
  error,
  autoComplete,
  inputMode,
  maxLength,
}: TextInputProps) {
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
      <input
        id={id}
        className={`input${error ? ' input--error' : ''}`}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
    </Field>
  )
}
