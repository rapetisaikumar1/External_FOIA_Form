interface VerifyingPageProps {
  /** 'verifying' spinner (default), 'processing' async-payment notice, or 'error'. */
  variant?: 'verifying' | 'processing' | 'error'
  message?: string | null
  onRetry?: () => void
}

/** Shown after returning from Stripe while the payment is confirmed. */
export default function VerifyingPage({
  variant = 'verifying',
  message,
  onRetry,
}: VerifyingPageProps) {
  if (variant === 'processing') {
    return (
      <div className="pay-panel">
        <div className="verifying">
          <span className="page-spinner" aria-hidden="true" />
          <p className="verifying__title">Your payment is processing</p>
          <p className="verifying__hint">
            {message ||
              'This can take a moment. Your request will be submitted ' +
                'automatically once the payment is confirmed — you can keep ' +
                'this window open or check again.'}
          </p>
          {onRetry && (
            <button type="button" className="btn btn--primary" onClick={onRetry}>
              Check again
            </button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'error') {
    return (
      <div className="pay-panel">
        <div className="verifying">
          <p className="verifying__title">We couldn’t confirm your payment</p>
          <p className="verifying__hint">{message}</p>
          {onRetry && (
            <button type="button" className="btn btn--primary" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="pay-panel">
      <div className="verifying">
        <span className="page-spinner" aria-hidden="true" />
        <p className="verifying__title">Confirming your payment…</p>
        <p className="verifying__hint">
          Please wait a moment and do not close this window.
        </p>
      </div>
    </div>
  )
}
