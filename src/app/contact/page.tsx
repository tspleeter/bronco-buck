import type { Metadata } from "next";
import Link from "next/link";
import { pageOpenGraph, BUSINESS } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Contact BuckThatDuck (Pleeter LLC, Hawthorne, New Jersey) about an order, a return or a custom Bronco Buck.",
  alternates: { canonical: "/contact" },
  openGraph: pageOpenGraph("/contact", "Contact BuckThatDuck"),
};

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: "grid", gap: "4px" }}>
    <p className="label" style={{ color: "var(--color-gold)", letterSpacing: "0.14em" }}>{label}</p>
    <div style={{ color: "var(--color-text)", lineHeight: 1.6 }}>{children}</div>
  </div>
);

const link = { color: "var(--color-gold)", textDecoration: "underline" } as const;

export default function ContactPage() {
  return (
    <main className="page">
      <div className="page-inner" style={{ maxWidth: 800 }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            Contact Us
          </h1>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            Questions about an order, a return or a custom Buck? Email us and we&rsquo;ll reply within 1–2 business days.
          </p>
        </div>

        <section className="surface" style={{ padding: "32px 36px", display: "grid", gap: "24px" }}>
          <Row label="Email">
            <a href={`mailto:${BUSINESS.email}`} style={link}>{BUSINESS.email}</a>
          </Row>
          <Row label="Business">
            <address style={{ fontStyle: "normal" }}>
              {BUSINESS.legalName} (BuckThatDuck)<br />
              {BUSINESS.street}<br />
              {BUSINESS.city}, {BUSINESS.region} {BUSINESS.postalCode}<br />
              United States
            </address>
          </Row>
          <Row label="Orders & returns">
            <span style={{ color: "var(--color-text-muted)" }}>
              Include your order number (it starts with BTD-). For returns, see our{" "}
              <Link href="/policies" style={link}>return policy</Link>: 30 days from delivery, refunded to your
              original payment method.
            </span>
          </Row>
        </section>
      </div>
    </main>
  );
}
