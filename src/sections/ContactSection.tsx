import FormSection from '../components/form/FormSection'
import TextInput from '../components/form/TextInput'
import type { ContactInfo } from '../types/form'

export interface ContactSectionProps {
  value: ContactInfo
  onChange: (value: ContactInfo) => void
}

export default function ContactSection({
  value,
  onChange,
}: ContactSectionProps) {
  const set = <K extends keyof ContactInfo>(key: K, v: ContactInfo[K]) =>
    onChange({ ...value, [key]: v })

  return (
    <FormSection
      index={3}
      id="contact"
      title="Contact Information"
      description="How can we contact you about this request?"
    >
      <div className="grid grid--3">
        <TextInput
          id="telephoneDay"
          label="Telephone Number"
          type="tel"
          required
          value={value.telephoneDay}
          onChange={(v) => set('telephoneDay', v)}
          autoComplete="tel"
          inputMode="tel"
          maxLength={30}
        />
        <TextInput
          id="telephoneEvening"
          label="Alternative Number"
          type="tel"
          optional
          value={value.telephoneEvening}
          onChange={(v) => set('telephoneEvening', v)}
          inputMode="tel"
          maxLength={30}
        />
        <TextInput
          id="email"
          label="Email"
          type="email"
          required
          value={value.email}
          onChange={(v) => set('email', v)}
          autoComplete="email"
          inputMode="email"
          maxLength={254}
        />
      </div>
    </FormSection>
  )
}
