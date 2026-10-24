import "./globals.css";
import type { ReactNode } from "react";
import SavedBuildsProvider from "@/components/SavedBuildsProvider";
import SiteNav from "@/components/SiteNav";
import CommercialIntro from "@/components/CommercialIntro";
import MetaPixel from "@/components/MetaPixel";
import UmamiAnalytics from "@/components/UmamiAnalytics";
import { SaleBanner } from "@/components/SalePrice";
import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, OG_IMAGE, FORD_DISCLAIMER, jsonLdHtml, siteJsonLd } from "@/lib/seo";

// No canonical/og:url here — they would inherit to every child page. Children set their own.
// Description keeps the hero's "Customize every detail — body, mane, and plate." (keep in sync with page.tsx).
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bronco Gift for Owners — Limited, Numbered Bronco Buck | BuckThatDuck",
    template: `%s | ${SITE_NAME}`,
  },
  description: "The gift for Bronco owners: a limited first run of 100 numbered Bronco Bucks, each with a certificate of authenticity. Customize every detail — body, mane, and plate. Made in the USA, free rubber duck, free shipping on 2+.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Bronco Gift for Owners — Limited, Numbered Bronco Buck",
    description: "Only 100 numbered first-edition Bucks. Pick their Bronco color, mane and nameplate. Made in the USA, free rubber duck.",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Three Bronco Bucks in gray, black and light blue on a ranch: Broncos don't duck, they buck." }],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE] },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(siteJsonLd())} />
      </head>
      <body>
        <MetaPixel />
        <UmamiAnalytics />
        <CommercialIntro />
        <SavedBuildsProvider>
          <SaleBanner />
          <SiteNav />
          {children}
          <footer style={{
            borderTop: "1px solid var(--color-border)",
            padding: "24px",
            display: "grid",
            gap: "14px",
            justifyItems: "center",
            fontSize: "0.8rem",
            color: "var(--color-text-dim)",
          }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "24px", flexWrap: "wrap" }}>
            <span>© {new Date().getFullYear()} Pleeter LLC</span>
            <Link href="/about" style={{ color: "var(--color-text-dim)", textDecoration: "none" }}>
              About
            </Link>
            <Link href="/contact" style={{ color: "var(--color-text-dim)", textDecoration: "none" }}>
              Contact
            </Link>
            <Link href="/gifts-for-bronco-owners" style={{ color: "var(--color-text-dim)", textDecoration: "none" }}>
              Gifts for Bronco Owners
            </Link>
            <Link href="/policies" style={{ color: "var(--color-text-dim)", textDecoration: "none" }}>
              Returns &amp; Shipping
            </Link>
            <Link href="/policies" style={{ color: "var(--color-text-dim)", textDecoration: "none" }}>
              FAQ
            </Link>
            <Link href="/policies/privacy" style={{ color: "var(--color-text-dim)", textDecoration: "none" }}>
              Privacy
            </Link>
            <Link href="/policies/terms" style={{ color: "var(--color-text-dim)", textDecoration: "none" }}>
              Terms
            </Link>
            <a
              href="https://www.instagram.com/buckthatduck/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="BuckThatDuck on Instagram"
              data-umami-event="instagram_click"
              style={{ color: "var(--color-gold)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4.5" />
                <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
              </svg>
              @buckthatduck
            </a>
          </div>
            {/* Ford non-affiliation disclaimer — sitewide (same wording as Etsy + Merchant Center feed) */}
            <p style={{ textAlign: "center", fontSize: "0.75rem", lineHeight: 1.5, maxWidth: 640, margin: 0 }}>
              {FORD_DISCLAIMER}
            </p>
          </footer>
        </SavedBuildsProvider>
      </body>
    </html>
  );
}
