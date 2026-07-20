import type { Option } from '../../lib/formConfig'

export interface CheckboxGroupProps {
  legend: string
  name: string
  values: string[]
  onChange: (values: string[]) => void
  options: Option[]
  columns?: 1 | 2 | 3
  hint?: string
}

/** Multi-select group rendered as accessible, card-style options. */
export default function CheckboxGroup({
  legend,
  name,
  values,
  onChange,
  options,
  columns = 1,
  hint,
}: CheckboxGroupProps) {
  const toggle = (value: string) => {
    if (values.includes(value)) {
      onChange(values.filter((v) => v !== value))
    } else {
      onChange([...values, value])
    }
  }

  return (
    <fieldset className="fieldset">
      <legend className="legend">{legend}</legend>
      <div className={`choice-group${columns > 1 ? ` choice-group--${columns}` : ''}`}>
        {options.map((opt) => {
          const id = `${name}-${opt.value}`
          return (
            <label key={opt.value} className="choice" htmlFor={id}>
              <input
                id={id}
                className="choice__input"
                type="checkbox"
                name={name}
                value={opt.value}
                checked={values.includes(opt.value)}
                onChange={() => toggle(opt.value)}
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
