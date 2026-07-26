"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * "See commercial" CTA. When `floating`, it pins itself at the top of the
 * viewport (rendered globally in the layout so it shows on every page).
 * Opens a modal video player for the Buck That Duck commercial spot.
 * Video asset: /public/assets/buck-commercial.mp4 (poster: buck-commercial-poster.jpg)
 */
export default function SeeCommercialButton({ floating = false }: { floating?: boolean }) {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const close = useCallback(() => setOpen(false), []);

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

  // Try to start playback as soon as the player opens; browsers may keep it
  // paused on the poster until the user hits play, which is fine (controls show).
  useEffect(() => {
    if (open && videoRef.current) {
      const v = videoRef.current;
      v.currentTime = 0;
      const p = v.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
    // Pause + rewind when closing so audio never keeps playing behind the scenes
    if (!open && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={"see-commercial-btn" + (floating ? " see-commercial-btn--floating" : "")}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-label="See the Buck That Duck commercial"
      >
        <span className="see-commercial-btn__icon" aria-hidden="true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="see-commercial-btn__label">See commercial</span>
      </button>

      {open && (
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
        </div>
      )}
    </>
  );
}
