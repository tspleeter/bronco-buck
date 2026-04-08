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
    <section
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 20,
        padding: 20,
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              color: "#666",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
            }}
          >
            Current Build
          </p>
          <h2
            style={{
              margin: "8px 0 0",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            Build Summary
          </h2>
        </div>

        <div
          style={{
            fontSize: 30,
            fontWeight: 900,
            whiteSpace: "nowrap",
          }}
        >
          ${price.toFixed(2)}
        </div>
      </div>

      <div
        style={{
          marginTop: 18,
          display: "grid",
          gap: 10,
        }}
      >
        {items.map((item) => (
          <div
            key={item.groupId}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
              paddingBottom: 10,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <strong style={{ color: "#444" }}>{item.groupName}</strong>
            <span style={{ color: "#111" }}>{item.optionName}</span>
          </div>
        ))}

        {nameplateText ? (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 14,
              flexWrap: "wrap",
              paddingBottom: 10,
              borderBottom: "1px solid #f0f0f0",
            }}
          >
            <strong style={{ color: "#444" }}>Nameplate Text</strong>
            <span style={{ color: "#111" }}>{nameplateText}</span>
          </div>
        ) : null}
      </div>
    </section>
  );
}