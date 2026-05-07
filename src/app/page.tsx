"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/ActionButton";
import { SharedBuild } from "@/types/shared-build";
import { SharedBuildPreviewCard } from "@/components/SharedBuildPreviewCard";

export default function HomePage() {
  const [items, setItems] = useState<SharedBuild[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/shared-builds");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setItems(data);
        }
      } catch {
        if (!cancelled) setItems([]);
      }
    };

    load();

    return () => { cancelled = true; };
  }, []);

  const featuredItems = useMemo(() => items.filter((i) => i.isFeatured), [items]);
  const recentItems = useMemo(() => items.filter((i) => !i.isFeatured).slice(0, 6), [items]);

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
            background: "linear-gradient(135deg, #1C1917 0%, #0C0A09 60%, #1A1510 100%)",
            padding: "clamp(32px, 5vw, 64px)",
          }}
        >
          {/* Gold glow blob */}
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
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "20%",
              width: "280px",
              height: "280px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(202,138,4,0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div className="gold-line" />
              <span className="label" style={{ color: "var(--color-gold)", letterSpacing: "0.14em" }}>
                Custom Plush Builders
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-display" style={{ maxWidth: "720px", marginBottom: "20px" }}>
              Build your perfect{" "}
              <span style={{ color: "var(--color-gold-light)" }}>Bronco Buck.</span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(1rem, 2vw, 1.2rem)",
                color: "var(--color-text-muted)",
                maxWidth: "560px",
                lineHeight: 1.65,
                marginBottom: "32px",
              }}
            >
              Customize every detail — body, mane, stand, accessories and more.
              Share your build with the world or add it to your cart.
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

            {/* Stats */}
            {items.length > 0 && (
              <div style={{ marginTop: "32px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text)" }}>
                    {items.length}
                  </div>
                  <div className="label" style={{ marginTop: "2px" }}>Builds Shared</div>
                </div>
                {featuredItems.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 800, color: "var(--color-text)" }}>
                      {featuredItems.length}
                    </div>
                    <div className="label" style={{ marginTop: "2px" }}>Featured Builds</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Featured Builds ── */}
        {featuredItems.length > 0 && (
          <section style={{ display: "grid", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
              <div className="section-header">
                <span className="eyebrow">Handpicked</span>
                <h2 className="text-hero">Featured builds</h2>
              </div>
            </div>
            <div
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              }}
            >
              {featuredItems.map((item) => (
                <SharedBuildPreviewCard key={item.shareId} item={item} />
              ))}
            </div>
          </section>
        )}

        {/* ── Recent Builds ── */}
        {recentItems.length > 0 && (
          <section style={{ display: "grid", gap: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", flexWrap: "wrap" }}>
              <div className="section-header">
                <span className="eyebrow">Community</span>
                <h2 className="text-hero">Recent builds</h2>
              </div>
              <Link href="/gallery" id="recent-view-all">
                <ActionButton variant="ghost">
                  View all builds →
                </ActionButton>
              </Link>
            </div>
            <div
              style={{
                display: "grid",
                gap: "20px",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              }}
            >
              {recentItems.map((item) => (
                <SharedBuildPreviewCard key={item.shareId} item={item} />
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
