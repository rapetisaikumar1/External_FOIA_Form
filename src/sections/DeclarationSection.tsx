import FormSection from '../components/form/FormSection'

export interface DeclarationSectionProps {
  agreed: boolean
  onChange: (v: boolean) => void
}

export default function DeclarationSection({
  agreed,
  onChange,
}: DeclarationSectionProps) {
  return (
    <FormSection index={7} id="declaration" title="Declaration">
      <label className="declaration" htmlFor="declaration-agree">
        <input
          id="declaration-agree"
          className="declaration__input"
          type="checkbox"
          checked={agreed}
          onChange={(e) => onChange(e.target.checked)}
          required
        />
        <span className="declaration__text">
          I declare that the information provided in this request is true and
          complete to the best of my knowledge. I understand that a CA$25.00
          application fee is required, and that my personal information will be
          used to process this request.
        </span>
      </label>
    </FormSection>
  )
}
