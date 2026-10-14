"use client";

import { useEffect, useState } from "react";
import { SALE, isSaleActive, salePrice } from "@/lib/sale";

/**
 * True while the site sale is running. Starts false and flips after mount, so
 * statically prerendered pages never hydrate with a mismatched price.
 */
export function useSaleActive(): boolean {
  const [active, setActive] = useState(false);
  useEffect(() => setActive(isSaleActive()), []);
  return active;
}

/** Shows the list price, or the sale price with the list price struck through. */
export function SalePrice({ price, prefix = "" }: { price: number; prefix?: string }) {
  const active = useSaleActive();
  if (!active) return <>{prefix}${price.toFixed(2)}</>;
  return (
    <>
      {prefix}${salePrice(price).toFixed(2)}{" "}
      <s style={{ opacity: 0.55, fontSize: "0.7em", fontWeight: 500 }}>${price.toFixed(2)}</s>
    </>
  );
}

/** Thin gold strip announcing the sale; renders nothing when no sale is on. */
export function SaleBanner() {
  const active = useSaleActive();
  if (!active || !SALE) return null;
  return (
    <div
      role="note"
      style={{
        background: "var(--color-gold)",
        color: "#0C0A09",
        textAlign: "center",
        fontWeight: 700,
        fontSize: "0.9rem",
        padding: "8px 16px",
        lineHeight: 1.4,
      }}
    >
      {SALE.name}: {SALE.percent}% off every Buck through {SALE.endsLabel}. Limited, numbered first 100.
    </div>
  );
}
