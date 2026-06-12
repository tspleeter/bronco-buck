"use client";

import { useState } from "react";

interface ShareModalProps {
  shareUrl: string;
  buildName: string;
  onClose: () => void;
}

// Reliable clipboard copy that works on iOS Safari
function copyToClipboard(text: string): boolean {
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    if (ok) return true;
  } catch { /* fall through */ }
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch { /* fall through */ }
  return false;
}

export function ShareModal({ shareUrl, buildName, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);

  const encoded = encodeURIComponent(shareUrl);
  const tweetText = encodeURIComponent(`Check out my custom Bronco Buck: ${buildName}`);

  const handleCopyLink = () => {
    copyToClipboard(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyForPlatform = (platform: string) => {
    copyToClipboard(shareUrl);
    setCopiedPlatform(platform);
    setTimeout(() => setCopiedPlatform(null), 2500);
  };

  const platforms = [
    {
      key: "facebook",
      label: "Facebook",
      color: "#1877F2",
      onClick: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
          "_blank",
          "noopener,noreferrer,width=600,height=500"
        );
      },
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      key: "twitter",
      label: "X / Twitter",
      color: "#ffffff",
      onClick: () => {
        window.open(
          `https://twitter.com/intent/tweet?url=${encoded}&text=${tweetText}`,
          "_blank",
          "noopener,noreferrer"
        );
      },
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      key: "instagram",
      label: copiedPlatform === "instagram" ? "Link copied! ✓" : "Instagram",
      color: "#E1306C",
      onClick: () => handleCopyForPlatform("instagram"),
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      ),
    },
    {
      key: "tiktok",
      label: copiedPlatform === "tiktok" ? "Link copied! ✓" : "TikTok",
      color: "#ffffff",
      onClick: () => handleCopyForPlatform("tiktok"),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.75)",
          backdropFilter: "blur(4px)",
          zIndex: 100,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share your build"
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          zIndex: 101,
          background: "#1C1917",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "32px 28px",
          width: "min(420px, 92vw)",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: "1.25rem", color: "#fafaf9", marginBottom: 4 }}>
              Share your Buck
            </h2>
            <p style={{ fontSize: "0.85rem", color: "#a8a29e" }}>Show the world what you built</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "rgba(255,255,255,0.07)", border: "none",
              borderRadius: "50%", width: 36, height: 36,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#a8a29e", flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Platform buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {platforms.map((p) => {
            const isConfirmed = p.label.includes("✓");
            return (
              <button
                key={p.key}
                onClick={p.onClick}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  padding: "13px 16px", borderRadius: 12,
                  border: `1px solid ${isConfirmed ? "rgba(202,138,4,0.5)" : "rgba(255,255,255,0.1)"}`,
                  background: isConfirmed ? "rgba(202,138,4,0.12)" : "rgba(255,255,255,0.04)",
                  color: "#fafaf9", fontWeight: 600, fontSize: "0.85rem",
                  cursor: "pointer", textAlign: "left", transition: "background 150ms",
                }}
              >
                <span style={{ color: isConfirmed ? "#CA8A04" : p.color, flexShrink: 0 }}>
                  {p.icon}
                </span>
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ fontSize: "0.78rem", color: "#78716c" }}>or copy link</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Copy link bar */}
        <div style={{ display: "flex", gap: "8px" }}>
          <div style={{
            flex: 1, background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
            padding: "10px 14px", fontSize: "0.8rem", color: "#a8a29e",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {shareUrl}
          </div>
          <button
            onClick={handleCopyLink}
            style={{
              background: copied ? "#CA8A04" : "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
              padding: "10px 16px",
              color: copied ? "#0C0A09" : "#fafaf9",
              fontWeight: 700, fontSize: "0.85rem",
              cursor: "pointer", whiteSpace: "nowrap",
              transition: "background 200ms, color 200ms",
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <p style={{ fontSize: "0.78rem", color: "#57534e", textAlign: "center", marginTop: -8 }}>
          Instagram &amp; TikTok: tap to copy the link, then paste in your post or bio.
        </p>
      </div>
    </>
  );
}
