"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getOrderById,
  updateOrderFulfillment,
  resendShipmentEmail,
  updateOrderCustomer,
} from "@/lib/orders";
import {
  Order,
  OrderStatus,
  Carrier,
  OrderCustomer,
  OrderEvent,
  OrderEmailKind,
  OrderEmailResult,
} from "@/types/order";
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

const CUSTOMER_FIELDS: { key: keyof OrderCustomer; label: string; required?: boolean; wide?: boolean }[] = [
  { key: "firstName", label: "First name", required: true },
  { key: "lastName", label: "Last name", required: true },
  { key: "email", label: "Email", required: true },
  { key: "phone", label: "Phone" },
  { key: "address1", label: "Address line 1", required: true, wide: true },
  { key: "address2", label: "Address line 2", wide: true },
  { key: "city", label: "City", required: true },
  { key: "state", label: "State", required: true },
  { key: "zip", label: "ZIP", required: true },
  { key: "country", label: "Country" },
];

const FIELD_LABEL: Record<string, string> = Object.fromEntries(
  CUSTOMER_FIELDS.map((f) => [f.key, f.label])
);

type CustomerForm = Record<keyof OrderCustomer, string>;

function toCustomerForm(c: OrderCustomer): CustomerForm {
  return Object.fromEntries(
    CUSTOMER_FIELDS.map((f) => [f.key, (c[f.key] as string | undefined) ?? ""])
  ) as CustomerForm;
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function emailKindForStatus(status: OrderStatus): OrderEmailKind {
  return status === "shipped" || status === "delivered" ? "shipment" : "confirmation";
}

const EMAIL_NAME: Record<OrderEmailKind, string> = {
  confirmation: "Order confirmation",
  shipment: "Shipment email",
};

function trackingText(carrier?: Carrier, trackingNumber?: string): string | null {
  if (!carrier && !trackingNumber) return null;
  return [carrier ? CARRIER_LABELS[carrier] : null, trackingNumber].filter(Boolean).join(" ");
}

function EmailOutcome({ email, resent }: { email: OrderEmailResult; resent?: boolean }) {
  const verb = resent ? "re-sent" : "sent";
  return email.sent ? (
    <div style={{ fontSize: 13, color: "var(--color-success)" }}>
      {EMAIL_NAME[email.kind]} {verb} to {email.to}
    </div>
  ) : (
    <div style={{ fontSize: 13, color: "var(--color-error)" }}>
      {EMAIL_NAME[email.kind]} to {email.to || "(no email)"} failed: {email.error}
    </div>
  );
}

function HistoryEntry({
  event,
  currentStatus,
  busy,
  onResend,
}: {
  event: OrderEvent;
  currentStatus: OrderStatus;
  busy: boolean;
  onResend: (event: OrderEvent) => void;
}) {
  let title: React.ReactNode;
  let details: React.ReactNode = null;
  let resendKind: OrderEmailKind | null = null;

  if (event.type === "fulfillment_saved") {
    title =
      event.previousStatus === event.status ? (
        <>Fulfillment saved <StatusPill status={event.status} /></>
      ) : (
        <>
          Fulfillment saved <StatusPill status={event.previousStatus} />
          <span style={{ color: "var(--color-text-dim)" }}>to</span>
          <StatusPill status={event.status} />
        </>
      );
    const t = trackingText(event.carrier, event.trackingNumber);
    details = (
      <>
        {t ? <div style={{ ...muted, fontSize: 13 }}>Tracking: {t}</div> : null}
        {event.email ? <EmailOutcome email={event.email} /> : null}
      </>
    );
    resendKind = emailKindForStatus(event.status);
  } else if (event.type === "email_resent") {
    title = <>{EMAIL_NAME[event.email.kind]} re-sent</>;
    const t = trackingText(event.carrier, event.trackingNumber);
    details = (
      <>
        {t ? <div style={{ ...muted, fontSize: 13 }}>Tracking: {t}</div> : null}
        <EmailOutcome email={event.email} resent />
      </>
    );
  } else {
    title = <>Customer info changed</>;
    details = (
      <div style={{ display: "grid", gap: 2, fontSize: 13 }}>
        {event.changes.map((c) => (
          <div key={c.field} style={muted}>
            {FIELD_LABEL[c.field] ?? c.field}:{" "}
            <span style={{ textDecoration: "line-through" }}>{c.from || "(blank)"}</span>{" "}
            <span style={{ color: "var(--color-text)" }}>{c.to || "(blank)"}</span>
          </div>
        ))}
      </div>
    );
    resendKind = emailKindForStatus(currentStatus);
  }

  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: 12,
        alignItems: "start",
        padding: "14px 0",
        borderTop: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
        <time dateTime={event.at} style={{ fontSize: 12, color: "var(--color-text-dim)" }}>
          {formatWhen(event.at)}
        </time>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontWeight: 700 }}>
          {title}
        </div>
        {details}
      </div>
      {resendKind ? (
        <span style={{ display: "inline-block" }} onClick={busy ? undefined : () => onResend(event)}>
          <ActionButton variant="secondary" disabled={busy}>
            {busy
              ? "Sending…"
              : resendKind === "shipment"
                ? "Resend shipment email"
                : "Resend confirmation"}
          </ActionButton>
        </span>
      ) : null}
    </li>
  );
}

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

  // Customer edit state
  const [editingCustomer, setEditingCustomer] = useState(false);
  const [customerForm, setCustomerForm] = useState<CustomerForm | null>(null);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [customerMessage, setCustomerMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // History row resend state
  const [resendingEventId, setResendingEventId] = useState<string | null>(null);
  const [historyMessage, setHistoryMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

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
      const updated = await updateOrderFulfillment(orderId, {
        status,
        carrier: carrier || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
      });
      setOrder(updated);
      seedForm(updated);
      const last = updated.history?.[updated.history.length - 1];
      const email = last?.type === "fulfillment_saved" ? last.email : undefined;
      setMessage(
        email && !email.sent
          ? { kind: "err", text: `Saved, but the shipment email failed: ${email.error}` }
          : {
              kind: "ok",
              text: email ? `Saved. Shipment email sent to ${email.to}.` : "Order updated.",
            }
      );
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
      const { sentTo, order: refreshed } = await resendShipmentEmail(orderId, {
        carrier: carrier || undefined,
        trackingNumber: trackingNumber.trim() || undefined,
      });
      // Reflect any persisted carrier/tracking (and the new history entry) back
      // into the loaded order without a manual Save/reload.
      if (refreshed) {
        setOrder(refreshed);
        seedForm(refreshed);
      }
      setMessage({ kind: "ok", text: `Shipment email re-sent to ${sentTo}.` });
    } catch (err) {
      const failedOrder = (err as { order?: Order }).order;
      if (failedOrder) setOrder(failedOrder);
      setMessage({
        kind: "err",
        text: err instanceof Error ? err.message : "Failed to resend shipment email",
      });
    } finally {
      setResending(false);
    }
  };

  const handleHistoryResend = async (event: OrderEvent) => {
    if (!orderId) return;
    setResendingEventId(event.id);
    setHistoryMessage(null);
    try {
      const { sentTo, kind, order: refreshed } = await resendShipmentEmail(orderId, {
        eventId: event.id,
      });
      if (refreshed) setOrder(refreshed);
      setHistoryMessage({ kind: "ok", text: `${EMAIL_NAME[kind]} re-sent to ${sentTo}.` });
    } catch (err) {
      const failedOrder = (err as { order?: Order }).order;
      if (failedOrder) setOrder(failedOrder);
      setHistoryMessage({
        kind: "err",
        text: err instanceof Error ? err.message : "Failed to resend email",
      });
    } finally {
      setResendingEventId(null);
    }
  };

  const startCustomerEdit = () => {
    if (!order) return;
    setCustomerForm(toCustomerForm(order.customer));
    setCustomerMessage(null);
    setEditingCustomer(true);
  };

  const handleCustomerSave = async () => {
    if (!orderId || !customerForm) return;
    setSavingCustomer(true);
    setCustomerMessage(null);
    try {
      const updated = await updateOrderCustomer(orderId, customerForm);
      setOrder(updated);
      setEditingCustomer(false);
      const last = updated.history?.[updated.history.length - 1];
      const n = last?.type === "customer_updated" ? last.changes.length : 0;
      setCustomerMessage({
        kind: "ok",
        text: `Saved ${n} change${n === 1 ? "" : "s"}. Logged in the order history below.`,
      });
    } catch (err) {
      setCustomerMessage({
        kind: "err",
        text: err instanceof Error ? err.message : "Failed to update customer",
      });
    } finally {
      setSavingCustomer(false);
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                <h2 style={{ margin: 0 }}>Customer</h2>
                {!editingCustomer ? (
                  <span style={{ display: "inline-block" }} onClick={startCustomerEdit}>
                    <ActionButton variant="secondary">Edit customer</ActionButton>
                  </span>
                ) : null}
              </div>

              {editingCustomer && customerForm ? (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      gridTemplateColumns: "1fr 1fr",
                    }}
                  >
                    {CUSTOMER_FIELDS.map((f) => (
                      <div key={f.key} style={{ gridColumn: f.wide || isMobile ? "1 / -1" : undefined }}>
                        <label style={labelStyle} htmlFor={`cust-${f.key}`}>
                          {f.label}{f.required ? " *" : ""}
                        </label>
                        <input
                          id={`cust-${f.key}`}
                          type={f.key === "email" ? "email" : f.key === "phone" ? "tel" : "text"}
                          value={customerForm[f.key]}
                          onChange={(e) =>
                            setCustomerForm({ ...customerForm, [f.key]: e.target.value })
                          }
                          style={inputStyle}
                        />
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ display: "inline-block" }} onClick={savingCustomer ? undefined : handleCustomerSave}>
                      <ActionButton variant="primary" disabled={savingCustomer}>
                        {savingCustomer ? "Saving…" : "Save customer"}
                      </ActionButton>
                    </span>
                    <span
                      style={{ display: "inline-block" }}
                      onClick={savingCustomer ? undefined : () => { setEditingCustomer(false); setCustomerMessage(null); }}
                    >
                      <ActionButton variant="secondary" disabled={savingCustomer}>Cancel</ActionButton>
                    </span>
                  </div>
                  <p style={{ ...muted, fontSize: 13, margin: "10px 0 0" }}>
                    Changes are logged in the order history. No email is sent; use Resend email in the history if the customer should get one.
                  </p>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 6, marginTop: 12, ...muted }}>
                  <div>{order.customer.firstName} {order.customer.lastName}</div>
                  <div>{order.customer.email}</div>
                  {order.customer.phone ? <div>{order.customer.phone}</div> : null}
                  <div>{order.customer.address1}</div>
                  {order.customer.address2 ? <div>{order.customer.address2}</div> : null}
                  <div>{order.customer.city}, {order.customer.state} {order.customer.zip}</div>
                  {order.customer.country ? <div>{order.customer.country}</div> : null}
                </div>
              )}
              {customerMessage ? (
                <p
                  style={{
                    fontSize: 14,
                    margin: "12px 0 0",
                    color: customerMessage.kind === "ok" ? "var(--color-success)" : "var(--color-error)",
                  }}
                >
                  {customerMessage.text}
                </p>
              ) : null}
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
                {order.pricing.discount && order.pricing.discount > 0 ? (
                  <div>
                    Discount{order.pricing.discountCode ? ` (${order.pricing.discountCode})` : ""}: −${order.pricing.discount.toFixed(2)}
                  </div>
                ) : null}
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

          <div style={{ marginTop: 28 }}>
            <h3 style={{ margin: "0 0 4px", fontSize: 18 }}>History</h3>
            <p style={{ ...muted, marginTop: 0, fontSize: 14 }}>
              Every fulfillment save, email sent from this page, and customer edit, newest first.
            </p>
            {historyMessage ? (
              <p
                style={{
                  fontSize: 14,
                  margin: "0 0 8px",
                  color: historyMessage.kind === "ok" ? "var(--color-success)" : "var(--color-error)",
                }}
              >
                {historyMessage.text}
              </p>
            ) : null}
            {order.history && order.history.length > 0 ? (
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {[...order.history].reverse().map((event) => (
                  <HistoryEntry
                    key={event.id}
                    event={event}
                    currentStatus={order.status}
                    busy={resendingEventId === event.id}
                    onResend={handleHistoryResend}
                  />
                ))}
              </ol>
            ) : (
              <p style={{ ...muted, fontSize: 14, margin: 0 }}>
                Nothing logged yet. Saving fulfillment or editing the customer adds an entry here.
              </p>
            )}
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
