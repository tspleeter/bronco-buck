import { NextResponse } from "next/server";
import { createOrder, getOrders } from "@/lib/orders-db";
import { Order } from "@/types/order";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendPurchaseEvent } from "@/lib/meta-capi";

export async function GET() {
  try {
    const orders = await getOrders();
    return NextResponse.json(orders);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to fetch orders:", detail);
    return NextResponse.json(
      { message: "Failed to fetch orders", detail },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const order = (await req.json()) as Order;

    if (!order.orderId || !order.customer || !order.items) {
      return NextResponse.json(
        { message: "Invalid order payload" },
        { status: 400 }
      );
    }

    await createOrder(order);

    // Send confirmation email — non-blocking, don't fail the order if email fails
    sendOrderConfirmationEmail(order).catch((err) => {
      console.error("Failed to send confirmation email:", err);
    });

    // Server-side Meta Conversions API Purchase — non-blocking. Deduplicates
    // with the browser Pixel Purchase (confirmation page) via order.orderId as
    // the shared event_id. No-ops until Pixel ID + SSM CAPI token are set.
    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    sendPurchaseEvent(order, {
      clientIp,
      userAgent: req.headers.get("user-agent") ?? undefined,
      sourceUrl: req.headers.get("referer") ?? undefined,
    }).catch((err) => {
      console.error("Failed to send Meta CAPI purchase event:", err);
    });

    return NextResponse.json(order, { status: 201 });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Failed to create order:", detail);
    return NextResponse.json(
      { message: "Failed to create order", detail },
      { status: 500 }
    );
  }
}
