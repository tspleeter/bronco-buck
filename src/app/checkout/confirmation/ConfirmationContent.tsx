"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { trackPixel } from "@/lib/meta-pixel";
import { Order } from "@/types/order";
import { ActionButton } from "@/components/ActionButton";

export default function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const firedPurchase = useRef<string | null>(null);

  // Browser-side Purchase event. eventID = orderId so it deduplicates with the
  // server-side Conversions API event fired from /api/orders. Guarded so it
  // fires at most once per order (React re-renders / strict mode).
  useEffect(() => {
    if (!order) return;
    if (firedPurchase.current === order.orderId) return;
    firedPurchase.current = order.orderId;
    trackPixel(
      "Purchase",
      {
        currency: "USD",
        value: Number(order.pricing.total.toFixed(2)),
        num_items: order.items.reduce((n, i) => n + i.quantity, 0),
        order_id: order.orderId,
        content_type: "product",
        contents: order.items.map((i) => ({
          id: i.productId,
          quantity: i.quantity,
          item_price: i.price,
        })),
      },
      { eventID: order.orderId }
    );
  }, [order]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (orderId) {
        try {
          const found = await getOrderById(orderId);
          if (!cancelled) setOrder(found ?? null);
        } catch {
          if (!cancelled) setOrder(null);
        }
      }
    };

    load();

    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", checkMobile);
    };
  }, [orderId]);

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24, background: "#fff" }}>
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 20,
          padding: isMobile ? 22 : 32,
        }}
      >
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.12em" }}>
          Order Confirmed
        </p>
        <h1 style={{ marginTop: 12, fontSize: isMobile ? 36 : 48, fontWeight: 900, color: "#111" }}>
          Thank you for your order
        </h1>
        <p style={{ marginTop: 16, fontSize: isMobile ? 16 : 18, color: "#444" }}>
          Your Bronco Buck order has been placed.
        </p>

        {order ? (
          <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
            <div style={{ color: "#111" }}><strong>Order ID:</strong> {order.orderId}</div>
            <div style={{ color: "#111" }}><strong>Placed:</strong> {new Date(order.createdAt).toLocaleString()}</div>
            <div style={{ color: "#111" }}><strong>Customer:</strong> {order.customer.firstName} {order.customer.lastName}</div>
            <div style={{ color: "#111" }}><strong>Email:</strong> {order.customer.email}</div>
            {order.pricing.discount && order.pricing.discount > 0 ? (
              <div style={{ color: "#111" }}>
                <strong>Discount{order.pricing.discountCode ? ` (${order.pricing.discountCode})` : ""}:</strong> −${order.pricing.discount.toFixed(2)}
              </div>
            ) : null}
            <div style={{ color: "#111" }}><strong>Total:</strong> ${order.pricing.total.toFixed(2)}</div>
            <div style={{ color: "#111" }}>
              <strong>Items:</strong>
              <ul style={{ marginTop: 8, color: "#333" }}>
                {order.items.map((item) => (
                  <li key={item.cartItemId}>
                    {item.productName} × {item.quantity} — ${(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p style={{ marginTop: 24, color: "#666" }}>No order details found.</p>
        )}

        <div style={{ marginTop: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/build/bronco-buck-classic">
            <span style={{ display: "inline-block" }}>
              <ActionButton variant="primary">Build Another</ActionButton>
            </span>
          </Link>
          <Link href="/saved">
            <span style={{ display: "inline-block" }}>
              <ActionButton variant="secondary">View Saved Builds</ActionButton>
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
