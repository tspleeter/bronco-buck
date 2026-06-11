"use client";

import { useRef, useEffect, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerHeight(el.offsetHeight));
    ro.observe(el);
    setContainerHeight(el.offsetHeight);
    return () => ro.disconnect();
  }, []);

  // Nameplate plate height is 21.1% of container; text fills 80% of that
  const plateFontSize = containerHeight > 0 ? containerHeight * 0.211 * 0.80 : 0;

  return (
    <div
      ref={containerRef}
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

      {nameplateText && plateFontSize > 0 && (
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
              fontSize: `${plateFontSize}px`,
            }}
          >
            {nameplateText}
          </span>
        </div>
      )}
    </div>
  );
}
