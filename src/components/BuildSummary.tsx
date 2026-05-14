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
      </div>
    </section>
  );
}