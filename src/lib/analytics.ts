"use client";

// Minimal Umami typing so we can call the global tracker safely from TS.
type UmamiData = Record<string, string | number | boolean>;
declare global {
  interface Window {
    umami?: { track: (event: string, data?: UmamiData) => void };
  }
}

/**
 * Fire an Umami custom event. Safe no-op on the server, when Umami isn't
 * configured, or when the script is blocked / not yet loaded.
 *
 * Funnel events used on the site:
 *   builder_open → add_to_cart → checkout_start → purchase  (+ share_build)
 */
export function trackEvent(event: string, data?: UmamiData): void {
  if (typeof window === "undefined") return;
  try {
    window.umami?.track(event, data);
  } catch {
    // never let analytics break the page
  }
}
