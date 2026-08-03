"use client";

import { useState, useEffect } from "react";

type OptionValue = string | string[];

interface ProductOption {
  id: string;
  name: string;
  priceDelta: number;
  imageLayer: string;
  layerType: string;
  active: boolean;
  /** When false, the option renders but is not selectable (shows a "coming soon" notice). Absent = available. */
  available?: boolean;
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
  /** Option ids to hide even if active (e.g. Long mane for colors without a render set). */
  hiddenOptionIds?: string[];
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
  "Robin's Egg Blue": "#BADBE4",
  "Brown":          "#6F4E37",
  "Sand":           "#D2B48C",
  "Match Body":     "conic-gradient(#8B1A1A, #D25514, #C3A56E, #2F7D32, #1A4FAD, #BADBE4, #8B1A1A)",
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
  hiddenOptionIds,
}: OptionGroupProps) {
  const isColorGroup = group.name.toLowerCase().includes("color");
  const isNameplateGroup = group.id === "G7";

  const [notice, setNotice] = useState<{ text: string; key: number } | null>(null);

  // Auto-dismiss the "coming soon" notice a few seconds after it appears.
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const activeOptions = group.options.filter(
    (o) => o.active && !hiddenOptionIds?.includes(o.id),
  );

  const selectedValue = typeof value === "string" ? value : undefined;
  const isCustomSelected = isNameplateGroup && selectedValue === "V13";

  const isAvailable = (option: ProductOption) => option.available !== false;

  const isSelected = (optionId: string) => {
    if (group.type === "single") return value === optionId;
    return Array.isArray(value) ? value.includes(optionId) : false;
  };

  const handleClick = (option: ProductOption) => {
    // Not-yet-available options aren't selectable — surface a notice instead.
    if (!isAvailable(option)) {
      setNotice({
        text: `${option.name} is coming soon — not available yet.`,
        key: Date.now(),
      });
      return;
    }

    if (group.type === "single") {
      onChange(group.id, option.id);
      return;
    }

    const current = Array.isArray(value) ? value : [];

    if (current.includes(option.id)) {
      onChange(group.id, current.filter((id) => id !== option.id));
    } else {
      onChange(group.id, [...current, option.id]);
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
            const available = isAvailable(option);
            const selected = isSelected(option.id) && available;
            const color = COLOR_MAP[option.name] ?? "#888888";

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleClick(option)}
                className="color-swatch-btn"
                title={
                  available
                    ? `${option.name} — ${formatPrice(option.priceDelta)}`
                    : `${option.name} — coming soon`
                }
                aria-pressed={selected}
                aria-disabled={!available}
                style={available ? undefined : { opacity: 0.5 }}
              >
                <div
                  className={`color-swatch${selected ? " selected" : ""}`}
                  style={{ background: color }}
                />
                <span className="swatch-label">{option.name}</span>
                <span style={{ fontSize: "0.7rem", color: selected ? "var(--color-gold)" : "var(--color-text-dim)" }}>
                  {available ? formatPrice(option.priceDelta) : "Coming soon"}
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
            const available = isAvailable(option);
            const selected = isSelected(option.id) && available;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleClick(option)}
                className={`option-chip${selected ? " selected" : ""}`}
                aria-pressed={selected}
                aria-disabled={!available}
                title={available ? undefined : `${option.name} — coming soon`}
                style={available ? undefined : { opacity: 0.5 }}
              >
                <span className="chip-name">{option.name}</span>
                <span className="chip-price">
                  {available ? formatPrice(option.priceDelta) : "Coming soon"}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Coming-soon notice (shown when a not-yet-available option is pressed) */}
      {notice && (
        <div
          role="status"
          aria-live="polite"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 12px",
            borderRadius: "var(--radius-md, 10px)",
            border: "1px solid var(--color-gold)",
            background: "rgba(202, 138, 4, 0.12)",
            color: "var(--color-text)",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              flexShrink: 0,
              width: "18px",
              height: "18px",
              display: "grid",
              placeItems: "center",
              borderRadius: "var(--radius-full, 999px)",
              background: "var(--color-gold)",
              color: "#0C0A09",
              fontSize: "0.7rem",
              fontWeight: 900,
            }}
          >
            !
          </span>
          <span>{notice.text}</span>
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
            maxLength={12}
            className="input"
          />
        </div>
      )}
    </section>
  );
}
