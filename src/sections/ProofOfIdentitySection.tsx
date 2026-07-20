import { useCallback, useEffect, useRef, useState } from 'react'
import FormSection from '../components/form/FormSection'
import type { IdentityStatus, IdentityVerificationState } from '../types/form'
import { createEmptyIdentity } from '../types/form'
import {
  createVerificationSession,
  getVerificationStatus,
  IdentityError,
} from '../lib/identity'

export interface ProofOfIdentitySectionProps {
  value: IdentityVerificationState
  onChange: (value: IdentityVerificationState) => void
  /** Applicant email (from the Contact section) used to correlate the verification. */
  email: string
}

// Survives a browser refresh mid-verification so polling can resume.
const IDV_STORAGE_KEY = 'mr_external_idv'
const POLL_MS = 4000
const SLOW_AFTER_MS = 90_000 // show "taking longer than expected" after this
const MAX_POLL_MS = 12 * 60_000 // hard stop after 12 min → timeout + retry

const TERMINAL: IdentityStatus[] = ['verified', 'failed', 'rejected']
const isTerminal = (s: IdentityStatus) => TERMINAL.includes(s)
const isActive = (s: IdentityStatus) => s === 'uploading' || s === 'processing' || s === 'manual_review'

/** Render a confidence value (DiDit returns 0..1) as a clamped 0–100%. */
function confidencePct(score: number): number {
  const pct = score <= 1 ? score * 100 : score
  return Math.max(0, Math.min(100, Math.round(pct)))
}

export default function ProofOfIdentitySection({ value, onChange, email }: ProofOfIdentitySectionProps) {
  const [error, setError] = useState<string | null>(null)
  const [slow, setSlow] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [busy, setBusy] = useState(false) // drives the button's disabled state (a render-visible flag)
  // Synchronous guard so a rapid double-click can never start two sessions.
  const starting = useRef(false)
  const popupRef = useRef<Window | null>(null)
  const startedAt = useRef<number>(0)
  // Always call the latest onChange without making it an effect dependency.
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  // Restore an in-flight verification after a refresh (once, on mount).
  const restored = useRef(false)
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    if (value.sessionId) return // parent already has state
    try {
      const raw = sessionStorage.getItem(IDV_STORAGE_KEY)
      if (raw) {
        const saved = JSON.parse(raw) as IdentityVerificationState
        if (saved?.sessionId && !isTerminal(saved.status)) {
          startedAt.current = Date.now()
          onChangeRef.current(saved)
        }
      }
    } catch {
      /* ignore malformed storage */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist state so a refresh can resume; clear on terminal.
  useEffect(() => {
    try {
      if (value.sessionId && !isTerminal(value.status)) {
        sessionStorage.setItem(IDV_STORAGE_KEY, JSON.stringify(value))
      } else {
        sessionStorage.removeItem(IDV_STORAGE_KEY)
      }
    } catch {
      /* ignore */
    }
  }, [value])

  // Poll while the session is active (not terminal) and not timed out.
  useEffect(() => {
    if (!value.sessionId || !isActive(value.status) || timedOut) return
    if (!startedAt.current) startedAt.current = Date.now()
    let cancelled = false
    const sessionId = value.sessionId

    const tick = async () => {
      // Hard timeout: stop polling and surface a retry.
      if (Date.now() - startedAt.current > MAX_POLL_MS) {
        if (!cancelled) setTimedOut(true)
        return
      }
      if (Date.now() - startedAt.current > SLOW_AFTER_MS && !cancelled) setSlow(true)
      try {
        const s = await getVerificationStatus(sessionId)
        if (cancelled) return
        onChangeRef.current({
          status: s.status,
          sessionId,
          reference: s.reference || value.reference,
          url: value.url,
          documentType: s.documentType || '',
          confidenceScore: s.confidenceScore,
          failureReason: s.failureReason,
          verifiedAt: s.verifiedAt,
          provider: s.provider || 'DiDit',
        })
        if (s.isTerminal && popupRef.current && !popupRef.current.closed) {
          try { popupRef.current.close() } catch { /* ignore */ }
        }
      } catch {
        // Non-fatal — keep the last known status and keep polling.
      }
    }

    const id = window.setInterval(tick, POLL_MS)
    void tick() // immediate first check
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.sessionId, value.status, timedOut])

  const start = useCallback(async () => {
    if (starting.current) return
    starting.current = true
    setBusy(true)
    setError(null)
    setSlow(false)
    setTimedOut(false)
    startedAt.current = Date.now()
    // Build fresh state (never spread a possibly-stale `value` — that could
    // resurrect a previous session on retry).
    onChangeRef.current({ ...createEmptyIdentity(), status: 'uploading' })
    try {
      const session = await createVerificationSession(email)
      // Open DiDit's secure hosted capture flow in a popup (keeps the requester
      // on Step 5; we poll for the result). Some browsers may block it, in which
      // case the inline "Re-open verification window" link is the fallback.
      try {
        popupRef.current = window.open(session.url, 'didit-verification', 'width=480,height=760')
      } catch {
        popupRef.current = null
      }
      onChangeRef.current({
        ...createEmptyIdentity(),
        status: 'processing',
        sessionId: session.sessionId,
        reference: session.reference,
        url: session.url,
      })
    } catch (e) {
      onChangeRef.current({ ...createEmptyIdentity(), status: 'not_uploaded' })
      setError(e instanceof IdentityError ? e.message : 'Could not start verification. Please try again.')
    } finally {
      starting.current = false
      setBusy(false)
    }
  }, [email])

  const retry = useCallback(() => {
    // Reset everything, then start a fresh session (Retry flow — auto-restart).
    setError(null)
    setSlow(false)
    setTimedOut(false)
    void start()
  }, [start])

  const s = value.status

  return (
    <FormSection
      index={5}
      id="proof-of-identity"
      title="Proof of Identity"
      description="Verify your Canadian Government-issued ID to continue. Verification is powered by DiDit."
    >
      <div className="idv">
        {/* TIMEOUT (takes precedence over the active states) */}
        {timedOut && !isTerminal(s) && (
          <div className="idv__panel idv__panel--fail" aria-live="assertive">
            <p className="idv__fail-title">Verification timed out</p>
            <p className="idv__hint">
              Verification is taking longer than expected, or the service is temporarily unavailable.
              Please try again.
            </p>
            <button type="button" className="btn btn--primary" onClick={retry} disabled={busy}>
              Try again
            </button>
          </div>
        )}

        {/* NOT STARTED */}
        {!timedOut && s === 'not_uploaded' && (
          <div className="idv__panel">
            <p className="idv__lead">
              To protect your personal information, we need to verify your identity using a Canadian
              Government-issued ID (Driver&apos;s Licence, Passport, Provincial ID, or PR Card).
            </p>
            <button type="button" className="btn btn--primary" onClick={start} disabled={busy}>
              {busy ? 'Starting…' : 'Verify my identity'}
            </button>
            {error && <p className="idv__error" role="alert">{error}</p>}
          </div>
        )}

        {/* IN PROGRESS */}
        {!timedOut && (s === 'uploading' || s === 'processing') && (
          <div className="idv__panel idv__panel--progress" aria-live="polite">
            <span className="idv__spinner" aria-hidden="true" />
            <div>
              <p className="idv__status">
                {s === 'uploading' ? 'Uploading document…' : 'Verifying identity…'}
              </p>
              <p className="idv__hint">
                {slow
                  ? 'Verification is taking longer than expected. Please keep this window open and complete the steps in the verification window.'
                  : 'Complete the steps in the verification window. This page will update automatically — please wait.'}
              </p>
              {value.url && (
                <button
                  type="button"
                  className="idv__link"
                  onClick={() => {
                    popupRef.current = window.open(value.url, 'didit-verification', 'width=480,height=760')
                  }}
                >
                  Re-open verification window
                </button>
              )}
            </div>
          </div>
        )}

        {/* MANUAL REVIEW (still polling) */}
        {!timedOut && s === 'manual_review' && (
          <div className="idv__panel idv__panel--review idv__panel--progress" aria-live="polite">
            <span className="idv__spinner" aria-hidden="true" />
            <div>
              <p className="idv__status">Your verification is under review</p>
              <p className="idv__hint">
                DiDit is reviewing your document. This page will update automatically when a decision is
                made. You cannot continue until verification is approved.
              </p>
            </div>
          </div>
        )}

        {/* VERIFIED */}
        {s === 'verified' && (
          <div className="idv__panel idv__panel--ok" aria-live="polite">
            <p className="idv__ok-title">✔ Identity Verified</p>
            <p className="idv__hint">Verified successfully. You may now continue.</p>
            <dl className="idv__details">
              {value.documentType && (
                <div><dt>Document Type</dt><dd>{value.documentType}</dd></div>
              )}
              {value.verifiedAt && (
                <div><dt>Verification Time</dt><dd>{new Date(value.verifiedAt).toLocaleString()}</dd></div>
              )}
              <div><dt>Verification Status</dt><dd>Verified</dd></div>
              {typeof value.confidenceScore === 'number' && (
                <div><dt>Confidence Score</dt><dd>{confidencePct(value.confidenceScore)}%</dd></div>
              )}
              <div><dt>Verification Provider</dt><dd>{value.provider || 'DiDit'}</dd></div>
            </dl>
          </div>
        )}

        {/* FAILED / REJECTED */}
        {(s === 'failed' || s === 'rejected') && (
          <div className="idv__panel idv__panel--fail" aria-live="assertive">
            <p className="idv__fail-title">Verification unsuccessful</p>
            <p className="idv__hint">
              {value.failureReason ||
                'We could not verify your identity. Please try again with a clear photo of a supported document.'}
            </p>
            <button type="button" className="btn btn--primary" onClick={retry} disabled={busy}>
              Upload another document
            </button>
            {error && <p className="idv__error" role="alert">{error}</p>}
          </div>
        )}
      </div>
    </FormSection>
  )
}
