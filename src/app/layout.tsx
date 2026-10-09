import "./globals.css";
import type { ReactNode } from "react";
import SavedBuildsProvider from "@/components/SavedBuildsProvider";
import SiteNav from "@/components/SiteNav";
import CommercialIntro from "@/components/CommercialIntro";
import MetaPixel from "@/components/MetaPixel";
import UmamiAnalytics from "@/components/UmamiAnalytics";
import Link from "next/link";

export const metadata = {
  title: "Bronco Buck — Custom Collectible Builder",
  description: "Design your perfect Bronco Buck collectible. Customize every detail — body, mane, and plate. Share your build or add it to your cart.",
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
      </head>
      <body>
        <MetaPixel />
        <UmamiAnalytics />
        <CommercialIntro />
        <SavedBuildsProvider>
          <SiteNav />
          {children}
          <footer style={{
            borderTop: "1px solid var(--color-border)",
            padding: "24px",
            display: "flex",
            justifyContent: "center",
            gap: "24px",
            flexWrap: "wrap",
            fontSize: "0.8rem",
            color: "var(--color-text-dim)",
          }}>
            <span>© {new Date().getFullYear()} Pleeter LLC</span>
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
          </footer>
        </SavedBuildsProvider>
      </body>
    </html>
  );
}
