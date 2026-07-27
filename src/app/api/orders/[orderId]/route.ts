import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOrderById, updateOrderFulfillment } from "@/lib/orders-db";
import { sendShipmentEmail } from "@/lib/email";
import { buildTrackingUrl } from "@/lib/shipping";
import { Carrier, OrderStatus } from "@/types/order";

const ORDERS_PASSWORD = process.env.ORDERS_PASSWORD ?? "061970";
const COOKIE_NAME = "orders_auth";

const VALID_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const VALID_CARRIERS: Carrier[] = ["usps", "ups", "fedex", "dhl", "other"];

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    console.error("Failed to fetch order:", err);
    return NextResponse.json(
      { message: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // Guard: same cookie gate as the /orders admin pages
  if (req.cookies.get(COOKIE_NAME)?.value !== ORDERS_PASSWORD) {
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

    // Fire the shipment email only on the transition INTO shipped, so
    // editing a tracking number on an already-shipped order won't re-notify.
    if (updated && nowShipping && !wasShipped) {
      sendShipmentEmail(updated).catch((err) => {
        console.error("Failed to send shipment email:", err);
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to update order:", detail);
    return NextResponse.json(
      { message: "Failed to update order", detail },
      { status: 500 }
    );
  }
}
