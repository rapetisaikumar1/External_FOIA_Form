/**
 * Static configuration for the form: option lists and standing notice text.
 * Centralised here so copy/options can be edited without touching components,
 * and so a future API layer can validate against the same option values.
 */
import type {
  AccessMethod,
  ProofOfIdOption,
  RequestType,
  Salutation,
} from '../types/form'

export interface Option<T extends string = string> {
  value: T
  label: string
  desc?: string
}

export const REQUEST_TYPE_OPTIONS: Option<RequestType>[] = [
  { value: 'general_records', label: 'Access to General Records' },
  { value: 'own_personal', label: 'Access to Own Personal Information' },
  { value: 'other_personal', label: 'Access to Other Personal Information' },
  {
    value: 'correction_personal',
    label: 'Correction of Own Personal Information',
  },
]

export const SALUTATION_OPTIONS: Option<Salutation>[] = [
  { value: 'Mr.', label: 'Mr.' },
  { value: 'Ms.', label: 'Ms.' },
  { value: 'Mrs.', label: 'Mrs.' },
  { value: 'Miss', label: 'Miss' },
]

/** Canadian provinces & territories (form is under MFIPPA). */
export const PROVINCE_OPTIONS: Option[] = [
  { value: 'AB', label: 'Alberta' },
  { value: 'BC', label: 'British Columbia' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
  { value: 'ON', label: 'Ontario' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'QC', label: 'Quebec' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'YT', label: 'Yukon' },
]

export const ACCESS_METHOD_OPTIONS: Option<AccessMethod>[] = [
  { value: 'in_person', label: 'In-person pickup' },
  { value: 'email', label: 'Email' },
  { value: 'regular_mail', label: 'Regular Mail' },
  { value: 'courier', label: 'Courier', desc: 'Additional fee applies' },
]

export const PROOF_OF_ID_OPTIONS: Option<ProofOfIdOption>[] = [
  { value: 'provided_with_request', label: 'ID provided with request' },
  { value: 'provided_at_pickup', label: 'ID to be provided at time of pick-up' },
]
