// Umami (cookieless web analytics) configuration.
//
// UMAMI_WEBSITE_ID is NOT secret — it's visible in the browser script tag — so
// it lives here as a plain constant (same pattern as META_PIXEL_ID in
// meta-config.ts; NEXT_PUBLIC_ vars don't reliably reach the Amplify SSR build).
//
// ACTIVATION (Todd):
//   1. Create the site at https://cloud.umami.is (domain: www.buckthatduck.com).
//   2. Paste its Website ID below and push to main.
//   3. Exclude your own visits: in your browser console on the live site run
//        localStorage.setItem("umami.disabled", "1")
//
// Until UMAMI_WEBSITE_ID is set, the script renders nothing and every
// trackEvent() call no-ops — this integration deploys INERT.

export const UMAMI_WEBSITE_ID = "";

export const UMAMI_SCRIPT_URL = "https://cloud.umami.is/script.js";

// Only count traffic on the production hostnames — keeps test.buckthatduck.com,
// the amplifyapp.com URLs, and localhost out of the numbers.
export const UMAMI_DOMAINS = "buckthatduck.com,www.buckthatduck.com";

export const umamiEnabled = (): boolean => UMAMI_WEBSITE_ID.length > 0;
