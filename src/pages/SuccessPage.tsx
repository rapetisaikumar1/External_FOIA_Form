export interface SuccessPageProps {
  trackingNumber: string
  onNewRequest: () => void
}

export default function SuccessPage({
  trackingNumber,
  onNewRequest,
}: SuccessPageProps) {
  return (
    <>
      <div className="pagehead">
        <h1 className="pagehead__title">Payment successful</h1>
      </div>
      <div className="form">
        <div className="success">
          <div className="success__icon" aria-hidden="true">
            <svg
              width="34"
              height="34"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p className="success__message">
            Your payment was successful and your request has been submitted.
          </p>
          <div className="success__tracking">
            <span className="success__tracking-label">Tracking number</span>
            <span className="success__tracking-number">{trackingNumber}</span>
          </div>
          <p className="success__hint">
            Please keep this number for your records — you can use it to follow
            up on your request.
          </p>
        </div>
        <div className="page-nav page-nav--center">
          <button
            type="button"
            className="btn btn--primary"
            onClick={onNewRequest}
          >
            Submit another request
          </button>
        </div>
      </div>
    </>
  )
}
