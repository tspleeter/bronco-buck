"use client";

import Link from "next/link";
import broncoConfig from "@/data/bronco-config.json";
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
    <section
      style={{
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 22,
        padding: 18,
        display: "grid",
        gap: 16,
        boxShadow: "0 6px 20px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          background: "linear-gradient(180deg, #fafafa 0%, #f2f2f2 100%)",
          padding: 10,
        }}
      >
        <BuilderPreview
          layers={layers}
          view="front"
          nameplateText={item.customFields?.nameplateText}
        />
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "start",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 900,
              lineHeight: 1.15,
            }}
          >
            {item.buildName}
          </h2>

          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              whiteSpace: "nowrap",
            }}
          >
            ${item.price.toFixed(2)}
          </div>
        </div>

        <p
          style={{
            margin: 0,
            color: "#666",
            fontSize: 14,
          }}
        >
          Shared {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "1fr 1fr",
        }}
      >
        <Link
          href={`/share/${item.shareId}`}
          style={{ textDecoration: "none" }}
        >
          <ActionButton variant="secondary">View Build</ActionButton>
        </Link>

        <Link
          href={`/build/${item.productSlug}?share=${item.shareId}`}
          style={{ textDecoration: "none" }}
        >
          <ActionButton variant="primary">Build This</ActionButton>
        </Link>
      </div>
    </section>
  );
}