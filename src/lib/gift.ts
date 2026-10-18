import type { Order, OrderGift } from "@/types/order";

export const GIFT_MESSAGE_MAX = 250;

/** Name the box is addressed to: the gift recipient, else the buyer. */
export function shipToName(order: Pick<Order, "customer" | "gift">): string {
  if (order.gift) return `${order.gift.recipientFirstName} ${order.gift.recipientLastName}`.trim();
  return `${order.customer.firstName} ${order.customer.lastName}`.trim();
}

/**
 * Server-side cleanup of a client-sent gift block. Returns undefined when it
 * isn't a usable gift (missing recipient name), so a malformed payload just
 * becomes a normal order instead of failing.
 */
export function sanitizeGift(raw: unknown): OrderGift | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const g = raw as Record<string, unknown>;
  const str = (v: unknown, max: number) =>
    typeof v === "string" ? v.replace(/\s+$/g, "").trim().slice(0, max) : "";
  const recipientFirstName = str(g.recipientFirstName, 60);
  const recipientLastName = str(g.recipientLastName, 60);
  if (!recipientFirstName || !recipientLastName) return undefined;
  const message = typeof g.message === "string"
    ? g.message.replace(/\r\n/g, "\n").trim().slice(0, GIFT_MESSAGE_MAX)
    : "";
  return { recipientFirstName, recipientLastName, ...(message ? { message } : {}) };
}
