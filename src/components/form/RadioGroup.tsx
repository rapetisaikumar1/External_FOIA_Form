import type { Option } from '../../lib/formConfig'

export interface RadioGroupProps {
  legend: string
  name: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  columns?: 1 | 2 | 3
  required?: boolean
  hint?: string
}

/** Single-select group rendered as accessible, card-style options. */
export default function RadioGroup({
  legend,
  name,
  value,
  onChange,
  options,
  columns = 1,
  required,
  hint,
}: RadioGroupProps) {
  return (
    <fieldset className="fieldset">
      <legend className="legend">
        {legend}
        {required && (
          <span className="field__req" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <div className={`choice-group${columns > 1 ? ` choice-group--${columns}` : ''}`}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`
          return (
            <label key={opt.value} className="choice" htmlFor={id}>
              <input
                id={id}
                className="choice__input"
                type="radio"
                name={name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                aria-required={required || undefined}
                required={required || undefined}
              />
              <span className="choice__text">
                <span className="choice__label">{opt.label}</span>
                {opt.desc && <span className="choice__desc">{opt.desc}</span>}
              </span>
            </label>
          )
        })}
      </div>
      {hint && <span className="field__hint hint-below">{hint}</span>}
    </fieldset>
  )
}
