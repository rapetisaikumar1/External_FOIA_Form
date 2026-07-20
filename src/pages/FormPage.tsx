import type { FormEvent } from 'react'
import type { FoiRequestFormData } from '../types/form'
import ApplicantInfoSection from '../sections/ApplicantInfoSection'
import AddressSection from '../sections/AddressSection'
import ContactSection from '../sections/ContactSection'
import RecordsDescriptionSection from '../sections/RecordsDescriptionSection'
import ProofOfIdentitySection from '../sections/ProofOfIdentitySection'
import AccessMethodSection from '../sections/AccessMethodSection'
import DeclarationSection from '../sections/DeclarationSection'

export interface FormPageProps {
  form: FoiRequestFormData
  update: <K extends keyof FoiRequestFormData>(
    key: K,
    value: FoiRequestFormData[K],
  ) => void
  onContinue: () => void
}

/**
 * Step 1 — the main form. Native HTML5 validation guards the required fields:
 * the browser blocks submit until they are filled, so `handleSubmit` (and hence
 * `onContinue`) only runs when the form is valid. No data is submitted here.
 *
 * Additionally, the requester must complete real DiDit identity verification
 * (Step 5) before they can continue — the Continue button stays disabled until
 * `form.identity.status === 'verified'`.
 */
export default function FormPage({ form, update, onContinue }: FormPageProps) {
  const idVerified = form.identity.status === 'verified'

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Belt-and-braces: never advance without a verified identity, even if the
    // button's disabled state were bypassed.
    if (!idVerified) return
    onContinue()
  }

  return (
    <>
      <div className="pagehead">
        <h1 className="pagehead__title">Access / Correction Request</h1>
        <p className="pagehead__subtitle">
          Complete the form below to submit your Freedom of Information request.
          A CA$25.00 application fee applies.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <ApplicantInfoSection
          value={form.applicant}
          onChange={(v) => update('applicant', v)}
        />
        <AddressSection
          value={form.address}
          onChange={(v) => update('address', v)}
        />
        <ContactSection
          value={form.contact}
          onChange={(v) => update('contact', v)}
        />
        <RecordsDescriptionSection
          value={form.records}
          onChange={(v) => update('records', v)}
        />
        <ProofOfIdentitySection
          value={form.identity}
          onChange={(v) => update('identity', v)}
          email={form.contact.email}
        />
        <AccessMethodSection
          value={form.accessMethod}
          onChange={(v) => update('accessMethod', v)}
        />
        <DeclarationSection
          agreed={form.declarationAgreed}
          onChange={(v) => update('declarationAgreed', v)}
        />

        <div className="page-nav page-nav--end">
          {!idVerified && (
            <p className="page-nav__hint">
              Please verify your identity in Step 5 to continue.
            </p>
          )}
          <button type="submit" className="btn btn--primary" disabled={!idVerified}>
            Continue
          </button>
        </div>
      </form>
    </>
  )
}
