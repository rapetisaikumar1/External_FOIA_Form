import FormSection from '../components/form/FormSection'
import SelectInput from '../components/form/SelectInput'
import TextInput from '../components/form/TextInput'
import { PROVINCE_OPTIONS } from '../lib/formConfig'
import type { AddressInfo } from '../types/form'

export interface AddressSectionProps {
  value: AddressInfo
  onChange: (value: AddressInfo) => void
}

export default function AddressSection({
  value,
  onChange,
}: AddressSectionProps) {
  const set = <K extends keyof AddressInfo>(key: K, v: AddressInfo[K]) =>
    onChange({ ...value, [key]: v })

  return (
    <FormSection
      index={2}
      id="address"
      title="Address Information"
      description="Where can we reach you by mail?"
    >
      <div className="grid grid--3">
        <div className="span-full">
          <TextInput
            id="street"
            label="Address"
            required
            value={value.street}
            onChange={(v) => set('street', v)}
            autoComplete="street-address"
            hint="Street number and name, unit/apt no., PO Box or R.R. No."
            maxLength={255}
          />
        </div>
        <TextInput
          id="cityTown"
          label="City / Town"
          required
          value={value.cityTown}
          onChange={(v) => set('cityTown', v)}
          autoComplete="address-level2"
          maxLength={100}
        />
        <SelectInput
          id="province"
          label="Province"
          required
          value={value.province}
          onChange={(v) => set('province', v)}
          options={PROVINCE_OPTIONS}
        />
        <TextInput
          id="postalCode"
          label="Postal Code"
          required
          value={value.postalCode}
          onChange={(v) => set('postalCode', v)}
          autoComplete="postal-code"
          placeholder="A1A 1A1"
          maxLength={20}
        />
      </div>
    </FormSection>
  )
}
