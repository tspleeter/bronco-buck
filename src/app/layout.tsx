import "./globals.css";
import type { ReactNode } from "react";
import SavedBuildsProvider from "@/components/SavedBuildsProvider";
import SiteNav from "@/components/SiteNav";
import Link from "next/link";

export const metadata = {
  title: "Bronco Buck — Custom Plush Builder",
  description: "Design your perfect Bronco Buck plush. Customize every detail — body, mane, stand, accessories and more. Share your build or add it to your cart.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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
          </footer>
        </SavedBuildsProvider>
      </body>
    </html>
  );
}
