"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getOrders, removeOrder, clearOrders } from "@/lib/orders";
import { Order } from "@/types/order";
import { ActionButton } from "@/components/ActionButton";
import { Toast } from "@/components/Toast";
import { OrderPreviewCard } from "@/components/OrderPreviewCard";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const refreshOrders = () => {
    setOrders(getOrders());
  };

  useEffect(() => {
    refreshOrders();

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);
    window.addEventListener("orders-updated", refreshOrders);

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orders-updated", refreshOrders);
    };
  }, []);

  const orderCount = useMemo(() => orders.length, [orders]);

  const flashMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  };

  const handleRemoveOrder = (orderId: string) => {
    removeOrder(orderId);
    refreshOrders();
    flashMessage("Order removed.");
  };

  const handleClearOrders = () => {
    clearOrders();
    setOrders([]);
    flashMessage("Orders cleared.");
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
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 36 : 48, fontWeight: 900 }}>
              Orders
            </h1>
            <p style={{ marginTop: 8, color: "#666" }}>
              {orderCount} order{orderCount === 1 ? "" : "s"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/build/bronco-buck-classic">
              <span style={{ display: "inline-block" }}>
                <ActionButton variant="secondary">Back to Builder</ActionButton>
              </span>
            </Link>

            <ActionButton onClick={handleClearOrders} variant="secondary">
              Clear Orders
            </ActionButton>
          </div>
        </div>

        <div style={{ marginTop: 16 }}>
          <Toast message={message} type="success" />
        </div>

        {orders.length === 0 ? (
          <div
            style={{
              marginTop: 24,
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <p style={{ margin: 0, fontSize: 18 }}>No orders yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
            {orders.map((order) => (
              <section
                key={order.orderId}
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
                  <OrderPreviewCard order={order} />

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
                        <h2 style={{ margin: 0, fontSize: isMobile ? 22 : 26 }}>
                          Order #{order.orderId.slice(0, 8)}
                        </h2>
                        <p style={{ marginTop: 8, color: "#666" }}>
                          Placed {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>

                      <div
                        style={{
                          fontSize: isMobile ? 24 : 28,
                          fontWeight: 900,
                        }}
                      >
                        ${order.pricing.total.toFixed(2)}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: "grid",
                        gap: 16,
                        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Customer</h3>
                        <div style={{ marginTop: 8, display: "grid", gap: 4, color: "#555" }}>
                          <div>
                            {order.customer.firstName} {order.customer.lastName}
                          </div>
                          <div>{order.customer.email}</div>
                          {order.customer.phone ? <div>{order.customer.phone}</div> : null}
                          <div>{order.customer.address1}</div>
                          {order.customer.address2 ? <div>{order.customer.address2}</div> : null}
                          <div>
                            {order.customer.city}, {order.customer.state} {order.customer.zip}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 style={{ margin: 0, fontSize: 16 }}>Order Summary</h3>
                        <div style={{ marginTop: 8, display: "grid", gap: 6, color: "#555" }}>
                          <div>Status: {order.status}</div>
                          <div>Items: {order.items.length}</div>
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

                    <div style={{ marginTop: 16 }}>
                      <h3 style={{ margin: 0, fontSize: 16 }}>Items</h3>

                      <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                        {order.items.map((item) => (
                          <div
                            key={item.cartItemId}
                            style={{
                              border: "1px solid #eee",
                              borderRadius: 12,
                              padding: 12,
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
                              <strong>
                                ${(item.price * item.quantity).toFixed(2)}
                              </strong>
                            </div>

                            <div style={{ marginTop: 6, color: "#666" }}>
                              Qty: {item.quantity}
                            </div>

                            {item.customFields?.nameplateText ? (
                              <div style={{ marginTop: 6, color: "#666" }}>
                                Nameplate: {item.customFields.nameplateText}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 16,
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      <Link href={`/orders/${order.orderId}`}>
                        <span style={{ display: "inline-block" }}>
                          <ActionButton variant="primary">
                            View Order
                          </ActionButton>
                        </span>
                      </Link>

                      <ActionButton
                        onClick={() => handleRemoveOrder(order.orderId)}
                        variant="secondary"
                      >
                        Remove Order
                      </ActionButton>
                    </div>
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