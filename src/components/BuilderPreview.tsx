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
          {/* SVG text scales perfectly with the container */}
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            style={{ width: "90%", height: "80%", overflow: "visible" }}
          >
            <text
              x="50"
              y="78"
              textAnchor="middle"
              fontFamily="Arial, sans-serif"
              fontWeight="600"
              letterSpacing="1.5"
              fontSize="60"
              fill="#ffffff"
            >
              {nameplateText}
            </text>
          </svg>
        </div>
      )}
    </div>
  );
}
