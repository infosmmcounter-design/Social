import type { MetadataRoute } from "next";
import { siteOrigin } from "@/lib/i18n/seo";

export default function robots(): MetadataRoute.Robots {
  const origin = siteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/listings/"],
        disallow: ["/admin", "/api/", "/dashboard/"],
      },
      {
        userAgent: "Googlebot-Image",
        allow: ["/", "/api/listings/"],
        disallow: ["/admin", "/dashboard/"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
