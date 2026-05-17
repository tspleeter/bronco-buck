"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getCart, clearCart } from "@/lib/cart";
import { createOrder } from "@/lib/orders";
import { CartItem } from "@/types/cart";
import { CheckoutFormData } from "@/types/checkout";
import { Order } from "@/types/order";
import { getGroupName, getOptionName } from "@/lib/product-display";
import { ActionButton } from "@/components/ActionButton";
import { Toast } from "@/components/Toast";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const initialForm: CheckoutFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address1: "",
  address2: "",
  city: "",
  state: "",
  zip: "",
};

// Inner form component that has access to Stripe hooks
function CheckoutForm({
  items,
  form,
  setForm,
  isMobile,
}: {
  items: CartItem[];
  form: CheckoutFormData;
  setForm: React.Dispatch<React.SetStateAction<CheckoutFormData>>;
  isMobile: boolean;
}) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const shipping = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal >= 75 ? 0 : 8.95;
  }, [items, subtotal]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  const handleChange =
    (field: keyof CheckoutFormData) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const validateForm = () => {
    if (!items.length) return "Your cart is empty.";
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!form.email.trim()) return "Email is required.";
    if (!form.email.includes("@") || !form.email.includes("."))
      return "Please enter a valid email address.";
    if (!form.address1.trim()) return "Address is required.";
    if (!form.city.trim()) return "City is required.";
    if (!form.state.trim()) return "State is required.";
    if (!form.zip.trim()) return "ZIP code is required.";
    return "";
  };

  const handlePlaceOrder = async () => {
    if (!stripe || !elements) return;

    const validationError = validateForm();
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setMessage("");
    setPlacingOrder(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setMessage(error.message ?? "Payment failed. Please try again.");
        setPlacingOrder(false);
        return;
      }

      if (paymentIntent?.status !== "succeeded") {
        setMessage("Payment was not completed. Please try again.");
        setPlacingOrder(false);
        return;
      }

      // Payment succeeded — save the order
      const now = new Date().toISOString();
      const order: Order = {
        orderId: crypto.randomUUID(),
        status: "paid",
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          address1: form.address1,
          address2: form.address2,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: "US",
        },
        items: items.map((item) => ({
          cartItemId: item.cartItemId,
          productId: item.productId,
          productName: item.productName,
          selectedOptions: item.selectedOptions,
          customFields: item.customFields,
          price: item.price,
          quantity: item.quantity,
        })),
        pricing: { subtotal, shipping, total },
        createdAt: now,
        updatedAt: now,
        notes: `Stripe payment intent: ${paymentIntent.id}`,
      };

      await createOrder(order);
      clearCart();
      router.push(`/checkout/confirmation?orderId=${order.orderId}`);
    } catch {
      setMessage("Something went wrong. Please try again.");
      setPlacingOrder(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gap: 24,
        gridTemplateColumns: isMobile ? "1fr" : "1fr 0.9fr",
      }}
    >
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
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <h1 style={{ margin: 0, fontSize: isMobile ? 34 : 42, fontWeight: 900 }}>
            Checkout
          </h1>
          <Link href="/cart">
            <span style={{ display: "inline-block" }}>
              <ActionButton variant="secondary">Back to Cart</ActionButton>
            </span>
          </Link>
        </div>

        <p style={{ marginTop: 12, color: "#666", fontSize: isMobile ? 16 : 18 }}>
          Enter your shipping details to place your order.
        </p>

        <div style={{ marginTop: 16 }}>
          <Toast message={message} type={message ? "error" : "success"} />
        </div>

        <div style={{ marginTop: 24, display: "grid", gap: 16 }}>
          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>First Name</label>
              <input value={form.firstName} onChange={handleChange("firstName")} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Last Name</label>
              <input value={form.lastName} onChange={handleChange("lastName")} style={inputStyle} />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={handleChange("email")} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Phone</label>
              <input value={form.phone} onChange={handleChange("phone")} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Address Line 1</label>
            <input value={form.address1} onChange={handleChange("address1")} style={inputStyle} />
          </div>

          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Address Line 2</label>
            <input value={form.address2} onChange={handleChange("address2")} style={inputStyle} />
          </div>

          <div
            style={{
              display: "grid",
              gap: 16,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
            }}
          >
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>City</label>
              <input value={form.city} onChange={handleChange("city")} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>State</label>
              <input value={form.state} onChange={handleChange("state")} style={inputStyle} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>ZIP</label>
              <input value={form.zip} onChange={handleChange("zip")} style={inputStyle} />
            </div>
          </div>

          {/* Stripe Payment Element */}
          <div>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 12 }}>
              Payment Details
            </label>
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: 12,
                padding: "16px 14px",
              }}
            >
              <PaymentElement />
            </div>
          </div>
        </div>
      </section>

      <aside
        style={{
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 16,
          padding: isMobile ? 18 : 24,
          height: "fit-content",
        }}
      >
        <h2 style={{ margin: 0, fontSize: isMobile ? 24 : 28, fontWeight: 800 }}>
          Order Summary
        </h2>

        {items.length === 0 ? (
          <p style={{ marginTop: 16, color: "#666" }}>Your cart is empty.</p>
        ) : (
          <div style={{ marginTop: 16, display: "grid", gap: 16 }}>
            {items.map((item) => (
              <div
                key={item.cartItemId}
                style={{ borderBottom: "1px solid #eee", paddingBottom: 12 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <strong>{item.productName}</strong>
                  <strong>${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
                <div style={{ marginTop: 8, display: "grid", gap: 4, color: "#666" }}>
                  <div>Qty: {item.quantity}</div>
                  {Object.entries(item.selectedOptions).map(([groupId, value]) => {
                    if (Array.isArray(value)) {
                      if (!value.length) return null;
                      return (
                        <div key={groupId}>
                          {getGroupName(groupId)}:{" "}
                          {value.map((v) => getOptionName(v, groupId)).join(", ")}
                        </div>
                      );
                    }
                    return (
                      <div key={groupId}>
                        {getGroupName(groupId)}: {getOptionName(value, groupId)}
                      </div>
                    );
                  })}
                  {item.customFields.nameplateText ? (
                    <div>Nameplate: {item.customFields.nameplateText}</div>
                  ) : null}
                </div>
              </div>
            ))}

            <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
              <div style={summaryRowStyle}>
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={summaryRowStyle}>
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              <div
                style={{
                  ...summaryRowStyle,
                  borderTop: "2px solid #111",
                  paddingTop: 12,
                  marginTop: 8,
                  fontSize: isMobile ? 20 : 22,
                  fontWeight: 900,
                }}
              >
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <ActionButton
              onClick={handlePlaceOrder}
              disabled={placingOrder || !stripe}
              variant="primary"
            >
              {placingOrder ? "Processing..." : `Pay $${total.toFixed(2)}`}
            </ActionButton>
          </div>
        )}
      </aside>
    </div>
  );
}

// Outer component that sets up Stripe Elements
export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState<CheckoutFormData>(initialForm);
  const [clientSecret, setClientSecret] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const total = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = items.length === 0 ? 0 : subtotal >= 75 ? 0 : 8.95;
    return subtotal + shipping;
  }, [items]);

  useEffect(() => {
    setItems(getCart());
    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (total <= 0) return;

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store" },
      body: JSON.stringify({ amount: total }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret))
      .catch(console.error);
  }, [total]);

  if (!clientSecret) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#888", fontSize: 14 }}>Loading checkout…</p>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret,
          appearance: { theme: "stripe" },
        }}
      >
        <CheckoutForm
          items={items}
          form={form}
          setForm={setForm}
          isMobile={isMobile}
        />
      </Elements>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid #ccc",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 16,
};

const summaryRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};
