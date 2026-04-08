"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSharedBuilds } from "@/lib/shared-builds";
import { SharedBuild } from "@/types/shared-build";
import { SharedBuildPreviewCard } from "@/components/SharedBuildPreviewCard";
import { ActionButton } from "@/components/ActionButton";

export default function GalleryPage() {
  const [items, setItems] = useState<SharedBuild[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refreshGallery = async () => {
      try {
        const builds = await getSharedBuilds();
        if (!cancelled) {
          setItems(builds);
        }
      } catch {
        if (!cancelled) {
          setItems([]);
        }
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    refreshGallery();
    checkMobile();

    window.addEventListener("resize", checkMobile);
    window.addEventListener("shared-builds-updated", refreshGallery);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("shared-builds-updated", refreshGallery);
    };
  }, []);

  const count = useMemo(() => items.length, [items]);

  const featuredItems = useMemo(() => items.filter((item) => item.isFeatured), [items]);
  const nonFeaturedItems = useMemo(
    () => items.filter((item) => !item.isFeatured),
    [items],
  );

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 28 }}>
        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 28,
            padding: isMobile ? 22 : 32,
            display: "grid",
            gap: 18,
            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ maxWidth: 760 }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Bronco Buck
            </p>

            <h1
              style={{
                margin: "10px 0 0",
                fontSize: isMobile ? 38 : 56,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              Browse builds people actually want.
            </h1>

            <p
              style={{
                marginTop: 14,
                color: "#555",
                fontSize: isMobile ? 16 : 20,
                lineHeight: 1.5,
                maxWidth: 700,
              }}
            >
              Explore shared Bronco Buck builds, grab ideas, and jump straight
              into customizing your own version.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link href="/build/bronco-buck-classic">
              <span style={{ display: "inline-block" }}>
                <ActionButton variant="primary">Start Building</ActionButton>
              </span>
            </Link>

            <div
              style={{
                color: "#666",
                fontWeight: 700,
                padding: "10px 4px",
              }}
            >
              {count} shared build{count === 1 ? "" : "s"}
            </div>
          </div>
        </section>

        {items.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 18,
              padding: 24,
            }}
          >
            <p style={{ margin: 0, fontSize: 18 }}>No shared builds yet.</p>
          </div>
        ) : (
          <>
            {featuredItems.length > 0 && (
              <section style={{ display: "grid", gap: 18 }}>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#666",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    Featured
                  </p>
                  <h2
                    style={{
                      margin: "10px 0 0",
                      fontSize: isMobile ? 30 : 40,
                      fontWeight: 900,
                    }}
                  >
                    Curated picks.
                  </h2>
                </div>

                <section
                  style={{
                    display: "grid",
                    gap: 22,
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(300px, 1fr))",
                  }}
                >
                  {featuredItems.map((item) => (
                    <SharedBuildPreviewCard key={item.shareId} item={item} />
                  ))}
                </section>
              </section>
            )}

            {nonFeaturedItems.length > 0 && (
              <section style={{ display: "grid", gap: 18 }}>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 700,
                      color: "#666",
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                    }}
                  >
                    More Builds
                  </p>
                  <h2
                    style={{
                      margin: "10px 0 0",
                      fontSize: isMobile ? 30 : 40,
                      fontWeight: 900,
                    }}
                  >
                    Community builds.
                  </h2>
                </div>

                <section
                  style={{
                    display: "grid",
                    gap: 22,
                    gridTemplateColumns: isMobile
                      ? "1fr"
                      : "repeat(auto-fit, minmax(300px, 1fr))",
                  }}
                >
                  {nonFeaturedItems.map((item) => (
                    <SharedBuildPreviewCard key={item.shareId} item={item} />
                  ))}
                </section>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
}