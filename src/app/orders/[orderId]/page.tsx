"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getOrderById, updateOrderFulfillment, resendShipmentEmail } from "@/lib/orders";
import { Order, OrderStatus, Carrier } from "@/types/order";
import { CARRIERS, CARRIER_LABELS } from "@/lib/shipping";
import { ActionButton } from "@/components/ActionButton";
import { OrderItemPreview } from "@/components/OrderPreviewCard";
import { BuildSummary } from "@/components/BuildSummary";
import { getBuildSummary } from "@/lib/summary";
import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";
const broncoConfig = broncoConfigJson as ProductConfig;

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// Status → accent color (design tokens)
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: "var(--color-text-dim)",
  paid: "var(--color-info)",
  processing: "var(--color-gold)",
  shipped: "var(--color-gold-light)",
  delivered: "var(--color-success)",
  cancelled: "var(--color-error)",
};

function StatusPill({ status }: { status: OrderStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: "var(--radius-full)",
        fontSize: 12,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        border: `1px solid ${c}`,
        color: c,
      }}
    >
      {status}
    </span>
  );
}

const cardStyle = (isMobile: boolean): React.CSSProperties => ({
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  padding: isMobile ? 18 : 24,
});

const muted: React.CSSProperties = { color: "var(--color-text-muted)" };

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "var(--radius-sm)",
  border: "1px solid var(--color-border)",
  fontSize: 14,
  background: "var(--color-surface-2)",
  color: "var(--color-text)",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "var(--color-text-dim)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 6,
};

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
  const [resending, setResending] = useState(false);
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

  const handleResend = async () => {
    if (!orderId) return;
    setResending(true);
    setMessage(null);
    try {
      const sentTo = await resendShipmentEmail(orderId, {
        carrier: carrier || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
      });
      // Reflect any persisted carrier/tracking back into the loaded order so the
      // "Open current tracking" link updates without a manual Save/reload.
      const refreshed = await getOrderById(orderId);
      if (refreshed) {
        setOrder(refreshed);
        seedForm(refreshed);
      }
      setMessage({ kind: "ok", text: `Shipment email re-sent to ${sentTo}.` });
    } catch (err) {
      setMessage({
        kind: "err",
        text: err instanceof Error ? err.message : "Failed to resend shipment email",
      });
    } finally {
      setResending(false);
    }
  };

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ ...muted, fontSize: 14 }}>Loading order…</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", ...cardStyle(false) }}>
          <h1 style={{ marginTop: 0 }}>Order not found</h1>
          <p style={muted}>This order could not be found.</p>
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
                color: "var(--color-text-dim)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Order Detail
            </p>
            <h1 style={{ margin: "10px 0 0", fontSize: isMobile ? 34 : 44, fontWeight: 900, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              Order #{order.orderId.slice(0, 8)}
              <StatusPill status={order.status} />
            </h1>
          </div>

          <Link href="/orders">
            <span style={{ display: "inline-block" }}>
              <ActionButton variant="secondary">Back to Orders</ActionButton>
            </span>
          </Link>
        </div>

        <section style={cardStyle(isMobile)}>
          <div
            style={{
              display: "grid",
              gap: 24,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <div>
              <h2 style={{ marginTop: 0 }}>Customer</h2>
              <div style={{ display: "grid", gap: 6, ...muted }}>
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
              <div style={{ display: "grid", gap: 6, ...muted }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  Status: <StatusPill status={order.status} />
                </div>
                <div>Placed: {new Date(order.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(order.updatedAt).toLocaleString()}</div>
                {order.shippedAt ? (
                  <div>Shipped: {new Date(order.shippedAt).toLocaleString()}</div>
                ) : null}
                <div>Subtotal: ${order.pricing.subtotal.toFixed(2)}</div>
                <div>Shipping: ${order.pricing.shipping.toFixed(2)}</div>
                <div>Tax: ${(order.pricing.tax ?? 0).toFixed(2)}</div>
                <div style={{ fontWeight: 700, color: "var(--color-text)" }}>
                  Total: ${order.pricing.total.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={cardStyle(isMobile)}>
          <h2 style={{ marginTop: 0 }}>Fulfillment</h2>
          <p style={{ ...muted, marginTop: 0, fontSize: 14 }}>
            Set the order status and shipment tracking. Moving the status to{" "}
            <strong style={{ color: "var(--color-gold-light)" }}>shipped</strong>{" "}
            emails the customer their tracking details.
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
            <span style={{ display: "inline-block" }} onClick={resending ? undefined : handleResend}>
              <ActionButton variant="secondary" disabled={resending}>
                {resending ? "Sending…" : "Resend shipment email"}
              </ActionButton>
            </span>
            {order.trackingUrl ? (
              <a href={order.trackingUrl} target="_blank" rel="noreferrer" style={{ color: "var(--color-gold)", fontSize: 14, fontWeight: 700 }}>
                Open current tracking ↗
              </a>
            ) : null}
            {message ? (
              <span style={{ fontSize: 14, color: message.kind === "ok" ? "var(--color-success)" : "var(--color-error)" }}>
                {message.text}
              </span>
            ) : null}
          </div>
        </section>

        <section style={cardStyle(isMobile)}>
          <h2 style={{ marginTop: 0 }}>
            {order.items.length === 1 ? "Build" : "Builds"}
          </h2>
          <div style={{ display: "grid", gap: 24 }}>
            {order.items.map((item) => (
              <div
                key={item.cartItemId}
                style={{
                  display: "grid",
                  gap: 18,
                  gridTemplateColumns: isMobile ? "1fr" : "minmax(220px, 300px) 1fr",
                  alignItems: "start",
                }}
              >
                <OrderItemPreview item={item} />

                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                    <strong>{item.productName}</strong>
                    <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                  </div>
                  {item.quantity > 1 ? (
                    <div style={{ ...muted, fontSize: 14 }}>
                      Quantity: {item.quantity} × ${item.price.toFixed(2)}
                    </div>
                  ) : null}

                  <BuildSummary
                    items={getBuildSummary(broncoConfig, {
                      productId: item.productId,
                      selectedOptions: item.selectedOptions,
                      customFields: item.customFields,
                    })}
                    nameplateText={item.customFields?.nameplateText}
                    price={item.price}
                  />

                  <div style={{ ...muted, fontSize: 13 }}>
                    Product ID: {item.productId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
