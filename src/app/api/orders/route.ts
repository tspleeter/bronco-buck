import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { createOrder, getOrders } from "@/lib/orders-db";
import { Order } from "@/types/order";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { incrementRedemption } from "@/lib/discounts-db";

// Admin only: the full order list carries every customer's name, email,
// phone and address. (Previously public — /api isn't covered by proxy.ts.)
export async function GET(req: NextRequest) {
  if (!(await isAdminRequest(req))) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
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

    // History is admin-written only; never accept it from the client.
    delete order.history;

    await createOrder(order);

    // Bump the discount's redemption counter — best-effort, never fail the
    // order over usage tracking. Only counts codes that actually applied.
    if (order.pricing?.discountCode && (order.pricing.discount ?? 0) > 0) {
      incrementRedemption(order.pricing.discountCode).catch((err) => {
        console.error("Failed to increment discount redemption:", err);
      });
    }

    // Send confirmation email — awaited (a fire-and-forget send can be frozen
    // with the Lambda once the response returns), but never fails the order.
    try {
      await sendOrderConfirmationEmail(order);
    } catch (err) {
      console.error("Failed to send confirmation email:", err);
    }

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
