/**
 * Stripe Checkout integration for the External Request Form.
 *
 * Flow: createCheckoutSession() → redirect to Stripe-hosted checkout → (return)
 * verifyPayment(). The backend creates the request ONLY after it verifies the
 * payment, so this module never creates a request itself.
 *
 * The backend base URL comes from VITE_API_BASE_URL (defaults to localhost:8000).
 */
import type { FoiRequestFormData } from '../types/form'
import {
  ACCESS_METHOD_OPTIONS,
  PROOF_OF_ID_OPTIONS,
  PROVINCE_OPTIONS,
} from './formConfig'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(
  /\/+$/,
  '',
)
export const CHECKOUT_SESSION_ENDPOINT = `${API_BASE}/api/public/external-requests/checkout-session/`
export const VERIFY_ENDPOINT = `${API_BASE}/api/public/external-requests/verify/`
export const FEE_VERIFY_ENDPOINT = `${API_BASE}/api/public/fee-payment/verify/`

/**
 * Verify a Triage fee-assessment payment on return from Stripe (the emailed
 * ?fee_payment=success link). Fulfils the payment against the existing request
 * so Step 8 updates even without a webhook. Best-effort — the webhook is the
 * backup, so a failure here is not surfaced to the requester.
 */
export async function verifyFeePayment(sessionId: string): Promise<void> {
  if (!sessionId) return
  try {
    await fetch(FEE_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId }),
    })
  } catch {
    /* the webhook fulfils it as a fallback */
  }
}

/** Thrown on any non-success response, carrying a user-facing message. */
export class PaymentError extends Error {
  fieldErrors?: Record<string, string[]>
  /** True when the payment is still being processed (not a failure). */
  processing?: boolean
  constructor(
    message: string,
    fieldErrors?: Record<string, string[]>,
    processing?: boolean,
  ) {
    super(message)
    this.name = 'PaymentError'
    this.fieldErrors = fieldErrors
    this.processing = processing
  }
}

function labelOf(options: { value: string; label: string }[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value
}

/** Maps the External Form state to the public API request payload. */
export function toPayload(form: FoiRequestFormData) {
  return {
    salutation: form.applicant.salutation,
    first_name: form.applicant.firstName,
    last_name: form.applicant.lastName,
    email: form.contact.email,
    phone: form.contact.telephoneDay,
    alternate_phone: form.contact.telephoneEvening,
    street_address: form.address.street,
    city: form.address.cityTown,
    province: form.address.province
      ? labelOf(PROVINCE_OPTIONS, form.address.province)
      : '',
    postal_code: form.address.postalCode,
    description: form.records.description,
    preferred_method_of_access: form.accessMethod
      ? labelOf(ACCESS_METHOD_OPTIONS, form.accessMethod)
      : '',
    proof_of_id: form.personalInfo.proofOfId.map((v) =>
      labelOf(PROOF_OF_ID_OPTIONS, v),
    ),
    declaration_agreed: form.declarationAgreed,
    // DiDit identity-verification session (Step 5). The server re-checks this
    // session is VERIFIED and bound to this applicant before taking payment —
    // the client-side gate alone is bypassable.
    identity_session_id: form.identity.sessionId,
  }
}

async function postJson(url: string, body: unknown, timeoutMs = 20000) {
  // Abort a hung request so the caller can recover (retry UI) instead of the
  // user waiting on an infinite spinner if the server is slow or unresponsive.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
  } catch {
    throw new PaymentError(
      'Could not reach the server. Please check your connection and try again.',
    )
  } finally {
    clearTimeout(timer)
  }
  let data: unknown = null
  try {
    data = await res.json()
  } catch {
    // non-JSON response — handled by the caller
  }
  return { res, data: (data ?? {}) as Record<string, unknown> }
}

export interface CheckoutSession {
  sessionId: string
  checkoutUrl: string
}

/** Ask the backend to create a Stripe Checkout Session for this form. */
export async function createCheckoutSession(
  form: FoiRequestFormData,
  returnOrigin: string,
): Promise<CheckoutSession> {
  const { res, data } = await postJson(CHECKOUT_SESSION_ENDPOINT, {
    ...toPayload(form),
    return_origin: returnOrigin,
  })

  if (res.ok && data.success) {
    // Guard against a malformed 2xx (blank/garbage checkout_url) so we never
    // redirect to "" (a silent same-page reload) and leave the button stuck.
    const checkoutUrl = data.checkout_url
    if (typeof checkoutUrl !== 'string' || !/^https?:\/\//i.test(checkoutUrl)) {
      throw new PaymentError(
        'Payment is temporarily unavailable. Please try again shortly.',
      )
    }
    return { sessionId: String(data.session_id ?? ''), checkoutUrl }
  }
  if (res.status === 400 && data.errors) {
    const fieldErrors = data.errors as Record<string, string[]>
    throw new PaymentError(
      Object.values(fieldErrors)[0]?.[0] || 'Please review the form and try again.',
      fieldErrors,
    )
  }
  if (res.status === 429) {
    throw new PaymentError('Too many attempts. Please wait a while and try again.')
  }
  throw new PaymentError(
    (data.error as string) ||
      (data.detail as string) ||
      'Payment is temporarily unavailable. Please try again shortly.',
  )
}

export interface VerifiedRequest {
  requestId: number
  trackingNumber: string
  message: string
}

/** After returning from Stripe, confirm the payment and get the request number. */
export async function verifyPayment(sessionId: string): Promise<VerifiedRequest> {
  const { res, data } = await postJson(VERIFY_ENDPOINT, { session_id: sessionId })

  if (res.ok && data.success) {
    return {
      requestId: data.request_id as number,
      trackingNumber: data.tracking_number as string,
      message: data.message as string,
    }
  }
  if (res.status === 429) {
    throw new PaymentError('Too many attempts. Please wait a while and try again.')
  }
  // Payment is still settling (e.g. an async method): not a failure — the
  // backend returns 200 with processing:true and the webhook will fulfil it.
  if (data.processing) {
    throw new PaymentError(
      (data.message as string) ||
        'Your payment is still being processed. Please keep this window open.',
      undefined,
      true,
    )
  }
  throw new PaymentError(
    (data.error as string) ||
      (data.detail as string) ||
      'We could not confirm your payment. If you were charged, please contact support.',
  )
}
