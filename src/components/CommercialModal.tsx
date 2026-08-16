"use client";

import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Reusable modal video player for the Buck That Duck commercial spot.
 * Shared by `SeeCommercialButton` (user-initiated) and `CommercialIntro`
 * (auto-opens on a visitor's first arrival).
 *
 * Video asset: /public/assets/buck-commercial.mp4 (poster: buck-commercial-poster.jpg)
 *
 * Autoplay note: on the auto-intro there is no user gesture, so a browser will
 * block play() while the audio is on. We try unmuted first, and on rejection
 * mute + retry so the spot always starts moving; `controls` lets them unmute.
 */
export default function CommercialModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const close = useCallback(() => onClose(), [onClose]);

  // Escape to close + lock body scroll while the modal is open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, close]);

  // Start playback when the player opens; fall back to muted if the browser
  // blocks sound-on autoplay (no user gesture on the first-visit intro).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (open) {
      v.currentTime = 0;
      v.muted = false;
      const attempt = v.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(() => {
          v.muted = true;
          const retry = v.play();
          if (retry && typeof retry.catch === "function") retry.catch(() => {});
        });
      }
    } else {
      // Pause + rewind + restore sound when closing so audio never keeps
      // playing behind the scenes and the next open starts unmuted.
      v.pause();
      v.currentTime = 0;
      v.muted = false;
    }
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div
      onClick={close}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Dialog — centered with flexbox, NOT position:fixed + transform.
          A transformed fixed ancestor makes Safari promote the <video> to
          its own layer and mis-place it (it jumps to the top of the screen).
          stopPropagation keeps clicks on the video controls from closing. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Buck That Duck commercial"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#1C1917",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "18px",
          width: "min(920px, 94vw)",
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(202,138,4,0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingLeft: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              aria-hidden="true"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: "var(--color-gold-dim)",
                color: "var(--color-gold)",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            <h2
              style={{
                fontWeight: 800,
                fontSize: "1.05rem",
                color: "#fafaf9",
                letterSpacing: "-0.01em",
              }}
            >
              Buck That Duck — Commercial
            </h2>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "none",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#a8a29e",
              flexShrink: 0,
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Video */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 9",
            borderRadius: 12,
            overflow: "hidden",
            background: "#000",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <video
            ref={videoRef}
            controls
            autoPlay
            playsInline
            {...{ "webkit-playsinline": "true" }}
            preload="metadata"
            poster="/assets/buck-commercial-poster.jpg"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "contain",
              background: "#000",
            }}
          >
            <source src="/assets/buck-commercial.mp4" type="video/mp4" />
            Your browser doesn&apos;t support embedded video. You can{" "}
            <a href="/assets/buck-commercial.mp4">download the commercial</a> instead.
          </video>
        </div>
      </div>
    </div>,
    document.body
  );
}
