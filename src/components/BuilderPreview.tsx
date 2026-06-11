"use client";

import { getLayerAssetPath, ManeContext } from "@/lib/assets";

interface BuilderPreviewProps {
  layers: string[];
  view: string;
  nameplateText?: string;
  mane?: ManeContext;
}

const BODY_VIEWS = ["front", "right", "back", "left"];

export default function BuilderPreview({
  layers,
  view,
  nameplateText,
  mane,
}: BuilderPreviewProps) {
  const normalizedView = BODY_VIEWS.includes(view) ? view : "front";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "990 / 1294",
        borderRadius: 16,
        overflow: "hidden",
        background: "rgb(84, 85, 90)",
        userSelect: "none",
      }}
    >
      {layers.map((layer) => {
        const src = getLayerAssetPath(layer, normalizedView, mane);
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

      {nameplateText && (
        <div
          style={{
            position: "absolute",
            top: "76.5%",
            left: "10.5%",
            width: "78.8%",
            height: "21.1%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#111",
            border: "3px solid #ffffff",
            boxSizing: "border-box",
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              lineHeight: 1,
              fontWeight: 600,
              letterSpacing: "0.06em",
              color: "#ffffff",
              fontFamily: "Arial, sans-serif",
              /* 21.1% of container height × 80% = ~16.9% of total height */
              fontSize: "16.9cqh",
            }}
          >
            {nameplateText}
          </span>
        </div>
      )}
    </div>
  );
}
