"use client";

import Link from "next/link";
import Image from "next/image";
import { ActionButton } from "@/components/ActionButton";

export default function HomePage() {
  return (
    <main className="page">
      <div className="page-inner">

        {/* ── Hero ── */}
        <section
          style={{
            position: "relative",
            overflow: "hidden",
            borderRadius: "var(--radius-xl)",
            border: "1px solid var(--color-border)",
          }}
        >
          <style>{`
            .hero-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              min-height: 520px;
            }
            .hero-image-wrap {
              position: relative;
              background: #0C0A09;
              overflow: hidden;
              min-height: 320px;
            }
            @media (max-width: 700px) {
              .hero-grid {
                grid-template-columns: 1fr;
              }
            }
          `}</style>

          <div className="hero-grid">

            {/* LEFT / TOP — text */}
            <div
              style={{
                background: "linear-gradient(135deg, #1C1917 0%, #0C0A09 70%, #1A1510 100%)",
                padding: "clamp(28px, 4vw, 52px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                gap: "24px",
                position: "relative",
                zIndex: 1,
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "-60px",
                  right: "-60px",
                  width: "360px",
                  height: "360px",
                  borderRadius: "50%",
                  background: "radial-gradient(circle, rgba(202,138,4,0.18) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="gold-line" />
                <span className="label" style={{ color: "var(--color-gold)", letterSpacing: "0.14em" }}>
                  Ford Bronco Colors
                </span>
              </div>

              <h1 className="text-display" style={{ marginBottom: 0 }}>
                Build your{" "}
                <span style={{ color: "var(--color-gold-light)" }}>Bronco Buck.</span>
              </h1>

              <p
                style={{
                  fontSize: "clamp(1rem, 2vw, 1.2rem)",
                  color: "var(--color-text-muted)",
                  maxWidth: "480px",
                  lineHeight: 1.65,
                }}
              >
                Customize every detail — body, mane, stand, accessories and more.
                Share your build with the world or add it to your cart.
                Proudly made in the USA. 🇺🇸
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <Link href="/build/bronco-buck-classic" id="hero-start-building">
                  <ActionButton variant="primary" size="lg">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                    Start Building
                  </ActionButton>
                </Link>
                <Link href="/gallery" id="hero-browse-gallery">
                  <ActionButton variant="outline" size="lg">
                    Browse Gallery
                  </ActionButton>
                </Link>
              </div>
            </div>

            {/* RIGHT / BOTTOM — hero image */}
            <div className="hero-image-wrap">
              <Image
                src="/assets/hero-buck-duck.png"
                alt="Bronco Buck biting a rubber duck"
                fill
                style={{
                  objectFit: "contain",
                  objectPosition: "left top",
                  filter: "drop-shadow(0 24px 64px rgba(0,0,0,0.9))",
                }}
                priority
              />

              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "10%",
                  width: "80%",
                  height: "80px",
                  background: "radial-gradient(ellipse, rgba(202,138,4,0.22) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
            </div>

          </div>

          {/* Free duck badge — below image, centered */}
          <div
            style={{
              background: "#0C0A09",
              display: "flex",
              justifyContent: "center",
              padding: "16px 24px 24px",
            }}
          >
            <div
              style={{
                background: "rgba(28,25,23,0.95)",
                border: "1px solid rgba(202,138,4,0.6)",
                borderRadius: "100px",
                padding: "12px 28px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <svg width="28" height="22" viewBox="0 0 200 165" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M18 138 C8 110,12 80,32 62 C48 48,72 38,96 38 C122 38,150 48,164 68 C178 90,176 125,164 142 C144 165,52 168,18 138Z" fill="#F5C800"/>
                <path d="M18 138 C8 110,12 80,32 62 C24 85,24 120,40 148 C28 152,22 146,18 138Z" fill="#D4A800" opacity="0.5"/>
                <path d="M20 118 C2 106,-4 88,6 74 C12 66,22 70,18 80 C14 90,18 102,28 108" fill="#F5C800" stroke="#D4A800" stroke-width="1"/>
                <ellipse cx="118" cy="44" rx="18" ry="20" fill="#F5C800"/>
                <circle cx="126" cy="26" r="26" fill="#F5C800"/>
                <path d="M146 22 Q178 14 176 26 Q178 34 146 32Z" fill="#E86000"/>
                <path d="M146 32 Q178 34 174 44 Q170 50 146 40Z" fill="#C84800"/>
                <circle cx="140" cy="18" r="6" fill="#111"/>
                <circle cx="142" cy="15" r="2" fill="white"/>
              </svg>
              <span style={{ fontSize: "1rem", fontWeight: 700, color: "#fafaf9", whiteSpace: "nowrap" }}>
                Free rubber duck with every order
              </span>
            </div>
          </div>

        </section>

      </div>
    </main>
  );
}
