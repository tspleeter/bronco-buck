"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/ActionButton";
import { getSharedBuilds } from "@/lib/shared-builds";
import { SharedBuild } from "@/types/shared-build";
import { SharedBuildPreviewCard } from "@/components/SharedBuildPreviewCard";

export default function HomePage() {
  const [sharedBuilds, setSharedBuilds] = useState<SharedBuild[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const builds = await getSharedBuilds();
        if (!cancelled) {
          setSharedBuilds(builds);
        }
      } catch {
        if (!cancelled) {
          setSharedBuilds([]);
        }
      }
    };

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };

    refresh();
    checkMobile();

    window.addEventListener("shared-builds-updated", refresh);
    window.addEventListener("resize", checkMobile);

    return () => {
      cancelled = true;
      window.removeEventListener("shared-builds-updated", refresh);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const featuredBuilds = useMemo(() => {
    const featured = sharedBuilds.filter((build) => build.isFeatured);
    return featured.slice(0, 3);
  }, [sharedBuilds]);

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: 32,
        }}
      >
        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 28,
            padding: isMobile ? 22 : 32,
            display: "grid",
            gap: 20,
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
              buckthatduck.com
            </p>

            <h1
              style={{
                margin: "10px 0 0",
                fontSize: "clamp(2.2rem, 6vw, 4.5rem)",
                lineHeight: 1,
                fontWeight: 900,
              }}
            >
              Build your custom Bronco Buck.
            </h1>

            <p
              style={{
                marginTop: 16,
                fontSize: isMobile ? 18 : 20,
                lineHeight: 1.5,
                color: "#555",
                maxWidth: 700,
              }}
            >
              Broncos don’t duck. They Buck.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <Link href="/build/bronco-buck-classic">
              <span style={{ display: "inline-block" }}>
                <ActionButton variant="primary">Start Building</ActionButton>
              </span>
            </Link>

            <Link href="/gallery">
              <span style={{ display: "inline-block" }}>
                <ActionButton variant="secondary">Browse Gallery</ActionButton>
              </span>
            </Link>

            <Link href="/saved">
              <span style={{ display: "inline-block" }}>
                <ActionButton variant="secondary">View Saved Builds</ActionButton>
              </span>
            </Link>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Build</h2>
            <p style={{ marginTop: 10, color: "#666", lineHeight: 1.5 }}>
              Start with a fresh Bronco Buck and customize it your way.
            </p>
            <div style={{ marginTop: 14 }}>
              <Link href="/build/bronco-buck-classic">
                <span style={{ display: "inline-block" }}>
                  <ActionButton variant="secondary">Open Builder</ActionButton>
                </span>
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Share</h2>
            <p style={{ marginTop: 10, color: "#666", lineHeight: 1.5 }}>
              Explore shared builds in the gallery and use them as your starting point.
            </p>
            <div style={{ marginTop: 14 }}>
              <Link href="/gallery">
                <span style={{ display: "inline-block" }}>
                  <ActionButton variant="secondary">Open Gallery</ActionButton>
                </span>
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 18,
              padding: 20,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>Shop</h2>
            <p style={{ marginTop: 10, color: "#666", lineHeight: 1.5 }}>
              Review saved builds, add them to cart, and move through checkout.
            </p>
            <div style={{ marginTop: 14 }}>
              <Link href="/cart">
                <span style={{ display: "inline-block" }}>
                  <ActionButton variant="secondary">Open Cart</ActionButton>
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gap: 18,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
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
                Featured Builds
              </p>
              <h2
                style={{
                  margin: "10px 0 0",
                  fontSize: isMobile ? 30 : 40,
                  fontWeight: 900,
                }}
              >
                Start with something great.
              </h2>
            </div>

            <Link href="/gallery">
              <span style={{ display: "inline-block" }}>
                <ActionButton variant="secondary">See All Builds</ActionButton>
              </span>
            </Link>
          </div>

          {featuredBuilds.length === 0 ? (
            <div
              style={{
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 18,
                padding: 24,
              }}
            >
              <p style={{ margin: 0, fontSize: 18 }}>
                No featured builds yet. Mark a few builds as featured in dev-db.json.
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 20,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fit, minmax(300px, 1fr))",
              }}
            >
              {featuredBuilds.map((item) => (
                <SharedBuildPreviewCard key={item.shareId} item={item} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}