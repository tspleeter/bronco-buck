"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { SharedBuild } from "@/types/shared-build";
import { SharedBuildPreviewCard } from "@/components/SharedBuildPreviewCard";
import { ActionButton } from "@/components/ActionButton";

export default function GalleryPage() {
  const [items, setItems] = useState<SharedBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const refreshGallery = async () => {
      try {
        const res = await fetch("/api/shared-builds");
        if (res.ok && !cancelled) {
          const data = await res.json();
          setItems(data);
        }
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    refreshGallery();

    return () => { cancelled = true; };
  }, []);

  const count = useMemo(() => items.length, [items]);
  const featuredItems = useMemo(() => items.filter((item) => item.isFeatured), [items]);
  const nonFeaturedItems = useMemo(() => items.filter((item) => !item.isFeatured), [items]);

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
              <span className="label" style={{ color: "var(--color-gold)" }}>Community Gallery</span>
            </div>

            <h1 className="text-display" style={{ maxWidth: "680px", marginBottom: "16px" }}>
              Browse builds people{" "}
              <span style={{ color: "var(--color-gold-light)" }}>actually want.</span>
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
              Explore shared Bronco Buck builds, grab ideas, and jump straight
              into customizing your own version.
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <Link href="/build/bronco-buck-classic" id="gallery-start-building">
                <ActionButton variant="primary" size="lg">
                  Start Building
                </ActionButton>
              </Link>

              {!isLoading && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "var(--radius-full)",
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface-2)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "var(--color-gold)" }}>
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-text-muted)" }}>
                    {count} shared build{count === 1 ? "" : "s"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Content ── */}
        {isLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0", gap: "16px", flexDirection: "column" }}>
            <div className="spinner" aria-label="Loading builds" />
            <p className="text-muted text-sm">Loading builds…</p>
          </div>

        ) : items.length === 0 ? (
          <div
            className="surface"
            style={{ padding: "48px", textAlign: "center", display: "grid", gap: "16px", justifyItems: "center" }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-dim)" }} aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
            <div>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>No shared builds yet</h2>
              <p className="text-muted text-sm">Be the first to share your Bronco Buck build with the community.</p>
            </div>
            <Link href="/build/bronco-buck-classic">
              <ActionButton variant="primary">Start Building</ActionButton>
            </Link>
          </div>

        ) : (
          <>
            {/* Featured */}
            {featuredItems.length > 0 && (
              <section style={{ display: "grid", gap: "24px" }}>
                <div className="section-header">
                  <span className="eyebrow">Curated picks</span>
                  <h2 className="text-hero">Featured builds</h2>
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

            {/* Community */}
            {nonFeaturedItems.length > 0 && (
              <section style={{ display: "grid", gap: "24px" }}>
                <div className="section-header">
                  <span className="eyebrow">Community builds</span>
                  <h2 className="text-hero">From the community</h2>
                </div>
                <div
                  style={{
                    display: "grid",
                    gap: "20px",
                    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                  }}
                >
                  {nonFeaturedItems.map((item) => (
                    <SharedBuildPreviewCard key={item.shareId} item={item} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}

      </div>
    </main>
  );
}
