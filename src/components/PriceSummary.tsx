interface PriceSummaryProps {
  productName: string;
  price: number;
}

export function PriceSummary({ productName, price }: PriceSummaryProps) {
  return (
    <div
      style={{
        background: "var(--color-gold-dim)",
        border: "1px solid rgba(202,138,4,0.25)",
        borderRadius: "var(--radius-md)",
        padding: "20px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
      }}
    >
      <div>
        <p className="label" style={{ color: "var(--color-gold)", marginBottom: "4px" }}>
          Current Build
        </p>
        <p style={{ fontFamily: "var(--font-heading)", fontSize: "1.05rem", fontWeight: 700, color: "var(--color-text)" }}>
          {productName}
        </p>
      </div>
      <div
        className="price-display"
        style={{ fontSize: "clamp(1.75rem, 3vw, 2.25rem)", color: "var(--color-gold-light)" }}
      >
        ${price.toFixed(2)}
      </div>
    </div>
  );
}
