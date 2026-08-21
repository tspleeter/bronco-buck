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
 * Compute the dollar discount a code yields on a given subtotal, capped so it
 * can never exceed the merchandise subtotal (shipping is always still owed).
 */
export function computeDiscountAmount(
  discount: Pick<Discount, "type" | "value">,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0;
  if (discount.type === "percent") {
    const pct = Math.min(Math.max(discount.value, 0), 100);
    return money(Math.min(subtotal, (subtotal * pct) / 100));
  }
  // fixed dollars off, never more than the subtotal
  return money(Math.min(subtotal, Math.max(discount.value, 0)));
}

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

  const amount = computeDiscountAmount(discount, subtotal);
  if (amount <= 0) {
    return {
      valid: false,
      amount: 0,
      reason: "This code doesn't apply to your cart.",
    };
  }
  return { valid: true, amount };
}
