import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Keep admin, API, cart/checkout and per-user pages out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/orders",
        "/orders-login",
        "/discounts",
        "/cart",
        "/checkout",
        "/saved",
        "/share",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
