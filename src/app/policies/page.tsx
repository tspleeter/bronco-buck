import type { Metadata } from "next";
import Link from "next/link";
import { pageOpenGraph, BUSINESS, BUSINESS_ADDRESS_LINE } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Returns, Shipping & FAQ",
  description: "Return policy, shipping information, and frequently asked questions for BuckThatDuck custom horse figurines.",
  alternates: { canonical: "/policies" },
  openGraph: pageOpenGraph("/policies", "Returns, Shipping & FAQ"),
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section
    className="surface"
    style={{ padding: "32px 36px", display: "grid", gap: "20px" }}
  >
    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-gold)" }}>
      {title}
    </h2>
    <div style={{ display: "grid", gap: "14px", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
      {children}
    </div>
  </section>
);

const Q = ({ q, a }: { q: string; a: React.ReactNode }) => (
  <div style={{ display: "grid", gap: "6px" }}>
    <p style={{ fontWeight: 700, color: "var(--color-text)" }}>{q}</p>
    <p>{a}</p>
  </div>
);

export default function PoliciesPage() {
  return (
    <main className="page">
      <div className="page-inner" style={{ maxWidth: 800 }}>

        {/* Header */}
        <div style={{ display: "grid", gap: "8px" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            Returns, Shipping & FAQ
          </h1>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            Everything you need to know about your BuckThatDuck order.
          </p>
          <p style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", fontWeight: 700, color: "var(--color-gold)" }}>
            🇺🇸 Proudly made in the USA
          </p>
        </div>

        {/* Returns */}
        <Section title="Return Policy">
          <p>
            We want you to love your BuckThatDuck. If you're not satisfied for any reason, you may return
            your figurine within <strong style={{ color: "var(--color-text)" }}>30 days</strong> of delivery
            for a full refund of the purchase price.
          </p>
          <p>
            Because every figurine is made to order, we ask that you reach out to us before shipping
            anything back. Contact us at{" "}
            <a href="mailto:orders@buckthatduck.com" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>
              orders@buckthatduck.com
            </a>{" "}
            with your order number and the reason for your return, and we'll get back to you within
            1–2 business days with return instructions.
          </p>
          <p>
            Items must be returned in their original condition. Once we receive and inspect the return,
            we refund the full purchase price to your <strong style={{ color: "var(--color-text)" }}>original
            payment method</strong> within 5–10 business days. We don't charge a restocking fee.
          </p>
          <p style={{ color: "var(--color-text-dim)", fontSize: "0.875rem" }}>
            Shipping costs for returns are the responsibility of the customer unless the item arrived
            damaged or incorrect, in which case we'll cover return shipping in full.
          </p>
        </Section>

        {/* Shipping */}
        <Section title="Shipping">
          <p>
            We currently ship within the <strong style={{ color: "var(--color-text)" }}>United States</strong> only.
          </p>

          <div style={{ display: "grid", gap: "10px" }}>
            <p style={{ fontWeight: 700, color: "var(--color-text)" }}>Shipping Cost</p>
            <p>
              Shipping is a flat <strong style={{ color: "var(--color-text)" }}>$5.99</strong> for one Buck.
              Orders of <strong style={{ color: "var(--color-text)" }}>two or more Bucks ship free</strong>.
            </p>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <p style={{ fontWeight: 700, color: "var(--color-text)" }}>Processing & Production Time</p>
            <p>
              Every BuckThatDuck is made to order — your figurine is 3D-printed and finished after you
              place your order. Orders ship within <strong style={{ color: "var(--color-text)" }}>3–5 business
              days</strong>. We'll send you an email when your order ships, including tracking information.
            </p>
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            <p style={{ fontWeight: 700, color: "var(--color-text)" }}>Shipping Carriers</p>
            <p>
              Orders ship via USPS Ground Advantage (occasionally UPS) and typically arrive 2–5 business
              days after they ship.
            </p>
          </div>

          <p style={{ color: "var(--color-text-dim)", fontSize: "0.875rem" }}>
            If your order hasn't arrived within a reasonable timeframe or you have questions about your
            shipment, email us at{" "}
            <a href="mailto:orders@buckthatduck.com" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>
              orders@buckthatduck.com
            </a>.
          </p>
        </Section>

        {/* FAQ */}
        <Section title="Frequently Asked Questions">
          <Q
            q="What is a BuckThatDuck?"
            a="BuckThatDuck figurines are custom 3D-printed horse figurines in Bronco-inspired colors. You configure every detail — body color, mane style, mane color, and nameplate — and we print and ship it to you. We're an independent maker, not affiliated with Ford Motor Company."
          />
          <Q
            q="How long will my order take?"
            a="Every figurine is made to order and ships within 3–5 business days, then typically arrives 2–5 business days later. We email you tracking info as soon as it ships."
          />
          <Q
            q="Can I make changes to my order after placing it?"
            a={<>Reach out as soon as possible at <a href="mailto:orders@buckthatduck.com" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>orders@buckthatduck.com</a>. If production hasn't started we can usually accommodate changes, but we can't guarantee modifications once printing has begun.</>}
          />
          <Q
            q="What materials are used?"
            a="Our figurines are 3D-printed using PETG filament, which is durable, slightly flexible, and resistant to temperature changes — great for display on a desk or dashboard."
          />
          <Q
            q="Will my figurine look exactly like the preview?"
            a="The configurator preview is a close representation of the final product. Minor variations in color and finish can occur between the on-screen preview and the printed figurine due to differences in display calibration and filament properties."
          />
          <Q
            q="Can I send it as a gift?"
            a="Yes. At checkout, check “This is a gift”, enter the recipient's name and address, and add a note (up to 250 characters). We print it on a card in the box. We never put prices, a receipt or a packing slip in the package; your invoice is emailed to you instead."
          />
          <Q
            q="My figurine arrived damaged. What do I do?"
            a={<>We're sorry to hear that. Email us at <a href="mailto:orders@buckthatduck.com" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>orders@buckthatduck.com</a> with your order number and a photo of the damage and we'll make it right — no need to ship anything back.</>}
          />
          <Q
            q="Do you ship outside the US?"
            a="Not at this time. We hope to expand to more countries in the future — check back soon."
          />
        </Section>

        {/* Contact */}
        <p style={{ color: "var(--color-text-dim)", fontSize: "0.875rem", textAlign: "center" }}>
          Still have questions?{" "}
          <Link href="/contact" style={{ color: "var(--color-gold)", textDecoration: "underline" }}>
            Contact us
          </Link>
          {" "}· {BUSINESS.legalName}, {BUSINESS_ADDRESS_LINE} · Last updated October 2026
        </p>

      </div>
    </main>
  );
}
