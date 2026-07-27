import { Order, OrderStatus, Carrier } from "@/types/order";

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

/**
 * Resend the shipment notification email for an order (admin), regardless of
 * status — bypasses the transition guard on PATCH. Requires the orders_auth
 * cookie. Returns the address it was sent to; throws with the real error
 * detail if the send fails.
 */
export async function resendShipmentEmail(orderId: string): Promise<string> {
  const res = await fetch(`/api/orders/${orderId}/resend-shipment`, {
    method: "POST",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(
      data.detail ?? data.message ?? "Failed to resend shipment email"
    );
  }

  return data.sentTo as string;
}
