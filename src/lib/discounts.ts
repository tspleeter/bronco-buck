import { Discount } from "@/types/discount";

// Client-side wrappers around the discount API routes.
// Admin calls (list/create/update/delete) require the orders_auth cookie set by
// the /orders-login gate. validateDiscountCode is public (checkout).

export interface CreateDiscountPayload {
  code: string;
  type: Discount["type"];
  value: number;
  active?: boolean;
  maxRedemptions?: number | null;
  minSubtotal?: number | null;
  expiresAt?: string | null;
  description?: string;
}

export type UpdateDiscountPayload = Partial<
  Omit<CreateDiscountPayload, "code">
> & { description?: string | null };

async function parseError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return data.message ?? fallback;
}

export async function listDiscounts(): Promise<Discount[]> {
  const res = await fetch("/api/discounts", { cache: "no-store" });
  if (!res.ok) throw new Error(await parseError(res, "Failed to load discounts"));
  return res.json();
}

export async function createDiscount(
  payload: CreateDiscountPayload,
): Promise<Discount> {
  const res = await fetch("/api/discounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to create discount"));
  return res.json();
}

export async function updateDiscount(
  code: string,
  payload: UpdateDiscountPayload,
): Promise<Discount> {
  const res = await fetch(`/api/discounts/${encodeURIComponent(code)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to update discount"));
  return res.json();
}

export async function deleteDiscount(code: string): Promise<void> {
  const res = await fetch(`/api/discounts/${encodeURIComponent(code)}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to delete discount"));
}

export interface DiscountValidation {
  valid: boolean;
  code: string;
  discount: number;
  reason?: string;
}

/** Public: check a code against a subtotal for immediate checkout feedback. */
export async function validateDiscountCode(
  code: string,
  subtotal: number,
): Promise<DiscountValidation> {
  const res = await fetch("/api/validate-discount", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store",
    },
    body: JSON.stringify({ code, subtotal }),
  });
  return res.json();
}
