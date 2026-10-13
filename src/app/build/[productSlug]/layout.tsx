import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PRODUCT_PATH, OG_IMAGE, jsonLdHtml, productJsonLd } from "@/lib/seo";

// The builder page is a client component, so its metadata + Product JSON-LD live here.
// Gallery links add ?color=…&mane=…&style=… — the canonical collapses them to one URL.
export const metadata: Metadata = {
  title: "Bronco Buck Classic — Custom Bronco Figurine",
  description:
    "Build a custom Bronco Buck: 11 Bronco-inspired colors, black or white mane, and your own nameplate. 3D-printed in the USA from $24.99, free rubber duck with every order.",
  alternates: { canonical: PRODUCT_PATH },
  openGraph: {
    title: "Bronco Buck Classic — Custom Bronco Figurine",
    description: "Pick a Bronco color, a mane and a nameplate. Made in the USA, free rubber duck included.",
    url: PRODUCT_PATH,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "Bronco Buck figurine biting a rubber duck" }],
  },
};

export default function BuildLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(productJsonLd())} />
      {children}
    </>
  );
}
