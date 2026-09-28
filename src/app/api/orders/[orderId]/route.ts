import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getOrderById,
  updateOrderFulfillment,
  appendOrderEvent,
} from "@/lib/orders-db";
import { buildTrackingUrl } from "@/lib/shipping";
import { isAdminRequest } from "@/lib/admin-auth";
import { newEventId, nowIso, sendOrderEmail } from "@/lib/order-events";
import { Carrier, OrderEmailResult, OrderStatus } from "@/types/order";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const VALID_CARRIERS: Carrier[] = ["usps", "ups", "fedex", "dhl", "other"];

// Public: the checkout confirmation page loads the order it just placed by its
// (unguessable UUID) id. The admin history is stripped from the public payload.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (await isAdminRequest(req)) {
      return NextResponse.json(order);
    }
    const publicOrder = { ...order };
    delete publicOrder.history;
    return NextResponse.json(publicOrder);
  } catch (err) {
    console.error("Failed to fetch order:", err);
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// Admin: save fulfillment (status / carrier / tracking). Every save is logged
// to order.history, including the outcome of any automatic shipment email.
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await params;
    const body = (await req.json()) as {
      status?: OrderStatus;
      carrier?: Carrier;
      trackingNumber?: string;
    };

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { message: "A valid status is required" },
        { status: 400 }
      );
    }
    if (body.carrier && !VALID_CARRIERS.includes(body.carrier)) {
      return NextResponse.json(
        { message: "Invalid carrier" },
        { status: 400 }
      );
    }

    const existing = await getOrderById(orderId);
    if (!existing) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const trackingNumber = body.trackingNumber?.trim() || undefined;
    const carrier = body.carrier;
    const trackingUrl = buildTrackingUrl(carrier, trackingNumber);

    const nowShipping = body.status === "shipped";
    const wasShipped = existing.status === "shipped";

    const updated = await updateOrderFulfillment(orderId, {
      status: body.status,
      carrier,
      trackingNumber,
      trackingUrl,
      // Stamp shippedAt the first time it moves to "shipped"
      shippedAt: nowShipping
        ? existing.shippedAt ?? new Date().toISOString()
        : existing.shippedAt,
    });
    if (!updated) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Email only on the transition INTO shipped, so editing tracking on an
    // already-shipped order won't re-notify. Awaited (see sendOrderEmail).
    let email: OrderEmailResult | undefined;
    if (nowShipping && !wasShipped) {
      email = await sendOrderEmail(updated, "shipment");
    }

    const logged = await appendOrderEvent(orderId, {
      id: newEventId(),
      at: nowIso(),
      type: "fulfillment_saved",
      previousStatus: existing.status,
      status: updated.status,
      carrier: updated.carrier,
      trackingNumber: updated.trackingNumber,
      trackingUrl: updated.trackingUrl,
      email,
    });

    return NextResponse.json(logged ?? updated);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to update order:", detail);
    return NextResponse.json(
      { message: "Failed to update order", detail },
      { status: 500 }
    );
  }
}
