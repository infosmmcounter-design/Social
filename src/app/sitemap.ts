import type { MetadataRoute } from "next";
import { LOCALES } from "@/lib/i18n/locales";
import { localizedUrl, siteOrigin } from "@/lib/i18n/seo";
import { readStore } from "@/lib/db";

const PATHS = [
  "/",
  "/listings",
  "/listings?cat=youtube",
  "/listings?cat=facebook",
  "/listings?cat=instagram",
  "/listings?cat=tiktok",
  "/listings?cat=freelance",
  "/listings?cat=ai",
  "/listings?cat=x",
  "/create-deal",
  "/apply",
  "/blog",
  "/orders",
  "/help",
  "/privacy",
  "/terms",
  "/refund",
  "/escrow-fees",
  "/prohibited",
  "/about",
  "/contact",
  "/faq",
  "/scam-alerts",
  "/auth/login",
  "/auth/signup",
  "/auth/recover",
];

function alts(path: string) {
  return Object.fromEntries(
    LOCALES.map((l) => [
      l.code === "zh" ? "zh-CN" : l.code,
      localizedUrl(path, l.code),
    ])
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of PATHS) {
    for (const locale of LOCALES) {
      entries.push({
        url: localizedUrl(path, locale.code),
        lastModified: now,
        changeFrequency:
          path === "/" || path === "/listings" ? "daily" : "weekly",
        priority: path === "/" ? 1 : 0.7,
        alternates: { languages: alts(path) },
      });
    }
  }

  try {
    const store = await readStore();
    for (const l of store.listings.filter(
      (x) => x.listed && x.status === "approved"
    )) {
      const path = `/listing/${l.id}`;
      for (const locale of LOCALES) {
        entries.push({
          url: localizedUrl(path, locale.code),
          lastModified: now,
          changeFrequency: "daily",
          priority: 0.8,
          alternates: { languages: alts(path) },
        });
      }
    }
    for (const p of store.posts) {
      const path = `/blog/${p.id}`;
      for (const locale of LOCALES) {
        entries.push({
          url: localizedUrl(path, locale.code),
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.5,
          alternates: { languages: alts(path) },
        });
      }
    }
  } catch {
    /* store may be unavailable at build time */
  }

  for (const path of PATHS) {
    entries.push({
      url: `${siteOrigin()}${path === "/" ? "" : path}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: path === "/" ? 1 : 0.6,
    });
  }

  return entries;
}
