"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { STRIPE_PUBLISHABLE_KEY, STRIPE_TEST_MODE } from "@/lib/stripe-mode";
import { GIFT_CODE_PRICE, GIFT_CODE_VALUE, GIFT_NAME_MAX } from "@/lib/gift-codes";
import { GIFT_MESSAGE_MAX } from "@/lib/gift";
import { ActionButton } from "@/components/ActionButton";
import { trackEvent } from "@/lib/analytics";

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
const price = `$${GIFT_CODE_PRICE.toFixed(2)}`;
const value = `$${GIFT_CODE_VALUE.toFixed(2)}`;

interface Details {
  buyerName: string;
  buyerEmail: string;
  recipientName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  message: string;
}

interface Fulfilled {
  code: string;
  buyerEmail: string;
  recipientName?: string;
  recipientAddress?: string;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  padding: "12px 14px",
  fontSize: 16,
};

const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 14,
  color: "var(--color-text-muted)",
};

async function fulfill(paymentIntentId: string): Promise<Fulfilled> {
  const res = await fetch("/api/gift-codes/fulfill", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store" },
    body: JSON.stringify({ paymentIntentId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? "Something went wrong.");
  return data;
}

function PayStep({
  paymentIntentId,
  onDone,
}: {
  paymentIntentId: string;
  onDone: (f: Fulfilled) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const pay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setError("");
    const { error: err, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: `${window.location.origin}/gift-card` },
    });
    if (err) {
      setError(err.message ?? "Payment failed. Please try again.");
      setBusy(false);
      return;
    }
    if (paymentIntent?.status !== "succeeded") {
      setError("Payment was not completed. Please try again.");
      setBusy(false);
      return;
    }
    try {
      onDone(await fulfill(paymentIntentId));
      trackEvent("gift_code_purchase", { value: GIFT_CODE_PRICE });
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={pay} style={{ display: "grid", gap: 16 }}>
      {STRIPE_TEST_MODE && (
        <p style={{ color: "var(--color-gold)", fontSize: 13 }}>TEST MODE — use 4242 4242 4242 4242</p>
      )}
      <PaymentElement />
      {error && <p style={{ color: "#F87171", fontSize: 14 }}>{error}</p>}
      <ActionButton type="submit" variant="primary" size="lg" disabled={!stripe || busy}>
        {busy ? "Processing…" : `Pay ${price}`}
      </ActionButton>
    </form>
  );
}

export default function GiftCardPage() {
  const [details, setDetails] = useState<Details>({
    buyerName: "",
    buyerEmail: "",
    recipientName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    message: "",
  });
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<Fulfilled | null>(null);

  // Return from a 3-D Secure / bank redirect: finish fulfillment from the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pi = params.get("payment_intent");
    if (!pi || params.get("redirect_status") !== "succeeded") return;
    fulfill(pi)
      .then(setDone)
      .catch((e) => setError(e instanceof Error ? e.message : "Something went wrong."));
  }, []);

  const set = (k: keyof Details) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDetails((d) => ({ ...d, [k]: e.target.value }));

  const start = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    setError("");
    try {
      const res = await fetch("/api/gift-codes/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache, no-store" },
        body: JSON.stringify(details),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Couldn't start checkout.");
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.paymentIntentId);
    } catch (e2) {
      setError(e2 instanceof Error ? e2.message : "Couldn't start checkout.");
    } finally {
      setStarting(false);
    }
  };

  return (
    <main className="page">
      <div className="page-inner" style={{ maxWidth: 640 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            🎁 Gift a <span style={{ color: "var(--color-gold-light)" }}>Bronco Buck</span>
          </h1>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            Not sure of their Bronco color? Let them build their own. For {price} we mail them a printed
            gift note with a {value} code, and email you a copy. Shipping on the Buck is charged when they order.
          </p>
        </div>

        <section className="surface" style={{ padding: "28px 32px", display: "grid", gap: 20 }}>
          {done ? (
            <div style={{ display: "grid", gap: 16, textAlign: "center" }}>
              <p className="label" style={{ color: "var(--color-gold)", letterSpacing: "0.14em" }}>
                Your gift code{done.recipientName ? ` for ${done.recipientName}` : ""}
              </p>
              <p style={{ fontFamily: "monospace", fontSize: "clamp(1.5rem, 5vw, 2.2rem)", fontWeight: 900, color: "var(--color-gold)", letterSpacing: "0.06em" }}>
                {done.code}
              </p>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                Worth {value} toward a Bronco Buck. One use.
                {done.recipientAddress ? <> We&rsquo;ll mail a printed gift note to {done.recipientName}, {done.recipientAddress}.</> : null}{" "}
                A copy went to <strong style={{ color: "var(--color-text)" }}>{done.buyerEmail}</strong>.
              </p>
              <Link href="/">
                <ActionButton variant="outline">Back to the shop</ActionButton>
              </Link>
            </div>
          ) : clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "night" } }}>
              <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
                Gift note mailed to {details.recipientName} · copy emailed to {details.buyerEmail}
              </p>
              <PayStep paymentIntentId={paymentIntentId} onDone={setDone} />
            </Elements>
          ) : (
            <form onSubmit={start} style={{ display: "grid", gap: 16 }}>
              <label style={labelStyle}>
                Your name
                <input required maxLength={GIFT_NAME_MAX} value={details.buyerName} onChange={set("buyerName")} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Your email (the code goes here)
                <input required type="email" value={details.buyerEmail} onChange={set("buyerEmail")} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Recipient&rsquo;s name
                <input required maxLength={GIFT_NAME_MAX} value={details.recipientName} onChange={set("recipientName")} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Recipient&rsquo;s address (we mail the gift note here)
                <input required autoComplete="address-line1" placeholder="Street address" value={details.address1} onChange={set("address1")} style={inputStyle} />
                <input autoComplete="address-line2" placeholder="Apt, suite (optional)" value={details.address2} onChange={set("address2")} style={inputStyle} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.2fr", gap: 10 }}>
                <input required aria-label="City" placeholder="City" value={details.city} onChange={set("city")} style={inputStyle} />
                <input required aria-label="State" placeholder="ST" maxLength={2} pattern="[A-Za-z]{2}" value={details.state} onChange={set("state")} style={inputStyle} />
                <input required aria-label="ZIP" placeholder="ZIP" inputMode="numeric" pattern="\d{5}(-\d{4})?" value={details.zip} onChange={set("zip")} style={inputStyle} />
              </div>
              <label style={labelStyle}>
                Note printed on the card (optional)
                <textarea maxLength={GIFT_MESSAGE_MAX} rows={3} value={details.message} onChange={set("message")} style={{ ...inputStyle, resize: "vertical" }} />
              </label>
              {error && <p style={{ color: "#F87171", fontSize: 14 }}>{error}</p>}
              <ActionButton type="submit" variant="primary" size="lg" disabled={starting}>
                {starting ? "Starting…" : `Continue to payment · ${price}`}
              </ActionButton>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
