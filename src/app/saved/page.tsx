"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import broncoConfigJson from "@/data/bronco-config.json";
import type { ProductConfig } from "@/types/product";
const broncoConfig = broncoConfigJson as ProductConfig;
import { getSavedBuilds, removeSavedBuild } from "@/lib/saved-builds";
import { getSelectedLayers } from "@/lib/layers";
import { SavedBuild } from "@/types/saved-build";
import BuilderPreview from "@/components/BuilderPreview";
import { ActionButton } from "@/components/ActionButton";
import { Toast } from "@/components/Toast";
// Removed getBuild from lib/api — saved builds live in localStorage,
// not an external API. lib/api.ts also throws at load time if
// NEXT_PUBLIC_API_URL is not set, which crashed this page for all users.

export default function SavedBuildsPage() {
  const [builds, setBuilds] = useState<SavedBuild[]>([]);
  const [message, setMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setBuilds(getSavedBuilds());

    const checkMobile = () => setIsMobile(window.innerWidth < 900);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const flashMessage = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2500);
  };

  const handleRemove = (buildId: string) => {
    removeSavedBuild(buildId);
    setBuilds((prev) => prev.filter((b) => b.buildId !== buildId));
    flashMessage("Build removed.");
  };

  return (
    <main style={{ minHeight: "100vh", padding: isMobile ? 16 : 24 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: isMobile ? 36 : 48, fontWeight: 900 }}>
              Saved Builds
            </h1>
            <p style={{ marginTop: 8, color: "#666" }}>
              {builds.length} saved build{builds.length === 1 ? "" : "s"}
            </p>
          </div>

          <Link href={`/build/${broncoConfig.slug}`}>
            <span style={{ display: "inline-block" }}>
              <ActionButton variant="secondary">Build Another</ActionButton>
            </span>
          </Link>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Toast message={message} type="success" />
        </div>

        {builds.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h2 style={{ marginTop: 0 }}>No saved builds yet</h2>
            <p style={{ color: "#666" }}>
              Save a Bronco Buck build and it will show up here.
            </p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile
                ? "1fr"
                : "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {builds.map((build) => {
              const layers = getSelectedLayers(broncoConfig, {
                productId: build.productId,
                selectedOptions: build.selectedOptions,
                customFields: build.customFields,
              });

              return (
                <div
                  key={build.buildId}
                  style={{
                    background: "#fff",
                    border: "1px solid #ddd",
                    borderRadius: 16,
                    padding: 18,
                    display: "grid",
                    gap: 14,
                  }}
                >
                  <BuilderPreview
                    layers={layers}
                    view="front"
                    nameplateText={build.customFields?.nameplateText}
                  />

                  <div>
                    <h2 style={{ margin: 0, fontSize: 20 }}>{build.buildName}</h2>
                    <p style={{ marginTop: 6, color: "#666", fontSize: 13 }}>
                      Saved {new Date(build.savedAt).toLocaleString()}
                    </p>
                    <p style={{ margin: "4px 0 0", fontWeight: 700 }}>
                      ${build.price.toFixed(2)}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Link href={`/saved/${build.buildId}`} style={{ textDecoration: "none" }}>
                      <ActionButton variant="primary">View</ActionButton>
                    </Link>

                    <Link
                      href={`/build/${broncoConfig.slug}?saved=${build.buildId}`}
                      style={{ textDecoration: "none" }}
                    >
                      <ActionButton variant="outline">Edit</ActionButton>
                    </Link>

                    <ActionButton
                      onClick={() => handleRemove(build.buildId)}
                      variant="secondary"
                    >
                      Remove
                    </ActionButton>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
