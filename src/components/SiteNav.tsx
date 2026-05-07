"use client";

import Link from "next/link";
import { useSavedBuilds } from "@/components/SavedBuildsProvider";

export default function SiteNav() {
  const { savedCount } = useSavedBuilds();

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <div className="site-nav-inner">
        {/* Brand */}
        <Link href="/" className="site-nav-brand">
          Bronco<span>Buck</span>
        </Link>

        {/* Links */}
        <div className="site-nav-links">
          <Link href="/build/bronco-buck-classic" className="nav-link">
            Build
          </Link>

          <Link href="/gallery" className="nav-link">
            Gallery
          </Link>

          <Link
            href="/cart"
            className="nav-link"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text-muted)",
            }}
          >
            Cart
          </Link>

          <Link
            href="/saved"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "9px 16px",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-2)",
              color: "var(--color-text)",
              fontSize: "0.9rem",
              fontWeight: 600,
              transition: "background var(--dur-base) var(--ease-out), border-color var(--dur-base)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            <span>Saved</span>
            <span className="badge">{savedCount}</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
