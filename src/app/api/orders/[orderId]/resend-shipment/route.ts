import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getOrderById } from "@/lib/orders-db";
import { sendShipmentEmail } from "@/lib/email";

const ORDERS_PASSWORD = process.env.ORDERS_PASSWORD ?? "061970";
const COOKIE_NAME = "orders_auth";

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
    const order = await getOrderById(orderId);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (!order.customer?.email) {
      return NextResponse.json(
        { message: "Order has no customer email on file" },
        { status: 400 }
      );
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
