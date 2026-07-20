import { useEffect, useRef, useState } from 'react'
import Logo from './components/Logo'
import { createEmptyForm } from './types/form'
import type { FoiRequestFormData } from './types/form'
import { createCheckoutSession, verifyPayment, verifyFeePayment, PaymentError } from './lib/checkout'
import type { VerifiedRequest } from './lib/checkout'
import FormPage from './pages/FormPage'
import PreviewPage from './pages/PreviewPage'
import PaymentPage from './pages/PaymentPage'
import VerifyingPage from './pages/VerifyingPage'
import SuccessPage from './pages/SuccessPage'

type Step = 'form' | 'preview' | 'payment' | 'verifying' | 'processing' | 'success' | 'fee_done'

// The form data is kept in sessionStorage so it survives the redirect to Stripe
// and back (on both success and cancel), and the user never has to re-enter it.
const STORAGE_KEY = 'mr_external_form'
// The Stripe Checkout session id is stored separately so a refresh (or a slow /
// hung confirmation) can resume verifying the SAME payment — never starting a new
// one. Cleared on success and on cancel.
const SESSION_KEY = 'mr_external_session_id'

// Module-scoped so it survives React StrictMode's dev remount: the verify request
// fires at most once per page load, and the surviving component instance still
// receives the result. (Fulfilment is idempotent server-side regardless.)
let verifyPromise: Promise<VerifiedRequest> | null = null

export default function App() {
  const [form, setForm] = useState<FoiRequestFormData>(createEmptyForm())
  const [step, setStep] = useState<Step>('form')
  const [busy, setBusy] = useState(false) // creating the checkout session / redirecting
  const [payMessage, setPayMessage] = useState<string | null>(null) // cancel / failure notice
  const [result, setResult] = useState<VerifiedRequest | null>(null)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  // Fee-assessment payment-link return (emailed to the requester), success vs cancel.
  const [feeSuccess, setFeeSuccess] = useState(false)

  function update<K extends keyof FoiRequestFormData>(
    key: K,
    value: FoiRequestFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // Confirm a Stripe payment. De-duped across StrictMode remounts via the
  // module-level promise, so exactly one verify request is in flight per session.
  function runVerify(sessionId: string) {
    setVerifyError(null)
    setStep('verifying')
    if (!verifyPromise) verifyPromise = verifyPayment(sessionId)
    verifyPromise
      .then((r) => {
        verifyPromise = null
        setResult(r)
        setStep('success')
        sessionStorage.removeItem(STORAGE_KEY)
        sessionStorage.removeItem(SESSION_KEY)
      })
      .catch((e) => {
        verifyPromise = null
        // Async payment still settling — show a processing state, NOT a failure.
        // The session id stays stored so the user can re-check the SAME payment.
        if (e instanceof PaymentError && e.processing) {
          setStep('processing')
          return
        }
        setVerifyError(
          e instanceof PaymentError
            ? e.message
            : 'We could not confirm your payment. If you were charged, please contact support.',
        )
      })
  }

  // Retry confirming the SAME session — never creates a new payment.
  function retryVerify() {
    const id = sessionStorage.getItem(SESSION_KEY)
    if (!id) {
      setStep('payment')
      return
    }
    verifyPromise = null
    runVerify(id)
  }

  // Handle the return from Stripe, or resume a verification interrupted by a
  // refresh (runs once on mount).
  const handledReturn = useRef(false)
  useEffect(() => {
    if (handledReturn.current) return
    handledReturn.current = true

    const params = new URLSearchParams(window.location.search)
    const payment = params.get('payment')
    const storedSession = sessionStorage.getItem(SESSION_KEY)

    // Fee-assessment payment link (emailed to the requester by staff). This is a
    // fee payment against an EXISTING request — the webhook records it + emails a
    // confirmation, so here we only show the requester an acknowledgement.
    const feePayment = params.get('fee_payment')
    if (feePayment) {
      const feeSessionId = params.get('session_id') || ''
      window.history.replaceState({}, '', window.location.pathname)
      const ok = feePayment === 'success'
      setFeeSuccess(ok)
      setStep('fee_done')
      // Fulfil the fee payment server-side so Step 8 updates even without the
      // webhook (best-effort; the webhook is the belt-and-braces backup).
      if (ok && feeSessionId) void verifyFeePayment(feeSessionId)
      return
    }

    // Fresh load with nothing to resume.
    if (!payment && !storedSession) return

    // Restore the form data saved before the redirect.
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setForm(JSON.parse(saved))
      } catch {
        // ignore malformed storage
      }
    }
    // Clean the query string out of the address bar.
    window.history.replaceState({}, '', window.location.pathname)

    if (payment === 'cancelled') {
      setPayMessage(
        'Payment was cancelled. You can review your details and try again.',
      )
      sessionStorage.removeItem(SESSION_KEY)
      setStep('payment')
      return
    }

    // Success return (carries session_id) OR a verification resumed after a
    // refresh (session_id recovered from storage). Verify the same session.
    const sessionId = params.get('session_id') || storedSession
    if (!sessionId) {
      // e.g. ?payment=success with no session id — nothing to confirm.
      setStep('payment')
      return
    }
    sessionStorage.setItem(SESSION_KEY, sessionId)
    runVerify(sessionId)
  }, [])

  // Pay Now → create a Stripe Checkout Session and redirect to Stripe.
  // `paying` is a synchronous guard (set/read in the same tick) so a rapid
  // double-click / Enter+click can never start two checkout sessions before
  // React re-renders and disables the button.
  const paying = useRef(false)
  async function handlePayNow() {
    if (paying.current) return
    paying.current = true
    setBusy(true)
    setPayMessage(null)
    try {
      // Persist so the data survives the round-trip to Stripe.
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(form))
      const { checkoutUrl } = await createCheckoutSession(form, window.location.origin)
      window.location.href = checkoutUrl // leave the SPA for Stripe's hosted page
    } catch (e) {
      setPayMessage(
        e instanceof PaymentError ? e.message : 'Payment failed. Please try again.',
      )
      setBusy(false) // reset only on failure; on success we are navigating away
      paying.current = false // allow a genuine retry after a failure
    }
  }

  function startNewRequest() {
    setForm(createEmptyForm())
    setResult(null)
    setPayMessage(null)
    setVerifyError(null)
    setBusy(false)
    paying.current = false
    verifyPromise = null
    sessionStorage.removeItem(STORAGE_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setStep('form')
  }

  // Scroll to top + move focus into the page on each step change (accessibility).
  const mainRef = useRef<HTMLElement>(null)
  const isFirstRender = useRef(true)
  useEffect(() => {
    window.scrollTo({ top: 0 })
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    mainRef.current?.focus()
  }, [step])

  return (
    <div className="page">
      <header className="appbar">
        <div className="appbar__inner">
          <span className="appbar__logo">
            <Logo />
          </span>
          <span className="appbar__brand">
            <span className="appbar__name">MapleRecord</span>
          </span>
          <span className="appbar__spacer" />
          <span className="appbar__badge">Freedom of Information Request</span>
        </div>
      </header>

      <main
        className="container"
        role="main"
        ref={mainRef}
        tabIndex={-1}
        style={{ outline: 'none' }}
      >
        {step === 'form' && (
          <FormPage
            form={form}
            update={update}
            onContinue={() => setStep('preview')}
          />
        )}
        {step === 'preview' && (
          <PreviewPage
            form={form}
            onBack={() => setStep('form')}
            onProceed={() => setStep('payment')}
          />
        )}
        {step === 'payment' && (
          <PaymentPage
            onBack={() => {
              setPayMessage(null)
              setStep('preview')
            }}
            onSubmit={handlePayNow}
            submitting={busy}
            error={payMessage}
          />
        )}
        {step === 'verifying' && (
          <VerifyingPage
            variant={verifyError ? 'error' : 'verifying'}
            message={verifyError}
            onRetry={retryVerify}
          />
        )}
        {step === 'processing' && (
          <VerifyingPage variant="processing" onRetry={retryVerify} />
        )}
        {step === 'success' && result && (
          <SuccessPage
            trackingNumber={result.trackingNumber}
            onNewRequest={startNewRequest}
          />
        )}
        {step === 'fee_done' && (
          <div className="pagehead" style={{ textAlign: 'center', maxWidth: 560, margin: '48px auto' }}>
            <h1 className="pagehead__title">
              {feeSuccess ? 'Payment received' : 'Payment cancelled'}
            </h1>
            <p className="pagehead__subtitle">
              {feeSuccess
                ? 'Thank you — your fee payment has been received. A confirmation email is on its way. You can safely close this window.'
                : 'Your payment was cancelled. You can reopen the payment link from your email to try again.'}
            </p>
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <span>© MapleRecord</span>
        </div>
      </footer>
    </div>
  )
}
