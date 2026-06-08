"use client";

type OptionValue = string | string[];

interface ProductOption {
  id: string;
  name: string;
  priceDelta: number;
  imageLayer: string;
  layerType: string;
  active: boolean;
}

interface ProductGroup {
  id: string;
  name: string;
  type: "single" | "multi";
  required: boolean;
  displayOrder: number;
  options: ProductOption[];
}

interface OptionGroupProps {
  group: ProductGroup;
  value: OptionValue | undefined;
  onChange: (groupId: string, value: OptionValue) => void;
  onCustomFieldChange?: (field: string, value: string) => void;
  customFieldValue?: string;
}

const COLOR_MAP: Record<string, string> = {
  "Ruby Red":       "#8B1A1A",
  "Velocity Blue":  "#1A4FAD",
  "Shadow Black":   "#111111",
  "Eruption Green": "#2F7D32",
  "Cactus Gray":    "#8C9B82",
  "Carbonized Gray":"#5A5C5F",
  "Oxford White":   "#F2F0EB",
  "Cyber Orange":   "#D25514",
  "Desert Sand":    "#C3A56E",
  "Azure Gray":     "#6E8CAA",
  blonde:           "#E6C27A",
  "Black":          "#111111",
  "White":          "#F2F0EB",
};

export function OptionGroup({
  group,
  value,
  onChange,
  onCustomFieldChange,
  customFieldValue,
}: OptionGroupProps) {
  const isColorGroup = group.name.toLowerCase().includes("color");
  const isNameplateGroup = group.id === "G7";

  const activeOptions = group.options.filter((o) => o.active);

  const selectedValue = typeof value === "string" ? value : undefined;
  const isCustomSelected = isNameplateGroup && selectedValue === "V13";

  const isSelected = (optionId: string) => {
    if (group.type === "single") return value === optionId;
    return Array.isArray(value) ? value.includes(optionId) : false;
  };

  const handleClick = (optionId: string) => {
    if (group.type === "single") {
      onChange(group.id, optionId);
      return;
    }

    const current = Array.isArray(value) ? value : [];

    if (current.includes(optionId)) {
      onChange(group.id, current.filter((id) => id !== optionId));
    } else {
      onChange(group.id, [...current, optionId]);
    }
  };

  const formatPrice = (priceDelta: number) => {
    if (priceDelta === 0) return "Included";
    return priceDelta > 0
      ? `+$${priceDelta.toFixed(2)}`
      : `-$${Math.abs(priceDelta).toFixed(2)}`;
  };

  return (
    <section className="surface" style={{ padding: "20px", display: "grid", gap: "16px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
        <div className="section-header">
          <span className="eyebrow">{group.required ? "Required" : "Optional"}</span>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 800, marginTop: "2px" }}>{group.name}</h3>
        </div>
        {group.type === "multi" && (
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: "var(--radius-full)",
            border: "1px solid var(--color-border)",
            color: "var(--color-text-dim)",
            whiteSpace: "nowrap",
          }}>
            Multi-select
          </span>
        )}
      </div>

      {/* Color Swatches */}
      {isColorGroup ? (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {activeOptions.map((option) => {
            const selected = isSelected(option.id);
            const color = COLOR_MAP[option.name] ?? "#888888";

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleClick(option.id)}
                className="color-swatch-btn"
                title={`${option.name} — ${formatPrice(option.priceDelta)}`}
                aria-pressed={selected}
              >
                <div
                  className={`color-swatch${selected ? " selected" : ""}`}
                  style={{ background: color }}
                />
                <span className="swatch-label">{option.name}</span>
                <span style={{ fontSize: "0.7rem", color: selected ? "var(--color-gold)" : "var(--color-text-dim)" }}>
                  {formatPrice(option.priceDelta)}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Option Chips */
        <div
          style={{
            display: "grid",
            gap: "10px",
            gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
          }}
        >
          {activeOptions.map((option) => {
            const selected = isSelected(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleClick(option.id)}
                className={`option-chip${selected ? " selected" : ""}`}
                aria-pressed={selected}
              >
                <span className="chip-name">{option.name}</span>
                <span className="chip-price">{formatPrice(option.priceDelta)}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Custom nameplate input */}
      {isCustomSelected && (
        <div style={{ marginTop: "4px" }}>
          <label className="input-label" htmlFor="nameplate-text">
            Enter nameplate text
          </label>
          <input
            id="nameplate-text"
            type="text"
            placeholder="Enter a name…"
            value={customFieldValue ?? ""}
            onChange={(e) => onCustomFieldChange?.("nameplateText", e.target.value)}
            maxLength={16}
            className="input"
          />
        </div>
      )}
    </section>
  );
}