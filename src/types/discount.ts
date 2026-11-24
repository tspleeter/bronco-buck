export type DiscountType = "percent" | "fixed";

export interface Discount {
  /** Uppercased, trimmed code — the DynamoDB partition key. */
  code: string;
  type: DiscountType;
  /** percent: 1–100 (percent off). fixed: dollars off. */
  value: number;
  active: boolean;
  /** How many times this code has been redeemed on a paid order. */
  timesUsed: number;
  /** Optional redemption cap. null/absent = unlimited. */
  maxRedemptions?: number | null;
  /** Optional minimum merchandise subtotal (dollars) required to use the code. */
  minSubtotal?: number | null;
  /** Optional expiry (ISO 8601). Absent = never expires. */
  expiresAt?: string | null;
  /**
   * Gift codes (Nov 2026): a fixed code that may also cover shipping. The
   * amount is applied to merchandise first, then to shipping. Absent = false.
   */
  coversShipping?: boolean;
  /**
   * "Free Buck" gift codes (Nov 24 2026): instead of a fixed dollar value the
   * code is worth one plain Bronco Buck at the CURRENT price (sale or list) —
   * plus shipping when coversShipping is also set. Upgrades are not covered.
   * `value` is ignored when this is true.
   */
  freeBuck?: boolean;
  /** Optional internal note (not shown to customers). */
  description?: string;
  createdAt: string;
  updatedAt: string;
}

/** Result of evaluating a code against a cart subtotal. */
export interface DiscountEvaluation {
  valid: boolean;
  /** Discount amount in dollars (0 when invalid). */
  amount: number;
  /** Customer-facing reason when invalid. */
  reason?: string;
}
