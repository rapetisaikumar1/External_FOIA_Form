/**
 * Payment figures + calculation for the Payment Summary step.
 *
 * Frontend-only for now. A later phase can source these numbers from the
 * backend and reuse `computePayment` / `formatCurrency` without UI changes.
 */
export const APPLICATION_FEE = 25
export const GST_RATE = 0.15 // 15%

export interface PaymentBreakdown {
  fee: number
  rate: number
  gst: number
  total: number
}

export function computePayment(
  fee: number = APPLICATION_FEE,
  rate: number = GST_RATE,
): PaymentBreakdown {
  const gst = fee * rate
  return { fee, rate, gst, total: fee + gst }
}

export function formatCurrency(amount: number): string {
  // Canada-only rollout: every amount is shown in Canadian Dollars (CAD).
  return `CA$${amount.toFixed(2)}`
}
