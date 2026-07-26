"use client";

import { useState } from "react";
import type { SavedBuild } from "@/types/saved-build";

// Reliable clipboard copy that also works on iOS Safari
// (mirrors the helper used in ShareModal).
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
  } catch {
    /* fall through */
  }
  try {
    navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through */
  }
  return false;
}

type ButtonState = "idle" | "loading" | "copied" | "error";

// Saved builds live only in this browser's localStorage, so a /saved/<id>
// URL can never resolve on another device. Sharing instead creates a real
// server-backed shared build and copies its /share/<id> link, which works
// cross-device.
export default function ShareSavedBuildButton({
  build,
  productSlug,
}: {
  build: SavedBuild;
  productSlug: string;
}) {
  const [state, setState] = useState<ButtonState>("idle");

  async function handleShare() {
    if (state === "loading") return;
    setState("loading");

    const shareId = crypto.randomUUID();
    try {
      const res = await fetch("/api/shared-builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shareId,
          buildName: build.buildName,
          productId: build.productId,
          productSlug,
          productName: build.productName,
          selectedOptions: build.selectedOptions,
          customFields: build.customFields,
          price: build.price,
          createdAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) {
        setState("error");
        setTimeout(() => setState("idle"), 2500);
        return;
      }
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2500);
      return;
    }

    const url = `${window.location.origin}/share/${shareId}`;
    copyToClipboard(url);
    setState("copied");
    setTimeout(() => setState("idle"), 2500);
  }

  const label =
    state === "loading"
      ? "Creating link…"
      : state === "copied"
      ? "Share link copied!"
      : state === "error"
      ? "Couldn't create link"
      : "Share Build";

  const active = state === "copied";

  return (
    <button
      onClick={handleShare}
      disabled={state === "loading"}
      style={{
        width: "100%",
        borderRadius: 12,
        border: active ? "1px solid #111" : "1px solid #ddd",
        padding: "12px 16px",
        fontWeight: 600,
        fontSize: 14,
        background: active ? "#111" : "#fff",
        color: active ? "#fff" : "#111",
        cursor: state === "loading" ? "default" : "pointer",
        opacity: state === "loading" ? 0.7 : 1,
        transition: "background 0.2s, color 0.2s",
      }}
    >
      {label}
    </button>
  );
}
