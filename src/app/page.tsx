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
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            minHeight: "520px",
          }}
        >
          {/* LEFT — text */}
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
            {/* Gold glow */}
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

            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="gold-line" />
              <span className="label" style={{ color: "var(--color-gold)", letterSpacing: "0.14em" }}>
                Ford Bronco Colors
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-display" style={{ marginBottom: 0 }}>
              Build your{" "}
              <span style={{ color: "var(--color-gold-light)" }}>Bronco Buck.</span>
            </h1>

            {/* Subtitle */}
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

            {/* CTAs */}
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

          {/* RIGHT — hero image */}
          <div
            style={{
              position: "relative",
              background: "#0C0A09",
              overflow: "hidden",
            }}
          >
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
            {/* Gold glow underneath */}
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
        </section>

      </div>
    </main>
  );
}
