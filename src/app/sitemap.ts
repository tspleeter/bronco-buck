import type { MetadataRoute } from "next";
import { SITE_URL, PRODUCT_PATH } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" | "yearly") => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1.0, "weekly"),
    page(PRODUCT_PATH, 0.9, "weekly"),
    page("/gifts-for-bronco-owners", 0.9, "weekly"),
    page("/gallery", 0.8, "monthly"),
    page("/policies", 0.4, "yearly"),
    page("/policies/privacy", 0.2, "yearly"),
    page("/policies/terms", 0.2, "yearly"),
  ];
}
