"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import broncoConfig from "@/data/bronco-config.json";
import { getCart, saveCart, clearCart } from "@/lib/cart";
import { CartItem } from "@/types/cart";
import { getGroupName, getOptionName } from "@/lib/product-display";
import { getSelectedLayers } from "@/lib/layers";
import { ActionButton } from "@/components/ActionButton";
import { Toast } from "@/components/Toast";
import BuilderPreview from "@/components/BuilderPreview";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setItems(getCart());

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const subtotal = useMemo(() => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [items]);

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
    saveCart(next);
    flashMessage("Cart updated.");
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
          <h1 style={{ margin: 0, fontSize: isMobile ? 36 : 48, fontWeight: 900 }}>
            Cart
          </h1>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/build/bronco-buck-classic">
              <span style={{ display: "inline-block" }}>
                <ActionButton variant="secondary">Back to Builder</ActionButton>
              </span>
            </Link>

            <ActionButton onClick={handleClearCart} variant="secondary">
              Clear Cart
            </ActionButton>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Toast message={message} type="success" />
        </div>

        {items.length === 0 ? (
          <div
            style={{
              marginTop: 24,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <p style={{ margin: 0, fontSize: 18 }}>Your cart is empty.</p>
          </div>
        ) : (
          <>
            <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
              {items.map((item) => {
                const layers = getSelectedLayers(broncoConfig, {
                  productId: item.productId,
                  selectedOptions: item.selectedOptions,
                  customFields: item.customFields,
                });

                return (
                  <section
                    key={item.cartItemId}
                    style={{
                      background: "#fff",
                      border: "1px solid #ddd",
                      borderRadius: 16,
                      padding: isMobile ? 16 : 22,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gap: 18,
                        gridTemplateColumns: isMobile ? "1fr" : "minmax(260px, 340px) 1fr",
                        alignItems: "start",
                      }}
                    >
                      <div>
                        <BuilderPreview
                          layers={layers}
                          view="front"
                          nameplateText={item.customFields?.nameplateText}
                        />
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 16,
                            flexWrap: "wrap",
                          }}
                        >
                          <div>
                            <h2 style={{ margin: 0, fontSize: isMobile ? 22 : 24 }}>
                              {item.productName}
                            </h2>
                            <p style={{ marginTop: 8, color: "#666" }}>
                              Added {new Date(item.addedAt).toLocaleString()}
                            </p>
                          </div>

                          <div style={{ fontSize: isMobile ? 22 : 24, fontWeight: 900 }}>
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
                          {Object.entries(item.selectedOptions).map(([groupId, value]) => {
                            if (Array.isArray(value)) {
                              if (!value.length) return null;

                              return (
                                <div
                                  key={groupId}
                                  style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                                >
                                  <strong>{getGroupName(groupId)}:</strong>
                                  <span>
                                    {value.map((v) => getOptionName(v, groupId)).join(", ")}
                                  </span>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={groupId}
                                style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
                              >
                                <strong>{getGroupName(groupId)}:</strong>
                                <span>{getOptionName(value, groupId)}</span>
                              </div>
                            );
                          })}

                          {item.customFields.nameplateText ? (
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                              <strong>Nameplate Text:</strong>
                              <span>{item.customFields.nameplateText}</span>
                            </div>
                          ) : null}
                        </div>

                        <div
                          style={{
                            marginTop: 16,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 16,
                            flexWrap: "wrap",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <label htmlFor={item.cartItemId}>Qty</label>
                            <input
                              id={item.cartItemId}
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) =>
                                updateQuantity(item.cartItemId, Number(e.target.value) || 1)
                              }
                              style={{
                                width: 70,
                                padding: "8px 10px",
                                borderRadius: 8,
                                border: "1px solid #ccc",
                              }}
                            />
                          </div>

                          <ActionButton
                            onClick={() => removeItem(item.cartItemId)}
                            variant="secondary"
                          >
                            Remove
                          </ActionButton>
                        </div>
                      </div>
                    </div>
                  </section>
                );
              })}
            </div>

            <section
              style={{
                marginTop: 24,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 16,
                padding: 24,
              }}
            >
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
                  <p style={{ margin: 0, color: "#666" }}>Subtotal</p>
                  <div style={{ fontSize: 36, fontWeight: 900 }}>
                    ${subtotal.toFixed(2)}
                  </div>
                </div>

                <Link href="/checkout">
                  <span style={{ display: "inline-block" }}>
                    <ActionButton variant="primary">Checkout</ActionButton>
                  </span>
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}