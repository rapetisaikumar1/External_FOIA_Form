import FormSection from '../components/form/FormSection'
import RadioGroup from '../components/form/RadioGroup'
import { ACCESS_METHOD_OPTIONS } from '../lib/formConfig'
import type { AccessMethod } from '../types/form'

export interface AccessMethodSectionProps {
  value: AccessMethod | ''
  onChange: (v: AccessMethod) => void
}

export default function AccessMethodSection({
  value,
  onChange,
}: AccessMethodSectionProps) {
  return (
    <FormSection
      index={6}
      id="access-method"
      title="Preferred Method of Access"
      description="How would you like to receive the records?"
    >
      <RadioGroup
        legend="Preferred method of access"
        name="accessMethod"
        required
        columns={2}
        options={ACCESS_METHOD_OPTIONS}
        value={value}
        onChange={(v) => onChange(v as AccessMethod)}
      />
    </FormSection>
  )
}
