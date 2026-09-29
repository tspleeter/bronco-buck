"use client";

import { getLayerAssetPath, ManeContext } from "@/lib/assets";

interface BuilderPreviewProps {
  layers: string[];
  view: string;
  nameplateText?: string;
  mane?: ManeContext;
}

const BODY_VIEWS = ["front", "right", "back", "left"];

/** Nameplate text for the V12 brand option. Rendered two-tone like the sticker. */
export const BRAND_NAMEPLATE_TEXT = "%uckThatDuck";
const BRAND_GOLD = "#EBB209"; // sampled from the %uckThatDuck rim sticker

// Plate is 78.8% x 18.0% of a 990x1294 canvas (~780x233px) -> ~3.35:1.
const VB_W = 335;
const VB_H = 100;
const PAD_X = 14;

function NameplateText({ text }: { text: string }) {
  const isBrand = text === BRAND_NAMEPLATE_TEXT;
  // Rough advance width per char in em (Outfit 800 ~0.62, Arial 600 ~0.62)
  // plus letter-spacing; shrink the font so long names fit the plate width.
  const letterSpacing = isBrand ? 0 : 4;
  const avail = VB_W - PAD_X * 2;
  const fit = (avail / Math.max(text.length, 1) - letterSpacing) / 0.62;
  const fontSize = Math.max(18, Math.min(80, fit));
  const y = VB_H / 2 + fontSize * 0.35;

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      preserveAspectRatio="xMidYMid meet"
      style={{ width: "94%", height: "90%" }}
    >
      <text
        x={VB_W / 2}
        y={y}
        textAnchor="middle"
        fontFamily={
          isBrand ? "Outfit, 'Arial Black', Arial, sans-serif" : "Arial, sans-serif"
        }
        fontWeight={isBrand ? 800 : 600}
        letterSpacing={letterSpacing}
        fontSize={fontSize}
        fill="#ffffff"
        textLength={isBrand ? avail : undefined}
        lengthAdjust={isBrand ? "spacingAndGlyphs" : undefined}
      >
        {isBrand ? (
          <>
            <tspan fill="#ffffff">%uck</tspan>
            <tspan fill={BRAND_GOLD}>ThatDuck</tspan>
          </>
        ) : (
          text
        )}
      </text>
    </svg>
  );
}

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

      {/* Preload every layer for the other views so a view switch swaps all
          layers together from cache instead of loading them one by one. */}
      <div style={{ display: "none" }} aria-hidden="true">
        {BODY_VIEWS.filter((v) => v !== normalizedView).map((v) =>
          layers.map((layer) => {
            const src = getLayerAssetPath(layer, v, mane);
            if (!src) return null;
            return <img key={`preload-${layer}-${v}`} src={src} alt="" />;
          }),
        )}
      </div>

      {nameplateText && normalizedView === "front" && (
        <div
          style={{
            position: "absolute",
            top: "76.5%",
            left: "10.5%",
            width: "78.8%",
            height: "18.0%",
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
          <NameplateText text={nameplateText} />
        </div>
      )}
    </div>
  );
}
