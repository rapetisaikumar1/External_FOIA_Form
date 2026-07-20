import Field from './Field'
import type { Option } from '../../lib/formConfig'

export interface SelectInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  required?: boolean
  optional?: boolean
  hint?: string
  error?: string
}

export default function SelectInput({
  id,
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  required,
  optional,
  hint,
  error,
}: SelectInputProps) {
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
      <select
        id={id}
        className={`select${error ? ' select--error' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </Field>
  )
}
