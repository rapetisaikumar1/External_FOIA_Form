import { computePayment, formatCurrency } from '../lib/paymentSummary'

export interface PaymentPageProps {
  onBack: () => void
  /** Pay Now — redirects to Stripe Checkout to collect payment. */
  onSubmit: () => void
  submitting: boolean
  error: string | null
}

/**
 * Step 3 — the Payment Summary. Shows the amount payable, then redirects to
 * Stripe Checkout to collect payment. The request is created by the backend
 * only after the payment is verified — never before.
 */
export default function PaymentPage({
  onBack,
  onSubmit,
  submitting,
  error,
}: PaymentPageProps) {
  const { fee, gst, total, rate } = computePayment()

  return (
    <div className="pay-panel">
      <div className="pagehead">
        <h1 className="pagehead__title">Payment Summary</h1>
        <p className="pagehead__subtitle">
          Review the amount payable, then submit your request.
        </p>
      </div>

      <div className="form">
        <div className="paycard">
          <div className="paycard__row">
            <span className="paycard__label">Application Fee</span>
            <span className="paycard__amount">{formatCurrency(fee)}</span>
          </div>
          <div className="paycard__row">
            <span className="paycard__label">GST/VAT ({Math.round(rate * 100)}%)</span>
            <span className="paycard__amount">{formatCurrency(gst)}</span>
          </div>
          <div className="paycard__row paycard__row--total">
            <span className="paycard__label">Total Payable</span>
            <span className="paycard__amount">{formatCurrency(total)}</span>
          </div>
        </div>

        <p className="pay-note">
          You’ll be redirected to Stripe’s secure checkout to pay. Your request
          is submitted only after your payment succeeds.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <div className="pay-actions">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onSubmit}
            disabled={submitting}
            aria-busy={submitting}
          >
            {submitting && <span className="btn__spinner" aria-hidden="true" />}
            {submitting ? 'Redirecting…' : 'Pay Now'}
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onBack}
            disabled={submitting}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  )
}
