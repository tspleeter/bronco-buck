"use client";

import Link from "next/link";
import { useState } from "react";
import { ActionButton } from "@/components/ActionButton";

const COLORS = [
  { id: "V1",  name: "Ruby Red",        imageLayer: "body_ruby_red" },
  { id: "V2",  name: "Velocity Blue",   imageLayer: "body_velocity_blue" },
  { id: "V3",  name: "Shadow Black",    imageLayer: "body_shadow_black" },
  { id: "V15", name: "Eruption Green",  imageLayer: "body_eruption_green" },
  { id: "V16", name: "Oxford White",    imageLayer: "body_oxford_white" },
  { id: "V17", name: "Cyber Orange",    imageLayer: "body_cyber_orange" },
  { id: "V18", name: "Carbonized Gray", imageLayer: "body_carbonized_gray" },
  { id: "V19", name: "Cactus Gray",     imageLayer: "body_cactus_gray" },
  { id: "V20", name: "Desert Sand",     imageLayer: "body_desert_sand" },
  { id: "V21", name: "Azure Gray",      imageLayer: "body_azure_gray" },
];

export default function GalleryPage() {
  const [maneColor, setManeColor] = useState<"black" | "white">("black");

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
          {/* Glow */}
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
              All 10 Ford Bronco colors, rendered in full 3D. Toggle the mane
              color and click any Buck to start building yours.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/build/bronco-buck-classic">
                <ActionButton variant="primary" size="lg">
                  Start Building
                </ActionButton>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Mane Color Toggle ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
            Mane Color
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            {(["black", "white"] as const).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setManeColor(color)}
                className={`view-btn${maneColor === color ? " active" : ""}`}
                aria-pressed={maneColor === color}
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: color === "black" ? "#1a1a1a" : "#f5f5f0",
                    border: "1.5px solid var(--color-border-hover)",
                    flexShrink: 0,
                  }}
                />
                {color.charAt(0).toUpperCase() + color.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Color Grid ── */}
        <div
          style={{
            display: "grid",
            gap: "20px",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          }}
        >
          {COLORS.map((color) => {
            const imgSrc = ;
            const buildHref = ;

            return (
              <Link key={color.id} href={buildHref} style={{ display: "block" }}>
                <div
                  className="card card-interactive"
                  style={{ overflow: "hidden", borderRadius: "var(--radius-xl)" }}
                >
                  {/* Image */}
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
                      alt={}
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

                  {/* Label */}
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
                      <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 2 }}>
                        {maneColor.charAt(0).toUpperCase() + maneColor.slice(1)} mane · from 4.99
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
