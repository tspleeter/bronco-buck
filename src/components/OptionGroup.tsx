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
  red: "#c1121f",
  blue: "#1d4ed8",
  black: "#111111",
  green: "#2f7d32",
  blonde: "#e6c27a",
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
      onChange(
        group.id,
        current.filter((id) => id !== optionId),
      );
    } else {
      onChange(group.id, [...current, optionId]);
    }
  };

  const formatPrice = (priceDelta: number) => {
    if (priceDelta === 0) return "$0.00";
    return priceDelta > 0
      ? `+$${priceDelta.toFixed(2)}`
      : `-$${Math.abs(priceDelta).toFixed(2)}`;
  };

  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 20,
        padding: 18,
        display: "grid",
        gap: 14,
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
          {group.required ? "Required" : "Optional"}
        </p>

        <h3 style={{ margin: "8px 0 0", fontSize: 22, fontWeight: 900 }}>
          {group.name}
        </h3>
      </div>

      {isColorGroup ? (
        <div
          style={{
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {activeOptions.map((option) => {
            const selected = isSelected(option.id);
            const color = COLOR_MAP[option.name.toLowerCase()] || "#cccccc";

            return (
              <button
                key={option.id}
                onClick={() => handleClick(option.id)}
                style={{
                  display: "grid",
                  gap: 8,
                  justifyItems: "center",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
                title={`${option.name} ${formatPrice(option.priceDelta)}`}
                type="button"
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    border: selected ? "3px solid #111" : "2px solid #ddd",
                    background: color,
                  }}
                />

                <div
                  style={{
                    textAlign: "center",
                    display: "grid",
                    gap: 2,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#111",
                    }}
                  >
                    {option.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "#666",
                      fontWeight: 600,
                    }}
                  >
                    {formatPrice(option.priceDelta)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          }}
        >
          {activeOptions.map((option) => {
            const selected = isSelected(option.id);

            return (
              <button
                key={option.id}
                onClick={() => handleClick(option.id)}
                style={{
                  textAlign: "left",
                  borderRadius: 16,
                  border: selected ? "2px solid #111" : "1px solid #ddd",
                  background: selected ? "#111" : "#fff",
                  color: selected ? "#fff" : "#111",
                  padding: 14,
                  cursor: "pointer",
                }}
                type="button"
              >
                <div style={{ fontWeight: 800 }}>{option.name}</div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: selected ? "#ddd" : "#666",
                  }}
                >
                  {formatPrice(option.priceDelta)}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {isCustomSelected && (
        <div style={{ marginTop: 4 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#444",
              marginBottom: 8,
            }}
          >
            Enter nameplate text
          </label>

          <input
            type="text"
            placeholder="Enter a name"
            value={customFieldValue ?? ""}
            onChange={(e) =>
              onCustomFieldChange?.("nameplateText", e.target.value)
            }
            maxLength={16}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #ddd",
              fontSize: 14,
            }}
          />
        </div>
      )}
    </section>
  );
}