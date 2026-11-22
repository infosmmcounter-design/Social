import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/i18n/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/", "/dashboard/"],
    },
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
