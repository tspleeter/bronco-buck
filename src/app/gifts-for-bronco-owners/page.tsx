import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ActionButton";
import { SalePrice } from "@/components/SalePrice";
import config from "@/data/bronco-config.json";
import { FLAT_SHIPPING } from "@/lib/shipping-rules";
import {
  SITE_URL,
  PRODUCT_PATH,
  OG_IMAGE,
  ETSY_LISTING_URL,
  FORD_DISCLAIMER,
  PRODUCT_COLORS,
  productImage,
  jsonLdHtml,
} from "@/lib/seo";

// SEO landing page for "gifts for Bronco owners" searches (Oct 2026).
// Server component: all copy is in the HTML so search engines can read it.

const PATH = "/gifts-for-bronco-owners";
const PRICE = `$${config.basePrice.toFixed(2)}`;

export const metadata: Metadata = {
  title: "Gifts for Bronco Owners — A Buck in Their Bronco's Color",
  description: `Shopping for a Bronco owner? Match a Bronco Buck to their paint, put their name or their Bronco's nickname on the plate, and ship it with a gift note and no prices in the box. From ${PRICE}, ships in 3 to 5 business days.`,
  alternates: { canonical: PATH },
  openGraph: {
    title: "Gifts for Bronco Owners — A Buck in Their Bronco's Color",
    description: "Match it to their paint, put their name on the plate, and we'll tuck in a gift note.",
    url: PATH,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Bronco Buck figurine biting a rubber duck" }],
  },
};

const REASONS = [
  {
    title: "It matches what's in their driveway",
    body: "Pick from 11 Bronco-inspired colors, so their Buck looks like their truck, whether it's Cactus Gray, Azure Gray, Cyber Orange or Eruption Green.",
  },
  {
    title: "Personal, not off the shelf",
    body: "Put their name, their Bronco's nickname or their trail handle on the plate, up to 12 characters. Or keep it simple with BUCK or %uckThatDuck.",
  },
  {
    title: "Numbered and limited",
    body: "The first 100 are numbered #1 to #100 and ship with a certificate of authenticity, so it's a keeper, not a stocking stuffer they'll lose.",
  },
  {
    title: "Ready to give",
    body: "Check \"This is a gift\" at checkout, add a note, and ship it straight to them. No prices or receipt in the box; your invoice is emailed to you. A rubber duck rides along free.",
  },
  {
    title: "Two Bronco friends? Ship free",
    body: `One Buck ships for $${FLAT_SHIPPING.toFixed(2)}. Order two or more, for them and a trail buddy, and shipping is free.`,
  },
  {
    title: "Made to order in New Jersey",
    body: "Each Buck is 3D-printed in Hawthorne, New Jersey, in tough PETG, and usually ships within 3 to 5 business days.",
  },
];

const FAQS = [
  {
    q: "What is a good gift for a Bronco owner?",
    a: `Something that's clearly about their Bronco. The Bronco Buck is a horse bust you build to match theirs: their body color, a regular or long mane in black or white, and their name on the plate. It starts at ${PRICE} and comes with a free rubber duck.`,
  },
  {
    q: "I don't know the exact color of their Bronco. What should I pick?",
    a: "Snap a photo of their Bronco and compare it to the color swatches below. Still stuck? Shadow Black, Oxford White and Carbonized Gray are safe picks that look good next to any Bronco.",
  },
  {
    q: "Can you include a gift note and ship it to them?",
    a: "Yes. At checkout, check \"This is a gift\", enter their name and address, and write a note (up to 250 characters). We print it on a card in the box. No prices or receipt go in the package; your invoice is emailed to you.",
  },
  {
    q: "Is it a limited edition?",
    a: "Yes. The first 100 Bronco Buck Classics are a numbered first edition, #1 to #100, and each ships with a certificate of authenticity.",
  },
  {
    q: "Which colors are available?",
    a: `11 colors: ${PRODUCT_COLORS.map((c) => c.name).join(", ")}.`,
  },
  {
    q: "Can I put a name on it?",
    a: "Yes. The nameplate can say BUCK or %uckThatDuck at no charge, or a custom name up to 12 characters for $5.",
  },
  {
    q: "How long does it take to arrive?",
    a: "Every Buck is made to order. Most orders are printed and shipped within 3 to 5 business days, and you get a tracking email when it ships. For a birthday or the holidays, order at least two weeks ahead.",
  },
  {
    q: "How much is shipping?",
    a: `Shipping to the US is a flat $${FLAT_SHIPPING.toFixed(2)} for one Buck. Orders of two or more Bucks ship free.`,
  },
  {
    q: "Is this official Ford merchandise?",
    a: `No. ${FORD_DISCLAIMER}`,
  },
  {
    q: "Can I buy it on Etsy?",
    a: "Yes. The Bronco Buck Classic is also available in the BuckThatDuck Etsy shop.",
  },
];

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Gifts for Bronco Owners", item: `${SITE_URL}${PATH}` },
    ],
  },
];

export default function GiftsPage() {
  return (
    <main className="page">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(jsonLd)} />
      <style>{`
        .gift-hero { display: grid; grid-template-columns: 1.1fr 0.9fr; }
        .gift-hero-img { background: #0C0A09; display: flex; align-items: stretch; justify-content: center; min-height: 320px; }
        .gift-reasons { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); }
        .gift-colors { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
        @media (max-width: 760px) { .gift-hero { grid-template-columns: 1fr; } }
      `}</style>
      <div className="page-inner">

        {/* ── Hero ── */}
        <section
          className="gift-hero"
          style={{
            overflow: "hidden",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, #1C1917 0%, #0C0A09 70%, #1A1510 100%)",
              padding: "clamp(28px, 4vw, 52px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="gold-line" />
              <span className="label" style={{ color: "var(--color-gold)", letterSpacing: "0.14em" }}>
                Gift Guide
              </span>
            </div>
            <h1 className="text-display" style={{ marginBottom: 0 }}>
              Gifts for{" "}
              <span style={{ color: "var(--color-gold-light)" }}>Bronco owners.</span>
            </h1>
            <p style={{ fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "var(--color-text-muted)", lineHeight: 1.65, maxWidth: 520 }}>
              Know someone who waves at every Bronco they pass? Give them a Bronco Buck: a 3D-printed horse
              bust in their Bronco&apos;s color, with their name on the plate. <SalePrice price={config.basePrice} prefix="From " />, with a free rubber
              duck in every box.
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Link href={PRODUCT_PATH}>
                <ActionButton variant="primary" size="lg">Build their Buck</ActionButton>
              </Link>
              <a href={ETSY_LISTING_URL} target="_blank" rel="noopener" data-umami-event="etsy_click">
                <ActionButton variant="outline" size="lg">Shop on Etsy</ActionButton>
              </a>
            </div>
          </div>
          <div className="gift-hero-img">
            <img
              src="/assets/product/gifts-trio-v1.webp"
              alt="Three Bronco Buck figurines in gray, black and light blue on %uckThatDuck nameplate stands, the black one biting a rubber duck, under the tagline Broncos don't duck, they buck."
              width={1400}
              height={1400}
              style={{ width: "100%", height: "100%", minHeight: 320, objectFit: "cover", display: "block" }}
            />
          </div>
        </section>

        {/* ── Why it works as a gift ── */}
        <section style={{ display: "grid", gap: "20px" }}>
          <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
            Why it makes a great Bronco gift
          </h2>
          <div className="gift-reasons">
            {REASONS.map((r) => (
              <div key={r.title} className="surface" style={{ padding: "22px 24px", display: "grid", gap: "8px", alignContent: "start" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--color-gold-light)" }}>{r.title}</h3>
                <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>{r.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Colors ── */}
        <section style={{ display: "grid", gap: "20px" }}>
          <div style={{ display: "grid", gap: "8px" }}>
            <h2 style={{ fontSize: "clamp(1.4rem, 3vw, 1.9rem)", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Pick the color of their Bronco
            </h2>
            <p style={{ color: "var(--color-text-muted)" }}>Tap their color to start building. You can change the mane and nameplate next.</p>
          </div>
          <div className="gift-colors">
            {PRODUCT_COLORS.map((c) => (
              <Link key={c.id} href={`${PRODUCT_PATH}?color=${c.id}`} style={{ display: "block" }}>
                <div className="card card-interactive" style={{ overflow: "hidden", borderRadius: "var(--radius-lg)" }}>
                  <div className="preview-bg" style={{ aspectRatio: "3 / 4" }}>
                    <img
                      src={productImage(c.slug)}
                      alt={`${c.name} Bronco Buck figurine`}
                      loading="lazy"
                      decoding="async"
                      width={990}
                      height={1294}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  </div>
                  <div style={{ padding: "12px 14px", borderTop: "1px solid var(--color-border)", fontWeight: 700, fontSize: "0.95rem" }}>
                    {c.name}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="surface" style={{ padding: "clamp(24px, 4vw, 36px)", display: "grid", gap: "20px" }}>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--color-gold)" }}>Gift FAQ</h2>
          {FAQS.map((f) => (
            <div key={f.q} style={{ display: "grid", gap: "6px" }}>
              <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text)" }}>{f.q}</h3>
              <p style={{ color: "var(--color-text-muted)", lineHeight: 1.65 }}>{f.a}</p>
            </div>
          ))}
        </section>

        {/* ── Closing CTA ── */}
        <section style={{ textAlign: "center", display: "grid", gap: "16px", justifyItems: "center", padding: "12px 0" }}>
          <p style={{ fontSize: "1.2rem", fontWeight: 700 }}>
            Broncos don&apos;t duck, <span style={{ color: "var(--color-gold-light)" }}>they buck.</span>
          </p>
          <Link href={PRODUCT_PATH}>
            <ActionButton variant="primary" size="lg">Start building</ActionButton>
          </Link>
          <p style={{ fontSize: "0.75rem", lineHeight: 1.5, color: "var(--color-text-dim)", maxWidth: 640 }}>
            {FORD_DISCLAIMER}
          </p>
        </section>

      </div>
    </main>
  );
}
