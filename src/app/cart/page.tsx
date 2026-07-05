"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";
const broncoConfig = broncoConfigJson as ProductConfig;
import { getCart, saveCart, clearCart } from "@/lib/cart";
import { CartItem } from "@/types/cart";
import { getGroupName, getOptionName } from "@/lib/product-display";
import { getSelectedLayers } from "@/lib/layers";
import { getManeContext } from "@/lib/mane";
import { ActionButton } from "@/components/ActionButton";
import { Toast } from "@/components/Toast";
import BuilderPreview from "@/components/BuilderPreview";

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setItems(getCart());
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );

  const flashMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  };

  const updateQuantity = (cartItemId: string, quantity: number) => {
    const next = items.map((item) =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item,
    );
    setItems(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveCart(next);
      flashMessage("Cart updated.");
    }, 400);
  };

  const removeItem = (cartItemId: string) => {
    const next = items.filter((item) => item.cartItemId !== cartItemId);
    setItems(next);
    saveCart(next);
    flashMessage("Item removed from cart.");
  };

  const handleClearCart = () => {
    clearCart();
    setItems([]);
    flashMessage("Cart cleared.");
  };

  return (
    <main className="page">
      <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gap: "28px" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
              <div className="gold-line" />
              <span className="label" style={{ color: "var(--color-gold)" }}>Your Order</span>
            </div>
            <h1
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 900,
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              Cart
              {items.length > 0 && (
                <span style={{ marginLeft: "12px", fontSize: "1rem", fontWeight: 600, color: "var(--color-text-muted)", verticalAlign: "middle" }}>
                  {items.length} item{items.length === 1 ? "" : "s"}
                </span>
              )}
            </h1>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <Link href="/build/bronco-buck-classic">
              <ActionButton variant="secondary">
                <ArrowLeftIcon />
                Back to Builder
              </ActionButton>
            </Link>
            {items.length > 0 && (
              <ActionButton onClick={handleClearCart} variant="ghost">
                <TrashIcon />
                Clear Cart
              </ActionButton>
            )}
          </div>
        </div>

        {/* Toast */}
        {message && (
          <Toast message={message} type="success" />
        )}

        {/* ── Empty State ── */}
        {items.length === 0 ? (
          <div
            className="surface"
            style={{ padding: "60px 40px", textAlign: "center", display: "grid", gap: "20px", justifyItems: "center" }}
          >
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-dim)" }} aria-hidden="true">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>Your cart is empty</h2>
              <p className="text-muted text-sm">Configure and add a Bronco Buck to get started.</p>
            </div>
            <Link href="/build/bronco-buck-classic">
              <ActionButton variant="primary">Start Building</ActionButton>
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gap: "24px",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 360px",
              alignItems: "start",
            }}
          >
            {/* Cart Items */}
            <div style={{ display: "grid", gap: "16px" }}>
              {items.map((item) => {
                const layers = getSelectedLayers(broncoConfig, {
                  productId: item.productId,
                  selectedOptions: item.selectedOptions,
                  customFields: item.customFields,
                });

                return (
                  <article
                    key={item.cartItemId}
                    className="surface"
                    style={{ padding: isMobile ? "18px" : "24px" }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gap: "20px",
                        gridTemplateColumns: isMobile ? "1fr" : "minmax(220px, 300px) 1fr",
                        alignItems: "start",
                      }}
                    >
                      {/* Preview */}
                      <div className="preview-bg" style={{ padding: "16px" }}>
                        <BuilderPreview
                          layers={layers}
                          view="front"
                          nameplateText={item.customFields?.nameplateText}
                          mane={getManeContext(item.selectedOptions)}
                        />
                      </div>

                      {/* Details */}
                      <div style={{ display: "grid", gap: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
                          <div>
                            <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 800, marginBottom: "4px" }}>
                              {item.productName}
                            </h2>
                            <p className="text-dim text-sm">
                              Added {new Date(item.addedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div className="price-display" style={{ fontSize: "1.375rem", color: "var(--color-gold-light)" }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        {/* Options */}
                        <div style={{ display: "grid", gap: "6px" }}>
                          {Object.entries(item.selectedOptions).map(([groupId, value]) => {
                            if (Array.isArray(value)) {
                              if (!value.length) return null;
                              return (
                                <div key={groupId} style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "0.85rem" }}>
                                  <span style={{ color: "var(--color-text-dim)", fontWeight: 500 }}>{getGroupName(groupId)}:</span>
                                  <span style={{ color: "var(--color-text-muted)" }}>{value.map((v) => getOptionName(v, groupId)).join(", ")}</span>
                                </div>
                              );
                            }
                            return (
                              <div key={groupId} style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--color-text-dim)", fontWeight: 500 }}>{getGroupName(groupId)}:</span>
                                <span style={{ color: "var(--color-text-muted)" }}>{getOptionName(value, groupId)}</span>
                              </div>
                            );
                          })}

                          {item.customFields.nameplateText && (
                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", fontSize: "0.85rem" }}>
                              <span style={{ color: "var(--color-text-dim)", fontWeight: 500 }}>Nameplate Text:</span>
                              <span style={{ color: "var(--color-text-muted)" }}>{item.customFields.nameplateText}</span>
                            </div>
                          )}
                        </div>

                        {/* Qty + Remove */}
                        <div
                          className="divider"
                          style={{ paddingTop: "12px", marginTop: "4px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", flexWrap: "wrap", borderTop: "1px solid var(--color-border)", border: "none", borderTopWidth: "1px" }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "12px", borderTop: "1px solid var(--color-border)", width: "100%" }}>
                            <label
                              htmlFor={item.cartItemId}
                              style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)" }}
                            >
                              Qty
                            </label>
                            <input
                              id={item.cartItemId}
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.cartItemId, Number(e.target.value) || 1)
                              }
                              className="qty-input"
                              aria-label={`Quantity for ${item.productName}`}
                            />
                            <div style={{ flex: 1 }} />
                            <ActionButton
                              onClick={() => removeItem(item.cartItemId)}
                              variant="ghost"
                              size="sm"
                            >
                              <TrashIcon />
                              Remove
                            </ActionButton>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* ── Order Summary ── */}
            <div style={{ position: isMobile ? "static" : "sticky", top: "88px" }}>
              <section className="surface" style={{ padding: "24px", display: "grid", gap: "20px" }}>
                <div className="section-header">
                  <span className="eyebrow">Order Summary</span>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Review & Checkout</h2>
                </div>

                <div className="divider" />

                <div style={{ display: "grid", gap: "0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Subtotal ({items.length} item{items.length === 1 ? "" : "s"})</span>
                    <span style={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "0.9rem" }}>
                    <span style={{ color: "var(--color-text-muted)" }}>Shipping</span>
                    <span style={{ color: "var(--color-text-dim)", fontStyle: "italic" }}>Calculated at checkout</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontSize: "0.9rem", borderBottom: "1px solid var(--color-border)" }}>
                    <span style={{ color: "var(--color-text-muted)", display:"flex", alignItems:"center" }}><svg width="22" height="18" viewBox="0 0 200 165" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{display:"inline",verticalAlign:"middle",marginRight:6}}>
  <path d="M18 138 C8 110,12 80,32 62 C48 48,72 38,96 38 C122 38,150 48,164 68 C178 90,176 125,164 142 C144 165,52 168,18 138Z" fill="#F5C800"/>
  <path d="M18 138 C8 110,12 80,32 62 C24 85,24 120,40 148 C28 152,22 146,18 138Z" fill="#D4A800" opacity="0.5"/>
  <path d="M20 118 C2 106,-4 88,6 74 C12 66,22 70,18 80 C14 90,18 102,28 108" fill="#F5C800" stroke="#D4A800" stroke-width="1"/>
  <ellipse cx="118" cy="44" rx="18" ry="20" fill="#F5C800"/>
  <circle cx="126" cy="26" r="26" fill="#F5C800"/>
  <path d="M146 22 Q178 14 176 26 Q178 34 146 32Z" fill="#E86000"/>
  <path d="M146 32 Q178 34 174 44 Q170 50 146 40Z" fill="#C84800"/>
  <circle cx="140" cy="18" r="6" fill="#111"/>
  <circle cx="142" cy="15" r="2" fill="white"/>
  <path d="M58 100 Q82 86,124 96 Q138 102,134 114 Q124 126,96 126 Q60 123,58 100Z" fill="#D4A800" opacity="0.4"/>
</svg>Free rubber duck</span>
                    <span style={{ color: "var(--color-gold)", fontWeight: 600 }}>FREE</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0 4px", alignItems: "baseline" }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <div className="price-display" style={{ fontSize: "1.75rem", color: "var(--color-gold-light)" }}>
                      ${subtotal.toFixed(2)}
                    </div>
                  </div>
                </div>

                <Link href="/checkout" style={{ display: "block" }}>
                  <ActionButton variant="primary" size="lg" fullWidth>
                    Proceed to Checkout →
                  </ActionButton>
                </Link>

                <Link href="/build/bronco-buck-classic" style={{ display: "block" }}>
                  <ActionButton variant="ghost" size="sm" fullWidth>
                    Continue Shopping
                  </ActionButton>
                </Link>
              </section>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
