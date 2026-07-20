import FormSection from '../components/form/FormSection'
import SelectInput from '../components/form/SelectInput'
import TextInput from '../components/form/TextInput'
import { SALUTATION_OPTIONS } from '../lib/formConfig'
import type { ApplicantInfo } from '../types/form'

export interface ApplicantInfoSectionProps {
  value: ApplicantInfo
  onChange: (value: ApplicantInfo) => void
}

export default function ApplicantInfoSection({
  value,
  onChange,
}: ApplicantInfoSectionProps) {
  const set = <K extends keyof ApplicantInfo>(key: K, v: ApplicantInfo[K]) =>
    onChange({ ...value, [key]: v })

  return (
    <FormSection
      index={1}
      id="applicant"
      title="Applicant Information"
      description="Tell us who is making this request."
    >
      <div className="grid grid--3">
        <SelectInput
          id="salutation"
          label="Title"
          optional
          value={value.salutation}
          onChange={(v) => set('salutation', v as ApplicantInfo['salutation'])}
          options={SALUTATION_OPTIONS}
        />
        <TextInput
          id="firstName"
          label="First Name"
          required
          value={value.firstName}
          onChange={(v) => set('firstName', v)}
          autoComplete="given-name"
          maxLength={100}
        />
        <TextInput
          id="lastName"
          label="Last Name"
          required
          value={value.lastName}
          onChange={(v) => set('lastName', v)}
          autoComplete="family-name"
          maxLength={100}
        />
      </div>
    </FormSection>
  )
}
