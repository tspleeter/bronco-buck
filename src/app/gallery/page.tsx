"use client";

import Link from "next/link";
import { ActionButton } from "@/components/ActionButton";

// Each tile showcases a different mane so the gallery reads as an assortment,
// not one repeated style. Now that Long (V28) is LIVE for all 11 colors, styles
// alternate down the grid (reg V4 / long V28) and mane colors are mixed while
// keeping good contrast against each body (white pops on near-black bodies like
// Shadow/Carbonized; black on light bodies like Oxford/Desert/Azure/Robin's).
// style token feeds the filename (`_{styleToken}mane_`); styleId feeds the
// builder link so the pre-selected mane matches the tile preview.
const COLORS = [
  { id: "V1",  name: "Ruby Red",         imageLayer: "body_ruby_red",        style: "long", styleId: "V28", mane: "white", maneId: "V7" },
  { id: "V2",  name: "Velocity Blue",    imageLayer: "body_velocity_blue",   style: "reg",  styleId: "V4",  mane: "white", maneId: "V7" },
  { id: "V3",  name: "Shadow Black",     imageLayer: "body_shadow_black",    style: "long", styleId: "V28", mane: "white", maneId: "V7" },
  { id: "V15", name: "Eruption Green",   imageLayer: "body_eruption_green",  style: "reg",  styleId: "V4",  mane: "white", maneId: "V7" },
  { id: "V16", name: "Oxford White",     imageLayer: "body_oxford_white",    style: "long", styleId: "V28", mane: "black", maneId: "V6" },
  { id: "V17", name: "Cyber Orange",     imageLayer: "body_cyber_orange",    style: "reg",  styleId: "V4",  mane: "white", maneId: "V7" },
  { id: "V18", name: "Carbonized Gray",  imageLayer: "body_carbonized_gray", style: "long", styleId: "V28", mane: "white", maneId: "V7" },
  { id: "V19", name: "Cactus Gray",      imageLayer: "body_cactus_gray",     style: "reg",  styleId: "V4",  mane: "black", maneId: "V6" },
  { id: "V20", name: "Desert Sand",      imageLayer: "body_desert_sand",     style: "long", styleId: "V28", mane: "black", maneId: "V6" },
  { id: "V21", name: "Azure Gray",       imageLayer: "body_azure_gray",      style: "reg",  styleId: "V4",  mane: "black", maneId: "V6" },
  { id: "V23", name: "Robin's Egg Blue", imageLayer: "body_robins_egg_blue", style: "long", styleId: "V28", mane: "black", maneId: "V6" },
];

const STYLE_LABEL: Record<string, string> = { reg: "Regular", long: "Long" };

export default function GalleryPage() {
  return (
    <main className="page">
      <div className="page-inner">

        {/* ── Hero Header ── */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
            background: "linear-gradient(135deg, #1C1917 0%, #0C0A09 70%, #1A1510 100%)",
            padding: "clamp(28px, 4vw, 56px)",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-80px",
              right: "-40px",
              width: "400px",
              height: "400px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(202,138,4,0.14) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div className="gold-line" />
              <span className="label" style={{ color: "var(--color-gold)" }}>Color Gallery</span>
            </div>

            <h1 className="text-display" style={{ maxWidth: "680px", marginBottom: "16px" }}>
              Every color.{" "}
              <span style={{ color: "var(--color-gold-light)" }}>Your Buck.</span>
            </h1>

            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.175rem)",
                color: "var(--color-text-muted)",
                maxWidth: "560px",
                lineHeight: 1.65,
                marginBottom: "28px",
              }}
            >
              All 11 Ford Bronco colors, rendered in full 3D. Click any Buck to
              start customizing yours.
            </p>

            <Link href="/build/bronco-buck-classic">
              <ActionButton variant="primary" size="lg">
                Start Building
              </ActionButton>
            </Link>
          </div>
        </section>

        {/* ── Color Grid ── */}
        <div
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {COLORS.map((color) => {
            const imgSrc = `/assets/body/${color.imageLayer}_front_${color.style}mane_${color.mane}.png`;
            const buildHref = `/build/bronco-buck-classic?color=${color.id}&mane=${color.maneId}&style=${color.styleId}`;

            return (
              <Link key={color.id} href={buildHref} style={{ display: "block" }}>
                <div
                  className="card card-interactive"
                  style={{ overflow: "hidden", borderRadius: "var(--radius-xl)" }}
                >
                  <div
                    className="preview-bg"
                    style={{
                      aspectRatio: "3 / 4",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "16px",
                    }}
                  >
                    <img
                      src={imgSrc}
                      alt={`${color.name} Buck with a ${color.mane} ${STYLE_LABEL[color.style].toLowerCase()} mane`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        transition: "transform 300ms cubic-bezier(0.16,1,0.3,1)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLImageElement).style.transform = "scale(1)";
                      }}
                    />
                  </div>

                  <div
                    style={{
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid var(--color-border)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-text)" }}>
                        {color.name}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.8rem",
                          color: "var(--color-text-muted)",
                          marginTop: 3,
                        }}
                      >
                        <span style={{ color: "var(--color-gold-light)", fontWeight: 600 }}>
                          {STYLE_LABEL[color.style]} mane
                        </span>
                        <span aria-hidden="true" style={{ opacity: 0.5 }}>·</span>
                        <span>from $24.99</span>
                      </div>
                    </div>
                    <svg
                      width="18" height="18" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ color: "var(--color-gold)", flexShrink: 0 }}
                      aria-hidden="true"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </main>
  );
}
