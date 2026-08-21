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
