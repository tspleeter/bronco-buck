"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { Order } from "@/types/order";
import { ActionButton } from "@/components/ActionButton";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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
      } else {
        setOrder(null);
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
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
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
        <p
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 700,
            color: "#666",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          Order Confirmed
        </p>

        <h1
          style={{
            marginTop: 12,
            fontSize: isMobile ? 36 : 48,
            fontWeight: 900,
          }}
        >
          Thank you for your order
        </h1>

        <p style={{ marginTop: 16, fontSize: isMobile ? 16 : 18, color: "#555" }}>
          Your Bronco Buck order has been placed.
        </p>

        {order ? (
          <div style={{ marginTop: 24, display: "grid", gap: 20 }}>
            <div>
              <strong>Order ID:</strong> {order.orderId}
            </div>

            <div>
              <strong>Placed:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </div>

            <div>
              <strong>Customer:</strong> {order.customer.firstName}{" "}
              {order.customer.lastName}
            </div>

            <div>
              <strong>Email:</strong> {order.customer.email}
            </div>

            <div>
              <strong>Total:</strong> ${order.pricing.total.toFixed(2)}
            </div>

            <div>
              <strong>Items:</strong>
              <ul style={{ marginTop: 8 }}>
                {order.items.map((item) => (
                  <li key={item.cartItemId}>
                    {item.productName} × {item.quantity} — $
                    {(item.price * item.quantity).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p style={{ marginTop: 24, color: "#666" }}>
            No order details found.
          </p>
        )}

        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
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
