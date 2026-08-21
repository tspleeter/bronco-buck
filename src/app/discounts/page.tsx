"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/ActionButton";
import { Toast } from "@/components/Toast";
import {
  listDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "@/lib/discounts";
import { Discount, DiscountType } from "@/types/discount";

const emptyForm = {
  code: "",
  type: "percent" as DiscountType,
  value: "",
  minSubtotal: "",
  maxRedemptions: "",
  expiresAt: "",
  description: "",
};

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "success",
  );
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [busyCode, setBusyCode] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const flash = (text: string, type: "success" | "error" | "info" = "success") => {
    setMessage(text);
    setMessageType(type);
    if (type !== "error") window.setTimeout(() => setMessage(""), 2800);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await listDiscounts();
      setDiscounts(data);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to load discounts", "error");
      setDiscounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    refresh();
    return () => window.removeEventListener("resize", checkMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeCount = useMemo(
    () => discounts.filter((d) => d.active).length,
    [discounts],
  );

  const set = (field: keyof typeof emptyForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCreate = async () => {
    const code = form.code.trim().toUpperCase();
    const value = Number(form.value);
    if (!code) return flash("Enter a code.", "error");
    if (!Number.isFinite(value) || value <= 0)
      return flash("Enter a value greater than 0.", "error");
    if (form.type === "percent" && value > 100)
      return flash("Percent can't exceed 100.", "error");

    setCreating(true);
    try {
      await createDiscount({
        code,
        type: form.type,
        value,
        active: true,
        minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : null,
        maxRedemptions: form.maxRedemptions ? Number(form.maxRedemptions) : null,
        expiresAt: form.expiresAt || null,
        description: form.description.trim() || undefined,
      });
      setForm(emptyForm);
      flash(`Created ${code}.`);
      await refresh();
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to create", "error");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (d: Discount) => {
    setBusyCode(d.code);
    try {
      const updated = await updateDiscount(d.code, { active: !d.active });
      setDiscounts((prev) =>
        prev.map((x) => (x.code === d.code ? updated : x)),
      );
      flash(`${d.code} ${updated.active ? "activated" : "deactivated"}.`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to update", "error");
    } finally {
      setBusyCode("");
    }
  };

  const handleDelete = async (d: Discount) => {
    if (!window.confirm(`Delete code ${d.code}? This can't be undone.`)) return;
    setBusyCode(d.code);
    try {
      await deleteDiscount(d.code);
      setDiscounts((prev) => prev.filter((x) => x.code !== d.code));
      flash(`Deleted ${d.code}.`);
    } catch (err) {
      flash(err instanceof Error ? err.message : "Failed to delete", "error");
    } finally {
      setBusyCode("");
    }
  };

  const valueLabel = (d: Discount) =>
    d.type === "percent" ? `${d.value}% off` : `$${d.value.toFixed(2)} off`;

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
            <h1 style={{ margin: 0, fontSize: isMobile ? 36 : 48, fontWeight: 900 }}>
              Discounts
            </h1>
            {!loading && (
              <p style={{ marginTop: 8, color: "var(--color-text-muted)" }}>
                {discounts.length} code{discounts.length === 1 ? "" : "s"} ·{" "}
                {activeCount} active
              </p>
            )}
          </div>

          <Link href="/orders">
            <span style={{ display: "inline-block" }}>
              <ActionButton variant="secondary">Back to Orders</ActionButton>
            </span>
          </Link>
        </div>

        <div style={{ marginTop: 16 }}>
          <Toast message={message} type={messageType} />
        </div>

        {/* Create */}
        <section style={cardStyle(isMobile)}>
          <h2 style={{ marginTop: 0, fontSize: 22 }}>New code</h2>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            }}
          >
            <div>
              <label style={labelStyle}>Code</label>
              <input
                value={form.code}
                onChange={set("code")}
                placeholder="DUCK10"
                style={{ ...inputStyle, textTransform: "uppercase" }}
              />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={set("type")} style={inputStyle}>
                <option value="percent">Percent off (%)</option>
                <option value="fixed">Fixed amount off ($)</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                {form.type === "percent" ? "Percent (1–100)" : "Amount ($)"}
              </label>
              <input
                value={form.value}
                onChange={set("value")}
                type="number"
                min="0"
                step={form.type === "percent" ? "1" : "0.01"}
                placeholder={form.type === "percent" ? "10" : "5.00"}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Min subtotal ($, optional)</label>
              <input
                value={form.minSubtotal}
                onChange={set("minSubtotal")}
                type="number"
                min="0"
                step="0.01"
                placeholder="No minimum"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Max redemptions (optional)</label>
              <input
                value={form.maxRedemptions}
                onChange={set("maxRedemptions")}
                type="number"
                min="1"
                step="1"
                placeholder="Unlimited"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Expires (optional)</label>
              <input
                value={form.expiresAt}
                onChange={set("expiresAt")}
                type="date"
                style={inputStyle}
              />
            </div>
            <div style={{ gridColumn: isMobile ? "auto" : "1 / -1" }}>
              <label style={labelStyle}>Note (internal, optional)</label>
              <input
                value={form.description}
                onChange={set("description")}
                placeholder="e.g. Launch promo"
                style={inputStyle}
              />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <ActionButton
              variant="primary"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? "Creating…" : "Create code"}
            </ActionButton>
          </div>
        </section>

        {/* List */}
        {loading ? (
          <section style={cardStyle(isMobile)}>
            <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
              Loading discounts…
            </p>
          </section>
        ) : discounts.length === 0 ? (
          <section style={cardStyle(isMobile)}>
            <p style={{ margin: 0, fontSize: 18 }}>No discount codes yet.</p>
          </section>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
            {discounts.map((d) => (
              <section
                key={d.code}
                style={{
                  ...cardStyle(isMobile),
                  marginTop: 0,
                  opacity: d.active ? 1 : 0.6,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: "0.02em" }}>
                        {d.code}
                      </span>
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 999,
                          background: d.active
                            ? "var(--color-gold-dim)"
                            : "var(--color-surface-2)",
                          color: d.active
                            ? "var(--color-gold-light)"
                            : "var(--color-text-muted)",
                        }}
                      >
                        {d.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        gap: 16,
                        flexWrap: "wrap",
                        color: "var(--color-text-muted)",
                        fontSize: 14,
                      }}
                    >
                      <span style={{ color: "var(--color-gold-light)", fontWeight: 700 }}>
                        {valueLabel(d)}
                      </span>
                      <span>
                        Used {d.timesUsed}
                        {d.maxRedemptions != null ? ` / ${d.maxRedemptions}` : ""}
                      </span>
                      <span>
                        Min:{" "}
                        {d.minSubtotal != null ? `$${d.minSubtotal.toFixed(2)}` : "—"}
                      </span>
                      <span>
                        Expires:{" "}
                        {d.expiresAt
                          ? new Date(d.expiresAt).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                    {d.description ? (
                      <div
                        style={{
                          marginTop: 6,
                          color: "var(--color-text-muted)",
                          fontSize: 13,
                          fontStyle: "italic",
                        }}
                      >
                        {d.description}
                      </div>
                    ) : null}
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <ActionButton
                      variant="secondary"
                      onClick={() => handleToggle(d)}
                      disabled={busyCode === d.code}
                    >
                      {d.active ? "Deactivate" : "Activate"}
                    </ActionButton>
                    <ActionButton
                      variant="ghost"
                      onClick={() => handleDelete(d)}
                      disabled={busyCode === d.code}
                    >
                      Delete
                    </ActionButton>
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function cardStyle(isMobile: boolean): React.CSSProperties {
  return {
    marginTop: 20,
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: 16,
    padding: isMobile ? 16 : 22,
  };
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontWeight: 600,
  marginBottom: 6,
  fontSize: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 16,
  background: "var(--color-surface-2)",
  color: "var(--color-text)",
};
