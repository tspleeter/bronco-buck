"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getBuild } from "@/lib/api";
import { useSavedBuilds } from "@/components/SavedBuildsProvider";

type BuildItem = {
  id: string;
  bodyColor: string;
  maneColor: string;
  base: string;
  price?: number;
  createdAt?: string;
};

export default function SavedBuildsPage() {
  const { savedIds, savedCount, removeSavedBuild } = useSavedBuilds();
  const [items, setItems] = useState<BuildItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBuilds() {
      setLoading(true);

      try {
        const results = await Promise.all(
          savedIds.map(async (id) => {
            try {
              return await getBuild(id);
            } catch {
              return null;
            }
          })
        );

        setItems(results.filter(Boolean) as BuildItem[]);
      } finally {
        setLoading(false);
      }
    }

    loadBuilds();
  }, [savedIds]);

  function handleRemove(id: string) {
    removeSavedBuild(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 16px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: "32px", fontWeight: 700, margin: 0 }}>
            Saved Builds
          </h1>
          <p style={{ opacity: 0.75, marginTop: "8px" }}>
            {savedCount} saved build{savedCount === 1 ? "" : "s"}
          </p>
        </div>

        <Link
          href="/build/classic"
          style={{
            padding: "10px 16px",
            border: "1px solid #111",
            borderRadius: "10px",
            textDecoration: "none",
            color: "#111",
            fontWeight: 600,
            display: "inline-block",
          }}
        >
          Build Another
        </Link>
      </div>

      {loading ? (
        <p>Loading saved builds...</p>
      ) : items.length === 0 ? (
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "16px",
            padding: "24px",
            background: "#fff",
          }}
        >
          <h2 style={{ marginTop: 0 }}>No saved builds yet</h2>
          <p style={{ opacity: 0.8 }}>
            Save a Bronco Buck build and it will show up here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "16px",
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: "16px",
                padding: "18px",
                background: "#fff",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "12px", fontSize: "22px" }}>
                Bronco Buck
              </h2>

              <div style={{ marginBottom: "14px", lineHeight: 1.7 }}>
                <div>
                  <strong>Body:</strong> {item.bodyColor}
                </div>
                <div>
                  <strong>Mane:</strong> {item.maneColor}
                </div>
                <div>
                  <strong>Base:</strong> {item.base}
                </div>
                {item.price ? (
                  <div>
                    <strong>Price:</strong> ${item.price}
                  </div>
                ) : null}
                {item.createdAt ? (
                  <div>
                    <strong>Created:</strong>{" "}
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link
                  href={`/saved/${item.id}`}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid #111",
                    borderRadius: "10px",
                    textDecoration: "none",
                    color: "#111",
                    fontWeight: 600,
                  }}
                >
                  View
                </Link>

                <button
                  onClick={() => handleRemove(item.id)}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid #111",
                    borderRadius: "10px",
                    background: "#fff",
                    color: "#111",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}