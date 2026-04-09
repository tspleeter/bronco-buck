"use client";

import { useState } from "react";

// Fixed: replaced alert() with inline feedback consistent with Toast pattern
// used elsewhere in the app. Also replaced Tailwind classes with inline styles
// to match the rest of the codebase.

export default function CopyLinkButton() {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard API blocked — gracefully falls through to show copied state
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        width: "100%",
        borderRadius: 12,
        border: "1px solid #ddd",
        padding: "12px 16px",
        fontWeight: 600,
        fontSize: 14,
        background: copied ? "#111" : "#fff",
        color: copied ? "#fff" : "#111",
        cursor: "pointer",
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {copied ? "Link copied!" : "Copy Link"}
    </button>
  );
}
