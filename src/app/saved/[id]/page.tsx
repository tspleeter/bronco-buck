"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import broncoConfig from "@/data/bronco-config.json";
import { getSavedBuildById } from "@/lib/saved-builds";
import { getSelectedLayers } from "@/lib/layers";
import { getBuildSummary } from "@/lib/summary";
import { addToCart } from "@/lib/cart";
import { SavedBuild } from "@/types/saved-build";
import BuilderPreview from "@/components/BuilderPreview";
import { BuildSummary } from "@/components/BuildSummary";
import { PriceSummary } from "@/components/PriceSummary";
import { ActionButton } from "@/components/ActionButton";
import CopyLinkButton from "@/components/CopyLinkButton";

export default function SavedBuildPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [build, setBuild] = useState<SavedBuild | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState("front");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (id) {
      const found = getSavedBuildById(id);
      setBuild(found ?? null);
    }
    setIsLoading(false);

    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [id]);

  const layers = useMemo(() => {
    if (!build) return [];
    return getSelectedLayers(broncoConfig, {
      productId: build.productId,
      selectedOptions: build.selectedOptions,
      customFields: build.customFields,
    });
  }, [build]);

  const summaryItems = useMemo(() => {
    if (!build) return [];
    return getBuildSummary(broncoConfig, {
      productId: build.productId,
      selectedOptions: build.selectedOptions,
      customFields: build.customFields,
    });
  }, [build]);

  const handleAddToCart = () => {
    if (!build) return;

    addToCart({
      cartItemId: crypto.randomUUID(),
      productId: build.productId,
      productName: build.productName,
      selectedOptions: build.selectedOptions,
      customFields: build.customFields,
      price: build.price,
      quantity: 1,
      addedAt: new Date().toISOString(),
    });

    router.push("/cart");
  };

  if (isLoading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#888", fontSize: 14 }}>Loading build…</p>
      </main>
    );
  }

  if (!build) {
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
          <h1 style={{ marginTop: 0 }}>Build not found</h1>
          <p style={{ color: "#666" }}>This saved build could not be found.</p>
          <Link href="/saved">
            <span style={{ display: "inline-block", marginTop: 12 }}>
              <ActionButton variant="primary">Back to Saved Builds</ActionButton>
            </span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gap: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                fontSize: 12,
                fontWeight: 700,
                color: "#666",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Saved Build
            </p>
            <h1
              style={{
                margin: "8px 0 0",
                fontSize: isMobile ? 32 : 44,
                fontWeight: 900,
              }}
            >
              {build.buildName}
            </h1>
            <p style={{ marginTop: 6, color: "#666" }}>
              Saved {new Date(build.savedAt).toLocaleString()}
            </p>
          </div>

          <Link href="/saved">
            <span style={{ display: "inline-block" }}>
              <ActionButton variant="secondary">Back to Saved Builds</ActionButton>
            </span>
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: isMobile ? "1fr" : "1.1fr 0.9fr",
          }}
        >
          <div style={{ display: "grid", gap: 20 }}>
            <PriceSummary productName={build.productName} price={build.price} />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["front", "side", "rear", "angle"].map((v) => {
                const active = view === v;
                return (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    style={{
                      padding: "10px 14px",
                      borderRadius: 999,
                      border: active ? "1px solid #111" : "1px solid #ddd",
                      background: active ? "#111" : "#fff",
                      color: active ? "#fff" : "#111",
                      cursor: "pointer",
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    {v}
                  </button>
                );
              })}
            </div>

            <BuilderPreview
              layers={layers}
              view={view}
              nameplateText={build.customFields?.nameplateText}
            />

            <BuildSummary
              items={summaryItems}
              nameplateText={build.customFields?.nameplateText}
              price={build.price}
            />
          </div>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 16,
              padding: 20,
              height: "fit-content",
              display: "grid",
              gap: 12,
            }}
          >
            <h2 style={{ marginTop: 0 }}>Actions</h2>

            <Link
              href={`/build/${broncoConfig.slug}?saved=${build.buildId}`}
              style={{ textDecoration: "none" }}
            >
              <ActionButton variant="primary">Edit Build</ActionButton>
            </Link>

            <ActionButton onClick={handleAddToCart} variant="outline">
              Add to Cart
            </ActionButton>

            <CopyLinkButton />
          </div>
        </div>
      </div>
    </main>
  );
}
