"use client";

import { BuildSummaryItem } from "@/lib/summary";

interface BuildSummaryProps {
  items: BuildSummaryItem[];
  nameplateText?: string;
  price: number;
}

export function BuildSummary({
  items,
  nameplateText,
  price,
}: BuildSummaryProps) {
  return (
    <section className="surface" style={{ padding: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "20px" }}>
        <div className="section-header">
          <span className="eyebrow">Current Build</span>
          <h2 style={{ fontSize: "1.4rem", fontWeight: 800 }}>Build Summary</h2>
        </div>
        <div
          className="price-display"
          style={{ fontSize: "1.75rem", color: "var(--color-gold-light)", whiteSpace: "nowrap" }}
        >
          ${price.toFixed(2)}
        </div>
      </div>

      {/* Divider */}
      <div className="divider" style={{ marginBottom: "16px" }} />

      {/* Summary Rows */}
      <div style={{ display: "grid" }}>
        {items.map((item) => (
          <div key={item.groupId} className="summary-row">
            <strong>{item.groupName}</strong>
            <span>{item.optionName}</span>
          </div>
        ))}

        {nameplateText && (
          <div className="summary-row">
            <strong>Nameplate Text</strong>
            <span>{nameplateText}</span>
          </div>
        )}

        <div className="summary-row" style={{ color: "var(--color-gold)" }}>
          <strong style={{display:"flex",alignItems:"center"}}><svg width="22" height="18" viewBox="0 0 200 165" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{display:"inline",verticalAlign:"middle",marginRight:6}}>
  <path d="M18 138 C8 110,12 80,32 62 C48 48,72 38,96 38 C122 38,150 48,164 68 C178 90,176 125,164 142 C144 165,52 168,18 138Z" fill="#F5C800"/>
  <path d="M18 138 C8 110,12 80,32 62 C24 85,24 120,40 148 C28 152,22 146,18 138Z" fill="#D4A800" opacity="0.5"/>
  <path d="M20 118 C2 106,-4 88,6 74 C12 66,22 70,18 80 C14 90,18 102,28 108" fill="#F5C800" stroke="#D4A800" stroke-width="1"/>
  <ellipse cx="118" cy="44" rx="18" ry="20" fill="#F5C800"/>
  <circle cx="126" cy="26" r="26" fill="#F5C800"/>
  <path d="M146 22 Q178 14 176 26 Q178 34 146 32Z" fill="#E86000"/>
  <path d="M146 32 Q178 34 174 44 Q170 50 146 40Z" fill="#C84800"/>
  <circle cx="140" cy="18" r="6" fill="#111"/>
  <circle cx="142" cy="15" r="2" fill="white"/>
  <path d="M58 100 Q82 86,124 96 Q138 102,134 114 Q124 126,96 126 Q60 123,58 100Z" fill="#D4A800" opacity="0.4"/>
</svg>Free Rubber Duck</strong>
          <span>Included</span>
        </div>
      </div>
    </section>
  );
}