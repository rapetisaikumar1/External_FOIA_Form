/**
 * DiDit identity-verification client for the External Request Form (Step 5).
 *
 * All calls go through the MapleRecord backend — the DiDit API key is NEVER in
 * the frontend. Flow: createVerificationSession() → open the hosted DiDit URL →
 * poll getVerificationStatus() until terminal. The backend is kept fresh by the
 * DiDit webhook; the poll is the belt-and-braces fallback.
 *
 * Base URL comes from VITE_API_BASE_URL (defaults to localhost:8000).
 */
import type { IdentityStatus } from '../types/form'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/+$/, '')
const IDENTITY_API_BASE = (import.meta.env.VITE_IDENTITY_API_BASE_URL || API_BASE).replace(/\/+$/, '')
const SESSION_ENDPOINT = `${IDENTITY_API_BASE}/api/public/identity-verification/session/`
const STATUS_ENDPOINT = `${IDENTITY_API_BASE}/api/public/identity-verification/status/`

export class IdentityError extends Error {
  status?: number
  constructor(message: string, status?: number) {
    super(message)
    this.name = 'IdentityError'
    this.status = status
  }
}

export interface VerificationSession {
  sessionId: string
  reference: string
  url: string
  status: IdentityStatus
}

export interface VerificationStatus {
  sessionId: string
  reference: string
  status: IdentityStatus
  provider: string
  providerStatus: string
  documentType: string
  confidenceScore: number | null
  failureReason: string
  verifiedAt: string | null
  isTerminal: boolean
  isVerified: boolean
}

async function postJson(url: string, body: unknown, timeoutMs = 20000) {
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
    throw new IdentityError('Could not reach the verification service. Please check your connection and try again.')
  } finally {
    clearTimeout(timer)
  }
  let data: Record<string, unknown> = {}
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    /* non-JSON handled by caller */
  }
  return { res, data }
}

/** Create a DiDit verification session for this applicant. */
export async function createVerificationSession(email: string): Promise<VerificationSession> {
  const { res, data } = await postJson(SESSION_ENDPOINT, { email: email || '' })
  if (res.ok && data.success) {
    const url = data.url
    if (typeof url !== 'string' || !/^https?:\/\//i.test(url)) {
      throw new IdentityError('Verification is temporarily unavailable. Please try again shortly.')
    }
    return {
      sessionId: String(data.session_id ?? ''),
      reference: String(data.reference ?? ''),
      url,
      status: (data.status as IdentityStatus) ?? 'processing',
    }
  }
  if (res.status === 429) {
    throw new IdentityError('Too many verification attempts. Please wait a moment and try again.', 429)
  }
  throw new IdentityError(
    (data.error as string) || (data.detail as string) || 'Could not start identity verification. Please try again.',
    res.status,
  )
}

/** Poll the current verification status by session id. */
export async function getVerificationStatus(sessionId: string): Promise<VerificationStatus> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 20000)
  let res: Response
  try {
    res = await fetch(`${STATUS_ENDPOINT}?session_id=${encodeURIComponent(sessionId)}`, {
      signal: controller.signal,
    })
  } catch {
    throw new IdentityError('Could not check verification status.')
  } finally {
    clearTimeout(timer)
  }
  let data: Record<string, unknown> = {}
  try {
    data = (await res.json()) as Record<string, unknown>
  } catch {
    /* handled below */
  }
  if (res.ok && data.success) {
    return {
      sessionId: String(data.session_id ?? sessionId),
      reference: String(data.reference ?? ''),
      status: (data.status as IdentityStatus) ?? 'processing',
      provider: String(data.provider ?? 'DiDit'),
      providerStatus: String(data.provider_status ?? ''),
      documentType: String(data.document_type ?? ''),
      confidenceScore: (data.confidence_score as number | null) ?? null,
      failureReason: String(data.failure_reason ?? ''),
      verifiedAt: (data.verified_at as string | null) ?? null,
      isTerminal: Boolean(data.is_terminal),
      isVerified: Boolean(data.is_verified),
    }
  }
  throw new IdentityError((data.error as string) || (data.detail as string) || 'Could not check verification status.', res.status)
}
