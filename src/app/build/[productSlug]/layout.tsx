import type { Metadata } from "next";
import type { ReactNode } from "react";
import { PRODUCT_PATH, OG_IMAGE, jsonLdHtml, productJsonLd } from "@/lib/seo";

// The builder page is a client component, so its metadata + Product JSON-LD live here.
// Gallery links add ?color=…&mane=…&style=… — the canonical collapses them to one URL.
export const metadata: Metadata = {
  title: "Bronco Buck Classic — Limited, Numbered Bronco Gift",
  description:
    "Gift for Bronco owners: build a Bronco Buck Classic in 11 Bronco-inspired colors, regular or long mane, with your own nameplate. First 100 are numbered with a certificate of authenticity. From $31.19, made in the USA, free rubber duck.",
  alternates: { canonical: PRODUCT_PATH },
  openGraph: {
    title: "Bronco Buck Classic — Limited, Numbered Bronco Gift",
    description: "Only 100 numbered first-edition Bucks. Pick their Bronco color, mane and nameplate. Made in the USA, free rubber duck.",
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
