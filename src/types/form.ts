/**
 * Typed data model for the External Access / Correction Request form.
 *
 * The whole form is one typed object (not scattered field state), so future
 * phases — validation, API submission, payment, autosave — can serialise and
 * consume it without reworking the UI. Field names mirror the reference form.
 */

export type RequestType =
  | 'general_records'
  | 'own_personal'
  | 'other_personal'
  | 'correction_personal'

export type Salutation = 'Mr.' | 'Ms.' | 'Mrs.' | 'Miss'

export type AccessMethod = 'in_person' | 'email' | 'regular_mail' | 'courier'

export type ProofOfIdOption = 'provided_with_request' | 'provided_at_pickup'

export interface ApplicantInfo {
  salutation: Salutation | ''
  firstName: string
  lastName: string
}

export interface AddressInfo {
  street: string
  cityTown: string
  province: string
  postalCode: string
}

export interface ContactInfo {
  telephoneDay: string
  telephoneEvening: string
  email: string
}

export interface RecordsRequest {
  description: string
}

/** Only relevant when requesting access/correction to one's own personal info. */
export interface PersonalInfoRequest {
  lastNameOnRecords: string
  dateOfBirth: string
  proofOfId: ProofOfIdOption[]
}

export interface SignatureInfo {
  /** Data URL from the on-screen signature pad (UI only for now). */
  dataUrl: string
  /** Signing date (YYYY-MM-DD). */
  date: string
}

/** Application-normalized DiDit identity-verification status (mirrors backend). */
export type IdentityStatus =
  | 'not_uploaded'
  | 'uploading'
  | 'processing'
  | 'verified'
  | 'failed'
  | 'manual_review'
  | 'rejected'

/** Live identity-verification state for Step 5 (DiDit). */
export interface IdentityVerificationState {
  status: IdentityStatus
  sessionId: string
  reference: string
  url: string
  documentType: string
  confidenceScore: number | null
  failureReason: string
  verifiedAt: string | null
  provider: string
}

export interface FoiRequestFormData {
  requestType: RequestType | ''
  applicant: ApplicantInfo
  address: AddressInfo
  contact: ContactInfo
  records: RecordsRequest
  personalInfo: PersonalInfoRequest
  accessMethod: AccessMethod | ''
  declarationAgreed: boolean
  signature: SignatureInfo
  identity: IdentityVerificationState
}

export function createEmptyIdentity(): IdentityVerificationState {
  return {
    status: 'not_uploaded',
    sessionId: '',
    reference: '',
    url: '',
    documentType: '',
    confidenceScore: null,
    failureReason: '',
    verifiedAt: null,
    provider: 'DiDit',
  }
}

/** Factory for a blank form — used as the initial UI state. */
export function createEmptyForm(): FoiRequestFormData {
  return {
    requestType: '',
    applicant: { salutation: '', firstName: '', lastName: '' },
    address: { street: '', cityTown: '', province: '', postalCode: '' },
    contact: { telephoneDay: '', telephoneEvening: '', email: '' },
    records: { description: '' },
    personalInfo: { lastNameOnRecords: '', dateOfBirth: '', proofOfId: [] },
    accessMethod: '',
    declarationAgreed: false,
    signature: { dataUrl: '', date: '' },
    identity: createEmptyIdentity(),
  }
}
