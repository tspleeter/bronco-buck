"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import broncoConfig from "@/data/bronco-config.json";
import { getSharedBuildById } from "@/lib/shared-builds";
import { getSelectedLayers } from "@/lib/layers";
import { getBuildSummary } from "@/lib/summary";
import BuilderPreview from "@/components/BuilderPreview";
import { BuildSummary } from "@/components/BuildSummary";
import { PriceSummary } from "@/components/PriceSummary";
import { ActionButton } from "@/components/ActionButton";

export default function SharedBuildPage() {
  const params = useParams<{ shareId: string }>();
  const shareId = params?.shareId;

  const [sharedBuild, setSharedBuild] = useState<any>(null);
  const [view, setView] = useState("front");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!shareId) return;

    const found = getSharedBuildById(shareId);
    if (found) {
      setSharedBuild(found);
    }
  }, [shareId]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const layers = useMemo(() => {
    if (!sharedBuild) return [];
    return getSelectedLayers(broncoConfig, sharedBuild);
  }, [sharedBuild]);

  const summaryItems = useMemo(() => {
    if (!sharedBuild) return [];
    return getBuildSummary(broncoConfig, sharedBuild);
  }, [sharedBuild]);

  if (!sharedBuild) {
    return (
      <main style={{ minHeight: "100vh", padding: 24 }}>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            background: "#fff",
            border: "1px solid #ddd",
            borderRadius: 16,
            padding: 24,
          }}
        >
          <h1>Shared build not found</h1>
          <p style={{ color: "#666" }}>
            This build is not available in your local storage.
          </p>

          <Link href="/build/bronco-buck-classic">
            <ActionButton>Go to Builder</ActionButton>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#777",
            }}
          >
            Shared Build
          </p>

          <h1
            style={{
              marginTop: 8,
              fontSize: isMobile ? 32 : 48,
              fontWeight: 900,
            }}
          >
            {sharedBuild.buildName}
          </h1>

          <p style={{ color: "#666", marginTop: 8 }}>
            Broncos don’t duck. They Buck.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
          }}
        >
          <div style={{ display: "grid", gap: 20 }}>
            <PriceSummary
              productName={sharedBuild.productName}
              price={sharedBuild.price}
            />

            <div style={{ display: "flex", gap: 8 }}>
              {["front", "side", "rear", "angle"].map((v) => (
                <button key={v} onClick={() => setView(v)}>
                  {v}
                </button>
              ))}
            </div>

            <BuilderPreview
              layers={layers}
              view={view}
              nameplateText={sharedBuild.customFields?.nameplateText}
            />

            <BuildSummary
              items={summaryItems}
              nameplateText={sharedBuild.customFields?.nameplateText}
              price={sharedBuild.price}
            />
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 16,
              padding: 20,
              height: "fit-content",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Make This Yours</h2>

            <p style={{ color: "#666" }}>
              Start from this Bronco Buck build and customize it your way.
            </p>

            <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
              <Link
                href={`/build/${sharedBuild.productSlug}?share=${sharedBuild.shareId}`}
                style={{ textDecoration: "none" }}
              >
                <ActionButton variant="primary">Build This</ActionButton>
              </Link>

              <Link
                href={`/build/${sharedBuild.productSlug}`}
                style={{ textDecoration: "none" }}
              >
                <ActionButton variant="secondary">Start Fresh</ActionButton>
              </Link>
            </div>

            <p style={{ marginTop: 16, fontSize: 12, color: "#888" }}>
              Note: sharing is currently local to this browser.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}