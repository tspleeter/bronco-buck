import type { Metadata } from "next";
import Link from "next/link";
import { pageOpenGraph, BUSINESS, BUSINESS_ADDRESS_LINE, PRODUCT_PATH, ETSY_SHOP_URL, INSTAGRAM_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "BuckThatDuck is a small maker in Hawthorne, New Jersey (Pleeter LLC). Every Bronco Buck is 3D-printed to order. First Edition 2026: 100 numbered Bucks, each with a matching certificate.",
  alternates: { canonical: "/about" },
  openGraph: pageOpenGraph("/about", "About BuckThatDuck"),
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="surface" style={{ padding: "32px 36px", display: "grid", gap: "20px" }}>
    <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-gold)" }}>{title}</h2>
    <div style={{ display: "grid", gap: "14px", color: "var(--color-text-muted)", lineHeight: 1.7 }}>
      {children}
    </div>
  </section>
);

const strong = { color: "var(--color-text)" } as const;
const link = { color: "var(--color-gold)", textDecoration: "underline" } as const;

export default function AboutPage() {
  return (
    <main className="page">
      <div className="page-inner" style={{ maxWidth: 800 }}>
        <div style={{ display: "grid", gap: "8px" }}>
          <h1 style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 900, letterSpacing: "-0.02em" }}>
            About BuckThatDuck
          </h1>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>
            Broncos don&rsquo;t duck, they buck.
          </p>
          <p style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.875rem", fontWeight: 700, color: "var(--color-gold)" }}>
            🇺🇸 Proudly made in the USA
          </p>
        </div>

        <Section title="Who we are">
          <p>
            BuckThatDuck is a small, independent maker based in <strong style={strong}>Hawthorne, New Jersey</strong>.
            It&rsquo;s run by Todd under <strong style={strong}>{BUSINESS.legalName}</strong>, a New Jersey company.
          </p>
          <p>
            We make the <strong style={strong}>Bronco Buck</strong>: a horse bust collectible for Bronco owners. You pick the
            body color, mane and nameplate, and we print it for you.
          </p>
        </Section>

        <Section title="How every Buck is made">
          <p>
            Each Buck is <strong style={strong}>3D-printed to order</strong> in durable PETG, then finished and packed by hand
            in Hawthorne. Nothing is mass-produced or drop-shipped. Orders ship within 3–5 business days, and every box
            includes a free rubber duck.
          </p>
          <p>
            <Link href={PRODUCT_PATH} style={link}>Build your Buck</Link>{" "}to see exactly what you&rsquo;ll get before you
            order.
          </p>
        </Section>

        <Section title="First Edition 2026: the first 100">
          <p>
            The <strong style={strong}>Bronco Buck Classic First Edition 2026</strong> is limited to{" "}
            <strong style={strong}>100 numbered Bucks</strong>. Every Buck is marked with its number, and each one ships
            with a <strong style={strong}>matching numbered certificate of authenticity</strong>. 2026 is the edition year.
            Once the first 100 are gone, they&rsquo;re gone.
          </p>
          <figure style={{ margin: 0, display: "grid", gap: "8px" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/product/coa-first-edition.webp"
              alt="Bronco Buck Classic First Edition 2026 certificate of authenticity, No. 37 of 100"
              width={1050}
              height={750}
              loading="eager"
              decoding="async"
              style={{ width: "100%", height: "auto", borderRadius: "8px" }}
            />
            <figcaption style={{ fontSize: "0.8rem", color: "var(--color-text-dim)" }}>
              The certificate that ships with each First Edition Buck. The number matches the one marked on the Buck.
            </figcaption>
          </figure>
        </Section>

        <Section title="Find us">
          <p>
            {BUSINESS.legalName} · {BUSINESS_ADDRESS_LINE} ·{" "}
            <a href={`mailto:${BUSINESS.email}`} style={link}>{BUSINESS.email}</a>
          </p>
          <p>
            Also on <a href={ETSY_SHOP_URL} target="_blank" rel="noopener noreferrer" style={link}>Etsy</a> and{" "}
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={link}>Instagram</a>. Questions?{" "}
            <Link href="/contact" style={link}>Contact us</Link>.
          </p>
        </Section>
      </div>
    </main>
  );
}
