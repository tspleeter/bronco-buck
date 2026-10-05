"use client";

import Script from "next/script";
import {
  UMAMI_DOMAINS,
  UMAMI_SCRIPT_URL,
  UMAMI_WEBSITE_ID,
} from "@/lib/analytics-config";

/**
 * Umami page-view tracking (cookieless, no consent banner needed). Renders
 * nothing until UMAMI_WEBSITE_ID is set in analytics-config.ts. Page views —
 * including Next.js client-side route changes — are tracked automatically;
 * custom funnel events go through trackEvent() (src/lib/analytics.ts).
 */
export default function UmamiAnalytics() {
  if (!UMAMI_WEBSITE_ID) return null;

  return (
    <Script
      id="umami-analytics"
      src={UMAMI_SCRIPT_URL}
      data-website-id={UMAMI_WEBSITE_ID}
      data-domains={UMAMI_DOMAINS}
      strategy="afterInteractive"
    />
  );
}
