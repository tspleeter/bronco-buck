import type { NextConfig } from "next";

// Amplify sets AWS_BRANCH at build time (it does NOT reach the SSR runtime),
// so bake the Stripe mode into both bundles here. Only the `test` branch
// (test.buckthatduck.com) runs Stripe in test mode; everything else stays live.
const nextConfig: NextConfig = {
  env: {
    STRIPE_MODE: process.env.AWS_BRANCH === "test" ? "test" : "live",
  },
};

export default nextConfig;
