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
import BuilderPreview from "@/components/BuilderPreview";
import type { ManeContext } from "@/lib/assets";
import { getManeContext } from "@/lib/mane";
import { OptionGroup } from "@/components/OptionGroup";
import { PriceSummary } from "@/components/PriceSummary";
import { BuildSummary } from "@/components/BuildSummary";
import { Toast } from "@/components/Toast";
import { ActionButton } from "@/components/ActionButton";
import { ShareModal } from "@/components/ShareModal";
import { useSavedBuilds } from "@/components/SavedBuildsProvider";

/* ── Icons ── */
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

export default function BuildPage() {
  const router = useRouter();
  const { refreshSavedBuilds } = useSavedBuilds();
  const searchParams = useSearchParams();

  const featuredSlug = searchParams.get("featured");
  const savedBuildId = searchParams.get("saved");
  const shareId = searchParams.get("share");
  const galleryColor = searchParams.get("color");
  const gallerymane = searchParams.get("mane");

  const featuredBuild = featuredBuilds.find((b) => b.slug === featuredSlug);

  const [view, setView] = useState("front");
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(!!shareId);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

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
        } catch {
          // fall through
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

      if (galleryColor || gallerymane) {
        const defaults = getDefaultBuildState(broncoConfig);
        setBuildState({
          ...defaults,
          selectedOptions: {
            ...defaults.selectedOptions,
            ...(galleryColor ? { G1: galleryColor } : {}),
            ...(gallerymane ? { G3: gallerymane } : {}),
          },
        });
        return;
      }

      setBuildState(getDefaultBuildState(broncoConfig));
    };

    load();
  }, [shareId, savedBuildId, featuredBuild, galleryColor, gallerymane]);

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

  const maneContext = useMemo(
    (): ManeContext => getManeContext(buildState.selectedOptions),
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
    refreshSavedBuilds();
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
      if (!res.ok) { flash("Could not create share link."); return; }
    } catch {
      flash("Could not create share link.");
      return;
    }
    const url = `${window.location.origin}/share/${id}`;
    setShareUrl(url);
  };

  if (isLoading) {
    return (
      <main className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div className="spinner" aria-label="Loading build" />
          <p className="text-muted text-sm">Loading build…</p>
        </div>
      </main>
    );
  }

  return (
    <>
    <main className="page">
      <div
        className="page-inner"
        style={{
          gridTemplateColumns: isMobile ? "1fr" : "1.3fr 0.7fr",
          alignItems: "start",
        }}
      >
        {/* ── LEFT: Preview + Summary + Actions ── */}
        <div style={{ display: "grid", gap: "20px" }}>

          {/* Configurator Panel */}
          <section className="surface" style={{ padding: isMobile ? "20px" : "28px", display: "grid", gap: "20px" }}>

            {/* Title */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                <div className="gold-line" />
                <span className="label" style={{ color: "var(--color-gold)" }}>
                  Build Your Bronco Buck
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "var(--color-text)",
                  lineHeight: 1,
                }}
              >
                {getBuildName()}
              </h1>
            </div>

            {/* Price */}
            <PriceSummary productName={broncoConfig.name} price={price} />

            {/* View Toggles */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {["front", "right", "back", "left"].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  className={`view-btn${view === v ? " active" : ""}`}
                  aria-pressed={view === v}
                >
                  {v}
                </button>
              ))}
            </div>

            {/* Preview */}
            <div className="preview-bg" style={{ padding: "20px" }}>
              <BuilderPreview
                layers={layers}
                view={view}
                nameplateText={buildState.customFields.nameplateText}
                mane={maneContext}
              />
            </div>
          </section>

          {/* Build Summary */}
          <BuildSummary
            items={summaryItems}
            nameplateText={buildState.customFields.nameplateText}
            price={price}
          />

          {/* Desktop Action Buttons */}
          {!isMobile && (
            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
              <ActionButton onClick={handlePrimarySave} variant="primary">
                <SaveIcon />
                {savedBuildId ? "Update Build" : "Save Build"}
              </ActionButton>

              {savedBuildId && (
                <ActionButton onClick={handleSaveNew} variant="outline">
                  Save as New
                </ActionButton>
              )}

              <ActionButton onClick={handleShare} variant="secondary">
                <ShareIcon />
                Share Build
              </ActionButton>

              <ActionButton onClick={handleAddToCart} variant="outline">
                <CartIcon />
                Add to Cart
              </ActionButton>
            </div>
          )}

          <Toast message={message} />
        </div>

        {/* ── RIGHT: Option Groups ── */}
        <div style={{ display: "grid", gap: "14px" }}>
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
                          nameplateText: val === "V22" ? "Buck" : "",
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

      {/* ── Mobile Sticky Bar ── */}
      {isMobile && (
        <div className="mobile-sticky">
          <div className="mobile-sticky-inner">
            <ActionButton onClick={handleShare} variant="secondary">
              <ShareIcon />
              Share
            </ActionButton>
            <ActionButton onClick={handlePrimarySave} variant="outline">
              <SaveIcon />
              {savedBuildId ? "Update" : "Save"}
            </ActionButton>
            <ActionButton onClick={handleAddToCart} variant="primary">
              <CartIcon />
              Add to Cart
            </ActionButton>
          </div>
        </div>
      )}
    </main>

      {shareUrl && (
        <ShareModal
          shareUrl={shareUrl}
          buildName={getBuildName()}
          onClose={() => setShareUrl(null)}
        />
      )}
    </>
  );
}
