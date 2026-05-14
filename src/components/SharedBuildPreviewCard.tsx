"use client";

import Link from "next/link";
import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";
const broncoConfig = broncoConfigJson as ProductConfig;
import { SharedBuild } from "@/types/shared-build";
import { getSelectedLayers } from "@/lib/layers";
import BuilderPreview from "@/components/BuilderPreview";
import { ActionButton } from "@/components/ActionButton";

interface SharedBuildPreviewCardProps {
  item: SharedBuild;
}

export function SharedBuildPreviewCard({
  item,
}: SharedBuildPreviewCardProps) {
  const layers = getSelectedLayers(broncoConfig, {
    productId: item.productId,
    selectedOptions: item.selectedOptions,
    customFields: item.customFields,
  });

  return (
    <article
      className="card"
      style={{ padding: "20px", display: "grid", gap: "18px" }}
    >
      {/* Preview */}
      <div className="preview-bg" style={{ padding: "16px" }}>
        <BuilderPreview
          layers={layers}
          view="front"
          nameplateText={item.customFields?.nameplateText}
        />
      </div>

      {/* Info */}
      <div style={{ display: "grid", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 800, letterSpacing: "-0.01em", color: "var(--color-text)", lineHeight: 1.2 }}>
            {item.buildName}
          </h2>
          <div
            className="price-display"
            style={{ fontSize: "1.25rem", whiteSpace: "nowrap", color: "var(--color-gold-light)" }}
          >
            ${item.price.toFixed(2)}
          </div>
        </div>

        <p style={{ fontSize: "0.8rem", color: "var(--color-text-dim)" }}>
          Shared {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <Link href={`/share/${item.shareId}`} style={{ display: "contents" }}>
          <ActionButton variant="outline">
            View Build
          </ActionButton>
        </Link>
        <Link href={`/build/${item.productSlug}?share=${item.shareId}`} style={{ display: "contents" }}>
          <ActionButton variant="primary">
            Build This
          </ActionButton>
        </Link>
      </div>
    </article>
  );
}