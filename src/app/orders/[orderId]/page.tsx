"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { Order } from "@/types/order";
import { ActionButton } from "@/components/ActionButton";

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const found = await getOrderById(orderId);
        if (!cancelled) setOrder(found ?? null);
      } catch {
        if (!cancelled) setOrder(null);
      } finally {
        if (!cancelled) setIsLoading(false);
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

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888", fontSize: 14 }}>Loading order…</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <h1 style={{ marginTop: 0 }}>Order not found</h1>
          <p style={{ color: "#666" }}>This order could not be found.</p>
          <Link href="/orders">
            <span style={{ display: "inline-block", marginTop: 12 }}>
              <ActionButton variant="primary">Back to Orders</ActionButton>
            </span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gap: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
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
              Order Detail
            </p>
            <h1 style={{ margin: "10px 0 0", fontSize: isMobile ? 34 : 44, fontWeight: 900 }}>
              Order #{order.orderId.slice(0, 8)}
            </h1>
          </div>

          <Link href="/orders">
            <span style={{ display: "inline-block" }}>
              <ActionButton variant="secondary">Back to Orders</ActionButton>
            </span>
          </Link>
        </div>

        <section
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 16,
            padding: isMobile ? 18 : 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <div>
              <h2 style={{ marginTop: 0 }}>Customer</h2>
              <div style={{ display: "grid", gap: 6, color: "#555" }}>
                <div>{order.customer.firstName} {order.customer.lastName}</div>
                <div>{order.customer.email}</div>
                {order.customer.phone ? <div>{order.customer.phone}</div> : null}
                <div>{order.customer.address1}</div>
                {order.customer.address2 ? <div>{order.customer.address2}</div> : null}
                <div>{order.customer.city}, {order.customer.state} {order.customer.zip}</div>
                {order.customer.country ? <div>{order.customer.country}</div> : null}
              </div>
            </div>

            <div>
              <h2 style={{ marginTop: 0 }}>Summary</h2>
              <div style={{ display: "grid", gap: 6, color: "#555" }}>
                <div>Status: {order.status}</div>
                <div>Placed: {new Date(order.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(order.updatedAt).toLocaleString()}</div>
                <div>Subtotal: ${order.pricing.subtotal.toFixed(2)}</div>
                <div>Shipping: ${order.pricing.shipping.toFixed(2)}</div>
                {order.pricing.tax !== undefined ? (
                  <div>Tax: ${order.pricing.tax.toFixed(2)}</div>
                ) : null}
                <div style={{ fontWeight: 700 }}>
                  Total: ${order.pricing.total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 16,
            padding: isMobile ? 18 : 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Items</h2>
          <div style={{ display: "grid", gap: 16 }}>
            {order.items.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  border: "1px solid #eee",
                  borderRadius: 12,
                  padding: 14,
                  background: "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <strong>{item.productName}</strong>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
                <div style={{ marginTop: 8, color: "#666" }}>Qty: {item.quantity}</div>
                {item.customFields?.nameplateText ? (
                  <div style={{ marginTop: 6, color: "#666" }}>
                    Nameplate: {item.customFields.nameplateText}
                  </div>
                ) : null}
                <div style={{ marginTop: 8, color: "#666", fontSize: 14 }}>
                  Product ID: {item.productId}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
