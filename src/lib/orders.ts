import { Order } from "@/types/order";

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
