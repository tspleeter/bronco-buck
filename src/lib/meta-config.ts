// Meta (Facebook) Pixel + Conversions API configuration.
//
// META_PIXEL_ID is NOT secret — it's exposed in the browser pixel snippet —
// so it lives here as a plain constant (same pattern as the hardcoded Stripe
// publishable key in checkout/page.tsx, which NEXT_PUBLIC_ can't reliably
// deliver to the SSR build on Amplify). The Conversions API access token IS
// secret and is read server-side from SSM at META_CAPI_TOKEN_PARAM.
//
// ACTIVATION (Todd):
//   1. Set META_PIXEL_ID below to your Pixel / Dataset ID (Events Manager).
//   2. Put the CAPI access token (System User token) in SSM at the path below,
//      as a SecureString, reachable by the bronco-buck-compute-role.
//
// Until META_PIXEL_ID is set: the base pixel renders nothing and every client
// event no-ops. Until the SSM token is set: the server CAPI call no-ops.
// So this integration deploys completely INERT and turns on when both are set.

export const META_PIXEL_ID = "";

// SSM Parameter Store path holding the Meta Conversions API access token.
// Read server-side only (see meta-capi.ts).
export const META_CAPI_TOKEN_PARAM = "/bronco-buck/meta-capi-token";

// Graph API version used for Conversions API calls.
export const META_GRAPH_VERSION = "v21.0";

export const metaPixelEnabled = (): boolean => META_PIXEL_ID.length > 0;
