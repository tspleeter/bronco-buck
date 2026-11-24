import { Discount, DiscountEvaluation } from "@/types/discount";

/**
 * Normalize a discount code to its canonical stored form: trimmed, uppercased,
 * internal whitespace collapsed. This is both the DynamoDB key and what we show
 * back to the customer, so apply it everywhere a code enters the system.
 */
export function normalizeCode(raw: string | undefined | null): string {
  return (raw ?? "").trim().toUpperCase().replace(/\s+/g, "");
}

/** Round a dollar amount to cents, clamped at >= 0. */
function money(n: number): number {
  return Math.max(0, Math.round(n * 100) / 100);
}

/**
 * Compute the dollar discount a code yields. Capped at the merchandise
 * subtotal (shipping still owed) — except gift codes with `coversShipping`,
 * which may also absorb the shipping charge (applied to merchandise first).
 */
export function computeDiscountAmount(
  discount: Pick<Discount, "type" | "value" | "coversShipping">,
  subtotal: number,
  shipping: number = 0,
): number {
  if (subtotal <= 0) return 0;
  if (discount.type === "percent") {
    const pct = Math.min(Math.max(discount.value, 0), 100);
    return money(Math.min(subtotal, (subtotal * pct) / 100));
  }
  const cap = subtotal + (discount.coversShipping ? Math.max(shipping, 0) : 0);
  return money(Math.min(cap, Math.max(discount.value, 0)));
}

/**
 * Split an applied discount into the merchandise part and the shipping part
 * (only non-zero for coversShipping gift codes).
 */
export function splitDiscount(
  discount: number,
  subtotal: number,
  shipping: number,
): { merchandise: number; shipping: number } {
  const merchandise = money(Math.min(discount, subtotal));
  return { merchandise, shipping: money(Math.min(shipping, discount - merchandise)) };
}

/**
 * Stripe can't charge less than $0.50. When a gift code leaves a balance under
 * that, we absorb it and treat the order as fully covered.
 */
export const STRIPE_MIN_CHARGE = 0.5;

/**
 * Server-authoritative validation of a code against a cart. Pure — callers pass
 * the loaded Discount (or undefined if not found) plus the current subtotal and
 * time, and get back {valid, amount, reason}. This is the ONLY place the rules
 * live, so the checkout preview, the tax/PI calc, and any future surface all
 * agree.
 */
export function evaluateDiscount(
  discount: Discount | undefined,
  subtotal: number,
  nowIso: string = new Date().toISOString(),
  shipping: number = 0,
): DiscountEvaluation {
  if (!discount) {
    return { valid: false, amount: 0, reason: "That code isn't valid." };
  }
  if (!discount.active) {
    return { valid: false, amount: 0, reason: "This code is no longer active." };
  }
  if (discount.expiresAt && nowIso > discount.expiresAt) {
    return { valid: false, amount: 0, reason: "This code has expired." };
  }
  if (
    discount.maxRedemptions != null &&
    discount.timesUsed >= discount.maxRedemptions
  ) {
    return {
      valid: false,
      amount: 0,
      reason: "This code has reached its redemption limit.",
    };
  }
  if (discount.minSubtotal != null && subtotal < discount.minSubtotal) {
    return {
      valid: false,
      amount: 0,
      reason: `Requires a minimum subtotal of $${discount.minSubtotal.toFixed(2)}.`,
    };
  }

  const amount = computeDiscountAmount(discount, subtotal, shipping);
  if (amount <= 0) {
    return {
      valid: false,
      amount: 0,
      reason: "This code doesn't apply to your cart.",
    };
  }
  return { valid: true, amount };
}
