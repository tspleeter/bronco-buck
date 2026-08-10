import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOrderById, updateOrderFulfillment } from "@/lib/orders-db";
import { sendShipmentEmail } from "@/lib/email";
import { buildTrackingUrl } from "@/lib/shipping";
import { Carrier } from "@/types/order";

const ORDERS_PASSWORD = process.env.ORDERS_PASSWORD ?? "061970";
const COOKIE_NAME = "orders_auth";
const VALID_CARRIERS: Carrier[] = ["usps", "ups", "fedex", "dhl", "other"];

// POST /api/orders/[orderId]/resend-shipment
// Re-sends the shipment notification email for an order, unconditionally —
// independent of the status-transition guard on the PATCH route. Useful when
// the original email never arrived (order was already "shipped" when saved, a
// transient SES error, spam, etc). Unlike the fire-and-forget send in PATCH,
// this awaits the send and returns the real error detail if it fails.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  // Guard: same cookie gate as the /orders admin pages
  if (req.cookies.get(COOKIE_NAME)?.value !== ORDERS_PASSWORD) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await params;
    let order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (!order.customer?.email) {
      return NextResponse.json(
        { message: "Order has no customer email on file" },
        { status: 400 }
      );
    }

    // WYSIWYG resend: the admin can edit the carrier / tracking fields and hit
    // "Resend" without a separate Save. When the client sends those form values,
    // persist them (recomputing the tracking URL) BEFORE emailing, so the resend
    // reflects what's on screen rather than a stale, tracking-less DB record.
    // Body is optional — a bare POST re-sends the order exactly as stored.
    const body = (await req.json().catch(() => ({}))) as {
      carrier?: Carrier | "";
      trackingNumber?: string;
    };
    const hasOverrides =
      body != null &&
      (body.carrier !== undefined || body.trackingNumber !== undefined);

    if (hasOverrides) {
      if (body.carrier && !VALID_CARRIERS.includes(body.carrier)) {
        return NextResponse.json({ message: "Invalid carrier" }, { status: 400 });
      }
      // Empty override falls back to what's already on the order (never wipes).
      const carrier = body.carrier || order.carrier;
      const trackingNumber =
        body.trackingNumber?.trim() || order.trackingNumber;
      const trackingUrl = buildTrackingUrl(carrier, trackingNumber);

      const updated = await updateOrderFulfillment(orderId, {
        status: order.status, // unchanged — no status transition, no double-notify
        carrier,
        trackingNumber,
        trackingUrl,
        shippedAt: order.shippedAt,
      });
      if (updated) order = updated;
    }

    await sendShipmentEmail(order);

    return NextResponse.json({ ok: true, sentTo: order.customer.email });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to resend shipment email:", detail);
    return NextResponse.json(
      { message: "Failed to resend shipment email", detail },
      { status: 500 }
    );
  }
}
