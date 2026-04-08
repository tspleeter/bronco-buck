"use client";

import Link from "next/link";
import { useSavedBuilds } from "@/components/SavedBuildsProvider";

export default function SiteNav() {
  const { savedCount } = useSavedBuilds();

  return (
    <nav
      style={{
        width: "100%",
        borderBottom: "1px solid #ddd",
        backgroundColor: "#fff",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: "24px",
            fontWeight: 700,
            textDecoration: "none",
            color: "#111",
          }}
        >
          Bronco Buck
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
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
            Build
          </Link>

          <Link
            href="/saved"
            style={{
              padding: "10px 16px",
              border: "1px solid #111",
              borderRadius: "999px",
              textDecoration: "none",
              color: "#111",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>Saved</span>
            <span
              style={{
                minWidth: "24px",
                textAlign: "center",
                border: "1px solid #111",
                borderRadius: "999px",
                padding: "2px 8px",
                fontSize: "12px",
                lineHeight: 1.2,
              }}
            >
              {savedCount}
            </span>
          </Link>
        </div>
      </div>
    </nav>
  );
}