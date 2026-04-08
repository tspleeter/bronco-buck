interface PriceSummaryProps {
  productName: string;
  price: number;
}

export function PriceSummary({ productName, price }: PriceSummaryProps) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 16, padding: 16 }}>
      <p style={{ margin: 0, color: "#666", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Current Build
      </p>
      <h2 style={{ margin: "8px 0 0", fontSize: 32 }}>{productName}</h2>
      <p style={{ margin: "12px 0 0", fontSize: 40, fontWeight: 900 }}>${price.toFixed(2)}</p>
    </div>
  );
}
