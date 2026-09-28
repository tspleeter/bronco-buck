import { Order, OrderEmailKind, OrderEmailResult, OrderStatus } from "@/types/order";
import { sendOrderConfirmationEmail, sendShipmentEmail } from "@/lib/email";

// Server-only helpers for the admin order history.

export function newEventId(): string {
  return crypto.randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

/** Which customer email fits an order in this status. */
export function emailKindForStatus(status: OrderStatus): OrderEmailKind {
  return status === "shipped" || status === "delivered" ? "shipment" : "confirmation";
}

/**
 * Send an order email and report the outcome instead of throwing. Always
 * awaited: on Amplify's SSR Lambda a fire-and-forget send can be frozen once
 * the response returns, which silently drops the email.
 */
export async function sendOrderEmail(
  order: Order,
  kind: OrderEmailKind
): Promise<OrderEmailResult> {
  const to = order.customer?.email ?? "";
  try {
    if (!to) throw new Error("Order has no customer email on file");
    if (kind === "shipment") {
      await sendShipmentEmail(order);
    } else {
      await sendOrderConfirmationEmail(order);
    }
    return { kind, to, sent: true };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error(`Failed to send ${kind} email:`, error);
    return { kind, to, sent: false, error };
  }
}
