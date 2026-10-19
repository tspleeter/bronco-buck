"use client";

import { useEffect } from "react";
import Script from "next/script";
import { INSTAGRAM_POSTS, INSTAGRAM_URL } from "@/lib/instagram";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

function processEmbeds() {
  try {
    window.instgrm?.Embeds.process();
  } catch {
    /* embed script blocked or not loaded — blockquote fallback links remain */
  }
}

export function InstagramFeed() {
  // Re-process on client navigation back to the page (script already loaded).
  useEffect(() => {
    processEmbeds();
  }, []);

  if (INSTAGRAM_POSTS.length === 0) return null;

  return (
    <section aria-labelledby="instagram-heading" style={{ marginTop: "48px" }}>
      <style>{`
        .ig-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          justify-items: center;
          align-items: start;
        }
        .ig-grid .instagram-media {
          margin: 0 !important;
          min-width: 0 !important;
          width: 100% !important;
          max-width: 400px !important;
          border-radius: var(--radius-lg, 12px) !important;
        }
        .ig-fallback {
          display: block;
          padding: 24px;
          text-align: center;
          color: var(--color-gold);
          text-decoration: none;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg, 12px);
          background: #1C1917;
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <h2 id="instagram-heading" style={{ margin: 0 }}>
          On Instagram
        </h2>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-umami-event="instagram_click"
          data-umami-event-location="home_feed"
          style={{ color: "var(--color-gold)", textDecoration: "none", fontWeight: 600 }}
        >
          Follow @buckthatduck →
        </a>
      </div>

      <div className="ig-grid">
        {INSTAGRAM_POSTS.map((url) => (
          <blockquote
            key={url}
            className="instagram-media"
            data-instgrm-permalink={`${url}?utm_source=ig_embed`}
            data-instgrm-version="14"
          >
            <a className="ig-fallback" href={url} target="_blank" rel="noopener noreferrer">
              Watch on Instagram
            </a>
          </blockquote>
        ))}
      </div>

      <Script
        src="https://www.instagram.com/embed.js"
        strategy="lazyOnload"
        onLoad={processEmbeds}
      />
    </section>
  );
}
