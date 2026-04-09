"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ActionButton } from "@/components/ActionButton";
import { SharedBuild } from "@/types/shared-build";
import { SharedBuildPreviewCard } from "@/components/SharedBuildPreviewCard";

export default function HomePage() {
  const [items, setItems] = useState<SharedBuild[]>([]);
  const [isMobile, setIsMobile] = useState(false);

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

    const checkMobile = () => setIsMobile(window.innerWidth < 900);

    load();
    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const featuredItems = useMemo(() => items.filter((i) => i.isFeatured), [items]);
  const recentItems = useMemo(() => items.filter((i) => !i.isFeatured).slice(0, 6), [items]);

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 32 }}>
        <section
          style={{
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 28,
            padding: isMobile ? 24 : 40,
            boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
          }}
        >
          <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Bronco Buck
          </p>
          <h1 style={{ margin: "12px 0 0", fontSize: isMobile ? 42 : 64, fontWeight: 900, lineHeight: 1 }}>
            Build your perfect Bronco.
          </h1>
          <p style={{ marginTop: 16, fontSize: isMobile ? 16 : 20, color: "#555", maxWidth: 600 }}>
            Customize every detail — body, mane, stand, accessories and more. Share your build or add it to your cart.
          </p>
          <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
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
          </div>
        </section>

        {featuredItems.length > 0 && (
          <section style={{ display: "grid", gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 36, fontWeight: 900 }}>Featured builds</h2>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {featuredItems.map((item) => (
                <SharedBuildPreviewCard key={item.shareId} item={item} />
              ))}
            </div>
          </section>
        )}

        {recentItems.length > 0 && (
          <section style={{ display: "grid", gap: 16 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? 28 : 36, fontWeight: 900 }}>Recent builds</h2>
            <div style={{ display: "grid", gap: 20, gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(300px, 1fr))" }}>
              {recentItems.map((item) => (
                <SharedBuildPreviewCard key={item.shareId} item={item} />
              ))}
            </div>
            <Link href="/gallery" style={{ justifySelf: "start", textDecoration: "none" }}>
              <ActionButton variant="secondary">View all builds</ActionButton>
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
