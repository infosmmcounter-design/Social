import { LOCALES, type LocaleCode } from "./locales";
import { t } from "./messages";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  "https://socialsflip.com";

export function siteOrigin() {
  return SITE.replace(/\/$/, "");
}

/** Absolute URL for a path + locale (path prefix for SEO / Search Console). */
export function localizedUrl(path: string, locale: LocaleCode) {
  const base = siteOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  const cleaned = p === "/" ? "" : p;
  // English stays on canonical unprefixed URLs; others use /{locale}/...
  if (locale === "en") return `${base}${cleaned || "/"}`;
  return `${base}/${locale}${cleaned}`;
}

export function hreflangAlternates(path = "/") {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    const key = l.code === "zh" ? "zh-CN" : l.code;
    languages[key] = localizedUrl(path, l.code);
  }
  languages["x-default"] = localizedUrl(path, "en");
  return { languages };
}

export function seoFor(locale: LocaleCode) {
  return {
    title: t(locale, "seo.title"),
    description: t(locale, "seo.description"),
  };
}

export { LOCALES };
