"use client";

import { getLayerAssetPath } from "@/lib/assets";

// Replaces the original BuilderPreview which was a prototype component
// with its own internal state that ignored all props. The build page
// passes layers, view, and nameplateText — this version uses all three.
// Delegates asset path resolution to lib/assets.ts — single source of truth.

interface BuilderPreviewProps {
  layers: string[];
  view: string;
  nameplateText?: string;
}

const BODY_VIEWS = ["front", "side", "rear", "angle"];

export default function BuilderPreview({
  layers,
  view,
  nameplateText,
}: BuilderPreviewProps) {
  // Normalize view — fall back to "front" if unrecognized
  const normalizedView = BODY_VIEWS.includes(view) ? view : "front";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "4 / 3",
        borderRadius: 16,
        overflow: "hidden",
        background: "#f5f5f5",
        userSelect: "none",
      }}
    >
      {layers.map((layer) => {
        const src = getLayerAssetPath(layer, normalizedView);
        if (!src) return null;

        return (
          <img
            key={layer}
            src={src}
            alt=""
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        );
      })}

      {/* Nameplate text overlay for custom nameplates */}
      {nameplateText && layers.includes("nameplate_custom") && (
        <div
          style={{
            position: "absolute",
            bottom: "14%",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "clamp(10px, 2.5vw, 16px)",
            fontWeight: 900,
            letterSpacing: "0.08em",
            color: "#111",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {nameplateText}
        </div>
      )}
    </div>
  );
}
