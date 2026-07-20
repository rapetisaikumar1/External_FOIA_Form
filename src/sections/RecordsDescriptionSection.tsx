import FormSection from '../components/form/FormSection'
import TextArea from '../components/form/TextArea'
import type { RecordsRequest } from '../types/form'

export interface RecordsDescriptionSectionProps {
  value: RecordsRequest
  onChange: (value: RecordsRequest) => void
}

export default function RecordsDescriptionSection({
  value,
  onChange,
}: RecordsDescriptionSectionProps) {
  return (
    <FormSection index={4} id="records" title="Detailed Description of Records">
      <TextArea
        id="records-description"
        label="Description of records requested"
        required
        rows={8}
        value={value.description}
        onChange={(v) => onChange({ ...value, description: v })}
        hint="List the type(s) of records required including dates or time of event; identification, property or incident numbers; location, address, etc."
        maxLength={20000}
      />
    </FormSection>
  )
}
