import { Order, OrderStatus, Carrier, OrderCustomer, OrderEmailKind } from "@/types/order";

// Client-side wrapper around the orders API.
// Previously this read/wrote orders to localStorage — meaning the store
// owner had no visibility into orders and they were lost on browser clear.
// Now all orders are persisted to DynamoDB via the API routes.
//
// Function signatures are unchanged so existing pages work without edits.

/**
 * Create a new order by posting to the API
 */
export async function createOrder(order: Order): Promise<void> {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "Failed to create order");
  }
}

/**
 * Get a single order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | undefined> {
  const res = await fetch(`/api/orders/${orderId}`);

  if (res.status === 404) return undefined;

  if (!res.ok) {
    throw new Error("Failed to fetch order");
  }

  return res.json();
}

/**
 * Get all orders
 */
export async function getOrders(): Promise<Order[]> {
  const res = await fetch("/api/orders");

  if (!res.ok) {
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

export interface FulfillmentPayload {
  status: OrderStatus;
  carrier?: Carrier;
  trackingNumber?: string;
}

/**
 * Update an order's status / tracking (admin). Returns the updated order.
 * Requires the orders_auth cookie (set by the /orders-login gate).
 */
export async function updateOrderFulfillment(
  orderId: string,
  payload: FulfillmentPayload
): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? "Failed to update order");
  }

  return res.json();
}

export interface ResendResult {
  sentTo: string;
  kind: OrderEmailKind;
  order?: Order;
}

/**
 * Resend a customer email (admin). Bypasses the transition guard on PATCH and
 * is logged to the order history. Requires the orders_auth cookie.
 *
 * - `{ carrier?, trackingNumber? }` (top-level button): persists the on-screen
 *   carrier/tracking, then re-sends the shipment email.
 * - `{ eventId }` (history row): re-sends the email that fits that entry
 *   without changing the order.
 *
 * Throws with the real error detail if the send fails.
 */
export async function resendShipmentEmail(
  orderId: string,
  overrides?: { carrier?: Carrier | ""; trackingNumber?: string; eventId?: string }
): Promise<ResendResult> {
  const payload = overrides?.eventId
    ? { eventId: overrides.eventId }
    : overrides
      ? {
          carrier: overrides.carrier || undefined,
          trackingNumber: overrides.trackingNumber?.trim() || undefined,
        }
      : undefined;

  const res = await fetch(`/api/orders/${orderId}/resend-shipment`, {
    method: "POST",
    ...(payload
      ? {
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      : {}),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(
      data.detail ?? data.message ?? "Failed to resend email"
    ) as Error & { order?: Order };
    err.order = data.order;
    throw err;
  }

  return { sentTo: data.sentTo, kind: data.kind, order: data.order };
}

/**
 * Edit the customer's name / contact / shipping address (admin). The change
 * is logged to the order history. Returns the updated order.
 */
export async function updateOrderCustomer(
  orderId: string,
  customer: Partial<OrderCustomer>
): Promise<Order> {
  const res = await fetch(`/api/orders/${orderId}/customer`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message ?? "Failed to update customer");
  }
  return data as Order;
}
