"use client";

import { META_PIXEL_ID } from "./meta-config";

// Minimal fbq typing so we can call the global pixel safely from TS.
type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/**
 * Fire a Meta Pixel standard event, safely.
 *
 * No-ops when the pixel isn't configured (META_PIXEL_ID empty), on the server,
 * or when fbq hasn't loaded (ad-blocker, script not yet ready). For Purchase,
 * pass { eventID: order.orderId } so the browser event deduplicates against the
 * server-side Conversions API event that carries the same event_id.
 */
export function trackPixel(
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string }
): void {
  if (typeof window === "undefined") return;
  if (!META_PIXEL_ID) return;

  const fbq = window.fbq;
  if (typeof fbq !== "function") return;

  try {
    if (options?.eventID) {
      fbq("track", event, params ?? {}, { eventID: options.eventID });
    } else {
      fbq("track", event, params ?? {});
    }
  } catch {
    /* analytics must never break the page */
  }
}
