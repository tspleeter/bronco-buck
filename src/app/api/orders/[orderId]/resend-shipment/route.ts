import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  getOrderById,
  updateOrderFulfillment,
  appendOrderEvent,
} from "@/lib/orders-db";
import { buildTrackingUrl } from "@/lib/shipping";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  emailKindForStatus,
  newEventId,
  nowIso,
  sendOrderEmail,
} from "@/lib/order-events";
import { Carrier, Order, OrderEmailKind } from "@/types/order";

const VALID_CARRIERS: Carrier[] = ["usps", "ups", "fedex", "dhl", "other"];

// POST /api/orders/[orderId]/resend-shipment
//
// Two modes, both unconditional (independent of the PATCH transition guard),
// both awaited, both logged to order.history as an "email_resent" entry:
//
// 1. Top-level "Resend shipment email" — body { carrier?, trackingNumber? }.
//    WYSIWYG: any carrier/tracking typed into the form is persisted (status
//    unchanged → no double-notify) before the shipment email is sent. Empty
//    overrides fall back to the stored values (never wipes). A bare POST
//    re-sends the order exactly as stored.
//
// 2. History-row "Resend email" — body { eventId }. Re-sends the email that
//    fits that entry: a fulfillment save in shipped/delivered → the shipment
//    email with THAT entry's carrier/tracking; any other status → the order
//    confirmation. A customer-info entry uses the order's current state.
//    Nothing on the order is changed; it always goes to the current customer
//    email (so fixing an address then resending reaches the right inbox).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId } = await params;
    let order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      carrier?: Carrier | "";
      trackingNumber?: string;
      eventId?: string;
    };

    let emailOrder: Order = order;
    let kind: OrderEmailKind = "shipment";
    let sourceEventId: string | undefined;

    if (body?.eventId) {
      const source = order.history?.find((e) => e.id === body.eventId);
      if (!source || source.type === "email_resent") {
        return NextResponse.json(
          { message: "That history entry can't be re-sent" },
          { status: 400 }
        );
      }
      sourceEventId = source.id;
      if (source.type === "fulfillment_saved") {
        kind = emailKindForStatus(source.status);
        emailOrder = {
          ...order,
          carrier: source.carrier,
          trackingNumber: source.trackingNumber,
          trackingUrl:
            source.trackingUrl ??
            buildTrackingUrl(source.carrier, source.trackingNumber),
        };
      } else {
        kind = emailKindForStatus(order.status);
      }
    } else {
      const hasOverrides =
        body != null &&
        (body.carrier !== undefined || body.trackingNumber !== undefined);

      if (hasOverrides) {
        if (body.carrier && !VALID_CARRIERS.includes(body.carrier)) {
          return NextResponse.json({ message: "Invalid carrier" }, { status: 400 });
        }
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
      emailOrder = order;
    }

    const email = await sendOrderEmail(emailOrder, kind);

    const logged = await appendOrderEvent(orderId, {
      id: newEventId(),
      at: nowIso(),
      type: "email_resent",
      sourceEventId,
      carrier: kind === "shipment" ? emailOrder.carrier : undefined,
      trackingNumber: kind === "shipment" ? emailOrder.trackingNumber : undefined,
      trackingUrl: kind === "shipment" ? emailOrder.trackingUrl : undefined,
      email,
    });

    if (!email.sent) {
      return NextResponse.json(
        { message: `Failed to send ${kind} email`, detail: email.error, order: logged },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, sentTo: email.to, kind, order: logged });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to resend email:", detail);
    return NextResponse.json(
      { message: "Failed to resend email", detail },
      { status: 500 }
    );
  }
}
