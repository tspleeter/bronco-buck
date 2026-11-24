import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { appendOrderEvent, createOrder, getOrders } from "@/lib/orders-db";
import { Order } from "@/types/order";
import { newEventId, nowIso, sendOrderEmail } from "@/lib/order-events";
import { sendPurchaseEvent } from "@/lib/meta-capi";
import { getDiscount, incrementRedemption } from "@/lib/discounts-db";
import { evaluateDiscount, normalizeCode, STRIPE_MIN_CHARGE } from "@/lib/discount-logic";
import { shippingFor } from "@/lib/shipping-rules";
import { sanitizeGift } from "@/lib/gift";

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

    // Gift block: trim, cap the message, drop it if the recipient is missing.
    const gift = sanitizeGift(order.gift);
    if (gift) order.gift = gift;
    else delete order.gift;

    // A $0 order (no card charge) is only allowed when a gift code really
    // covers merchandise + shipping. Re-check the code server-side.
    if ((order.pricing?.total ?? 0) < STRIPE_MIN_CHARGE) {
      const subtotal = order.items.reduce(
        (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 0),
        0,
      );
      const count = order.items.reduce((n, i) => n + (Number(i.quantity) || 0), 0);
      const shipping = shippingFor(count);
      const code = normalizeCode(order.pricing?.discountCode);
      const evaluation = code
        ? evaluateDiscount(await getDiscount(code), subtotal, undefined, shipping)
        : { valid: false, amount: 0 };
      if (
        subtotal <= 0 ||
        !evaluation.valid ||
        subtotal + shipping - evaluation.amount >= STRIPE_MIN_CHARGE
      ) {
        return NextResponse.json(
          { message: "This order needs a payment." },
          { status: 400 },
        );
      }
      order.pricing = {
        ...order.pricing,
        subtotal,
        shipping,
        discount: Math.round((subtotal + shipping) * 100) / 100,
        discountCode: code,
        tax: 0,
        total: 0,
      };
    }

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
    // Outcome is logged to the order history so the admin page shows whether
    // the confirmation went out (it used to leave no record anywhere).
    const email = await sendOrderEmail(order, "confirmation");
    try {
      await appendOrderEvent(order.orderId, {
        id: newEventId(),
        at: nowIso(),
        type: "order_placed",
        email,
      });
    } catch (err) {
      console.error("Failed to log confirmation email:", err);
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
