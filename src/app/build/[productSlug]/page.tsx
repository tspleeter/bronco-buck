"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";
const broncoConfig = broncoConfigJson as ProductConfig;
import featuredBuilds from "@/data/featured-builds.json";
import { getDefaultBuildState } from "@/lib/defaults";
import { calculateBuildPrice } from "@/lib/pricing";
import { getSelectedLayers } from "@/lib/layers";
import { getBuildSummary } from "@/lib/summary";
import { addToCart } from "@/lib/cart";
import {
  addSavedBuild,
  getSavedBuildById,
  updateSavedBuild,
} from "@/lib/saved-builds";
// addSharedBuild and getSharedBuildById removed — sharing now goes through the API
import BuilderPreview from "@/components/BuilderPreview";
import { OptionGroup } from "@/components/OptionGroup";
import { PriceSummary } from "@/components/PriceSummary";
import { BuildSummary } from "@/components/BuildSummary";
import { Toast } from "@/components/Toast";
import { ActionButton } from "@/components/ActionButton";

export default function BuildPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const featuredSlug = searchParams.get("featured");
  const savedBuildId = searchParams.get("saved");
  const shareId = searchParams.get("share");

  const featuredBuild = featuredBuilds.find((b) => b.slug === featuredSlug);

  const [view, setView] = useState("front");
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  // isLoading prevents a flash of default options while we fetch the shared build
  const [isLoading, setIsLoading] = useState(!!shareId);

  const [buildState, setBuildState] = useState(() =>
    getDefaultBuildState(broncoConfig),
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // Wrap in an async IIFE so we can await the share API call
    const load = async () => {
      if (shareId) {
        try {
          const res = await fetch(`/api/shared-builds/${shareId}`);
          if (res.ok) {
            const shared = await res.json();
            setBuildState({
              productId: shared.productId,
              selectedOptions: shared.selectedOptions,
              customFields: shared.customFields,
            });
            return;
          }
          // Share ID not found — fall through to defaults below
        } catch {
          // Network error — fall through to defaults
        } finally {
          setIsLoading(false);
        }
      }

      if (savedBuildId) {
        const saved = getSavedBuildById(savedBuildId);
        if (saved) {
          setBuildState({
            productId: saved.productId,
            selectedOptions: saved.selectedOptions,
            customFields: saved.customFields,
          });
          return;
        }
      }

      if (featuredBuild) {
        setBuildState({
          productId: broncoConfig.productId,
          selectedOptions: featuredBuild.selectedOptions,
          customFields: featuredBuild.customFields,
        });
        return;
      }

      setBuildState(getDefaultBuildState(broncoConfig));
    };

    load();
  }, [shareId, savedBuildId, featuredBuild]);

  const price = useMemo(
    () => calculateBuildPrice(broncoConfig, buildState),
    [buildState],
  );

  const layers = useMemo(
    () => getSelectedLayers(broncoConfig, buildState),
    [buildState],
  );

  const summaryItems = useMemo(
    () => getBuildSummary(broncoConfig, buildState),
    [buildState],
  );

  const getBuildName = () => {
    const body = buildState.selectedOptions["G1"];
    const group = broncoConfig.groups.find((g) => g.id === "G1");

    if (typeof body === "string") {
      const option = group?.options.find((o) => o.id === body);
      if (option) return `${option.name} ${broncoConfig.name}`;
    }

    return `${broncoConfig.name} Build`;
  };

  const flash = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const handleUpdate = () => {
    if (!savedBuildId) return;

    updateSavedBuild({
      buildId: savedBuildId,
      buildName: getBuildName(),
      productId: broncoConfig.productId,
      productName: broncoConfig.name,
      selectedOptions: buildState.selectedOptions,
      customFields: buildState.customFields,
      price,
      savedAt: new Date().toISOString(),
    });

    flash("Build updated.");
  };

  const handleSaveNew = () => {
    const id = crypto.randomUUID();

    addSavedBuild({
      buildId: id,
      buildName: getBuildName(),
      productId: broncoConfig.productId,
      productName: broncoConfig.name,
      selectedOptions: buildState.selectedOptions,
      customFields: buildState.customFields,
      price,
      savedAt: new Date().toISOString(),
    });

    router.replace(`/build/${broncoConfig.slug}?saved=${id}`);
    flash("Saved as new.");
  };

  const handlePrimarySave = () => {
    savedBuildId ? handleUpdate() : handleSaveNew();
  };

  const handleAddToCart = () => {
    addToCart({
      cartItemId: crypto.randomUUID(),
      productId: broncoConfig.productId,
      productName: broncoConfig.name,
      selectedOptions: buildState.selectedOptions,
      customFields: buildState.customFields,
      price,
      quantity: 1,
      addedAt: new Date().toISOString(),
    });

    router.push("/cart");
  };

  const handleShare = async () => {
    const id = crypto.randomUUID();

    try {
      // POST to the API so the build is stored server-side and accessible cross-device
      const res = await fetch("/api/shared-builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId: id,
          buildName: getBuildName(),
          productId: broncoConfig.productId,
          productSlug: broncoConfig.slug,
          productName: broncoConfig.name,
          selectedOptions: buildState.selectedOptions,
          customFields: buildState.customFields,
          price,
          createdAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        flash("Could not create share link.");
        return;
      }
    } catch {
      flash("Could not create share link.");
      return;
    }

    const url = `${window.location.origin}/share/${id}`;

    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied.");
    } catch {
      flash(url);
    }
  };

  // Show a minimal loading state while we fetch the shared build from the API.
  // This prevents the default configuration flashing before the correct one loads.
  if (isLoading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "#888", fontSize: 14 }}>Loading build…</p>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: isMobile ? 16 : 24,
        paddingBottom: isMobile ? 110 : 24,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: 24,
          gridTemplateColumns: isMobile ? "1fr" : "1.25fr 0.75fr",
        }}
      >
        <div style={{ display: "grid", gap: 20 }}>
          <section
            style={{
              background: "#fff",
              border: "1px solid #e5e5e5",
              borderRadius: 22,
              padding: isMobile ? 20 : 26,
              boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
              display: "grid",
              gap: 18,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#666",
                }}
              >
                Build Your Bronco Buck
              </p>

              <h1
                style={{
                  margin: "8px 0 0",
                  fontSize: isMobile ? 34 : 48,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                {getBuildName()}
              </h1>
            </div>

            <PriceSummary productName={broncoConfig.name} price={price} />

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
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
              nameplateText={buildState.customFields.nameplateText}
            />
          </section>

          <BuildSummary
            items={summaryItems}
            nameplateText={buildState.customFields.nameplateText}
            price={price}
          />

          {!isMobile && (
            <div
              style={{
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                alignItems: "stretch",
              }}
            >
              <ActionButton onClick={handlePrimarySave} variant="primary">
                {savedBuildId ? "Update Build" : "Save Build"}
              </ActionButton>

              {savedBuildId && (
                <ActionButton onClick={handleSaveNew} variant="outline">
                  Save as New
                </ActionButton>
              )}

              <ActionButton onClick={handleShare} variant="secondary">
                Share Build
              </ActionButton>

              <ActionButton onClick={() => router.push("/saved")} variant="secondary">
                View Saved Builds
              </ActionButton>

              <ActionButton onClick={handleAddToCart} variant="outline">
                Add to Cart
              </ActionButton>
            </div>
          )}

          <Toast message={message} />
        </div>

        <div style={{ display: "grid", gap: 16 }}>
          {broncoConfig.groups.map((group) => (
            <OptionGroup
              key={group.id}
              group={group}
              value={buildState.selectedOptions[group.id]}
              customFieldValue={
                group.id === "G7" ? buildState.customFields.nameplateText ?? "" : ""
              }
              onChange={(id, val) =>
                setBuildState((prev) => ({
                  ...prev,
                  selectedOptions: {
                    ...prev.selectedOptions,
                    [id]: val,
                  },
                  customFields:
                    id === "G7" && val !== "V13"
                      ? {
                          ...prev.customFields,
                          nameplateText: val === "V16" ? "Buck" : "",
                        }
                      : prev.customFields,
                }))
              }
              onCustomFieldChange={(field, val) =>
                setBuildState((prev) => ({
                  ...prev,
                  customFields: {
                    ...prev.customFields,
                    [field]: val,
                  },
                }))
              }
            />
          ))}
        </div>
      </div>

      {isMobile && (
        <div
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 60,
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(10px)",
            borderTop: "1px solid #e5e5e5",
            padding: 12,
          }}
        >
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              display: "grid",
              gap: 10,
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
            }}
          >
            <ActionButton onClick={handleShare} variant="secondary">
              Share
            </ActionButton>

            <ActionButton onClick={handlePrimarySave} variant="outline">
              {savedBuildId ? "Update" : "Save"}
            </ActionButton>

            <ActionButton onClick={handleAddToCart} variant="primary">
              Add to Cart
            </ActionButton>
          </div>
        </div>
      )}
    </main>
  );
}
