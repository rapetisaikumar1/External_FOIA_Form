import type { ReactNode } from 'react'

export interface FormSectionProps {
  index?: number
  title: string
  description?: string
  id?: string
  children: ReactNode
}

/** A titled, numbered section card. Wraps each block of the form. */
export default function FormSection({
  index,
  title,
  description,
  id,
  children,
}: FormSectionProps) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <section className="section" id={id} aria-labelledby={headingId}>
      <div className="section__header">
        {index != null && (
          <span className="section__index" aria-hidden="true">
            {index}
          </span>
        )}
        <div className="section__heading">
          <h2 className="section__title" id={headingId}>
            {title}
          </h2>
          {description && <p className="section__desc">{description}</p>}
        </div>
      </div>
      <div className="section__body">{children}</div>
    </section>
  )
}
