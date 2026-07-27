"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderById, updateOrderFulfillment } from "@/lib/orders";
import { Order, OrderStatus, Carrier } from "@/types/order";
import { CARRIERS, CARRIER_LABELS } from "@/lib/shipping";
import { ActionButton } from "@/components/ActionButton";

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Fulfillment form state
  const [status, setStatus] = useState<OrderStatus>("paid");
  const [carrier, setCarrier] = useState<Carrier | "">("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  function seedForm(o: Order) {
    setStatus(o.status);
    setCarrier(o.carrier ?? "");
    setTrackingNumber(o.trackingNumber ?? "");
  }

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const found = await getOrderById(orderId);
        if (!cancelled) {
          setOrder(found ?? null);
          if (found) seedForm(found);
        }
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

  const handleSave = async () => {
    if (!orderId) return;
    setSaving(true);
    setMessage(null);
    try {
      const willNotify = status === "shipped" && order?.status !== "shipped";
      const updated = await updateOrderFulfillment(orderId, {
        status,
        carrier: carrier || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
      });
      setOrder(updated);
      seedForm(updated);
      setMessage({
        kind: "ok",
        text: willNotify
          ? "Saved — shipment email sent to the customer."
          : "Order updated.",
      });
    } catch (err) {
      setMessage({
        kind: "err",
        text: err instanceof Error ? err.message : "Failed to update order",
      });
    } finally {
      setSaving(false);
    }
  };

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
            color: "#111",
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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #ccc",
    fontSize: 14,
    background: "#fff",
    color: "#111",
    boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 6,
  };

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
            color: "#111",
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
                {order.shippedAt ? (
                  <div>Shipped: {new Date(order.shippedAt).toLocaleString()}</div>
                ) : null}
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
            color: "#111",
            border: "1px solid #ddd",
            borderRadius: 16,
            padding: isMobile ? 18 : 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Fulfillment</h2>
          <p style={{ color: "#666", marginTop: 0, fontSize: 14 }}>
            Set the order status and shipment tracking. Moving the status to{" "}
            <strong>shipped</strong> emails the customer their tracking details.
          </p>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
              alignItems: "end",
              marginTop: 8,
            }}
          >
            <div>
              <label style={labelStyle} htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                style={inputStyle}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle} htmlFor="carrier">Carrier</label>
              <select
                id="carrier"
                value={carrier}
                onChange={(e) => setCarrier(e.target.value as Carrier | "")}
                style={inputStyle}
              >
                <option value="">— None —</option>
                {CARRIERS.map((c) => (
                  <option key={c} value={c}>{CARRIER_LABELS[c]}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle} htmlFor="tracking">Tracking number</label>
              <input
                id="tracking"
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. 9400 1000 0000 0000 0000 00"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ display: "inline-block" }} onClick={saving ? undefined : handleSave}>
              <ActionButton variant="primary" disabled={saving}>
                {saving ? "Saving…" : "Save fulfillment"}
              </ActionButton>
            </span>
            {order.trackingUrl ? (
              <a href={order.trackingUrl} target="_blank" rel="noreferrer" style={{ color: "#CA8A04", fontSize: 14, fontWeight: 700 }}>
                Open current tracking ↗
              </a>
            ) : null}
            {message ? (
              <span style={{ fontSize: 14, color: message.kind === "ok" ? "#166534" : "#b91c1c" }}>
                {message.text}
              </span>
            ) : null}
          </div>
        </section>

        <section
          style={{
            background: "#fff",
            color: "#111",
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
