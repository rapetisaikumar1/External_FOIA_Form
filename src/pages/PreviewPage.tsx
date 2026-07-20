import type { FoiRequestFormData } from '../types/form'
import FormSection from '../components/form/FormSection'
import {
  PROVINCE_OPTIONS,
  ACCESS_METHOD_OPTIONS,
  PROOF_OF_ID_OPTIONS,
} from '../lib/formConfig'

export interface PreviewPageProps {
  form: FoiRequestFormData
  onBack: () => void
  onProceed: () => void
}

function ReviewRow({
  label,
  value,
  full,
}: {
  label: string
  value: string
  full?: boolean
}) {
  const empty = value.trim() === ''
  return (
    <div className={`review__row${full ? ' review__row--full' : ''}`}>
      <span className="review__label">{label}</span>
      <span className={`review__value${empty ? ' review__value--empty' : ''}`}>
        {empty ? '—' : value}
      </span>
    </div>
  )
}

const labelOf = (options: { value: string; label: string }[], value: string) =>
  options.find((o) => o.value === value)?.label ?? value

/**
 * Step 2 — read-only review of the request before payment. Turns stored codes
 * into human labels and shows every group. No inputs, no editing.
 */
export default function PreviewPage({
  form,
  onBack,
  onProceed,
}: PreviewPageProps) {
  return (
    <>
      <div className="pagehead">
        <h1 className="pagehead__title">Review your request</h1>
        <p className="pagehead__subtitle">
          Please review your details below before continuing to payment.
        </p>
      </div>
      <div className="form">
        <FormSection title="Applicant Information">
          <div className="review">
            <ReviewRow label="Title" value={form.applicant.salutation} />
            <ReviewRow label="First Name" value={form.applicant.firstName} />
            <ReviewRow label="Last Name" value={form.applicant.lastName} />
          </div>
        </FormSection>

        <FormSection title="Address Information">
          <div className="review">
            <ReviewRow label="Street Address" value={form.address.street} full />
            <ReviewRow label="City / Town" value={form.address.cityTown} />
            <ReviewRow
              label="Province"
              value={labelOf(PROVINCE_OPTIONS, form.address.province)}
            />
            <ReviewRow label="Postal Code" value={form.address.postalCode} />
          </div>
        </FormSection>

        <FormSection title="Contact Information">
          <div className="review">
            <ReviewRow
              label="Telephone Number"
              value={form.contact.telephoneDay}
            />
            <ReviewRow
              label="Alternative Number"
              value={form.contact.telephoneEvening}
            />
            <ReviewRow label="Email" value={form.contact.email} />
          </div>
        </FormSection>

        <FormSection title="Request Details">
          <div className="review">
            <ReviewRow
              label="Description"
              value={form.records.description}
              full
            />
          </div>
        </FormSection>

        <FormSection title="Proof of Identity">
          <div className="review">
            <ReviewRow
              label="Proof of ID"
              full
              value={form.personalInfo.proofOfId
                .map((v) => labelOf(PROOF_OF_ID_OPTIONS, v))
                .join(', ')}
            />
          </div>
        </FormSection>

        <FormSection title="Preferred Method of Access">
          <div className="review">
            <ReviewRow
              label="Preferred Method"
              value={labelOf(ACCESS_METHOD_OPTIONS, form.accessMethod)}
            />
          </div>
        </FormSection>

        <FormSection title="Declaration">
          <div className="review">
            <ReviewRow
              label="Confirmed"
              full
              value={
                form.declarationAgreed
                  ? 'Yes — information confirmed accurate'
                  : 'No'
              }
            />
          </div>
        </FormSection>

        <div className="page-nav">
          <button type="button" className="btn btn--ghost" onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onProceed}
          >
            Proceed
          </button>
        </div>
      </div>
    </>
  )
}
