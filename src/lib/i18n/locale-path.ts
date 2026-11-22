import { isLocale, type LocaleCode } from "./locales";

/** Strip a leading /{locale} prefix if present. */
export function stripLocalePrefix(pathname: string): {
  locale: LocaleCode | null;
  path: string;
} {
  const [pathOnly, qs] = pathname.split("?");
  const hashIdx = (pathOnly || "/").indexOf("#");
  const cleanPath =
    hashIdx >= 0 ? (pathOnly || "/").slice(0, hashIdx) : pathOnly || "/";
  const parts = cleanPath.split("/").filter(Boolean);
  const first = parts[0] || "";
  if (isLocale(first)) {
    const rest = "/" + parts.slice(1).join("/");
    const base = rest === "/" ? "/" : rest.replace(/\/$/, "") || "/";
    return { locale: first, path: qs ? `${base}?${qs}` : base };
  }
  return { locale: null, path: pathname || "/" };
}

/** Build a locale-prefixed path (en stays unprefixed). Preserves ?query and #hash. */
export function withLocalePrefix(pathname: string, locale: LocaleCode): string {
  const hashIdx = pathname.indexOf("#");
  const hash = hashIdx >= 0 ? pathname.slice(hashIdx) : "";
  const withoutHash = hashIdx >= 0 ? pathname.slice(0, hashIdx) : pathname;
  const [rawPath, qs] = withoutHash.split("?");
  const { path } = stripLocalePrefix(rawPath || "/");
  const clean = path === "/" ? "" : path;
  const prefixed =
    locale === "en" ? clean || "/" : `/${locale}${clean}`;
  const withQs = qs ? `${prefixed}?${qs}` : prefixed;
  return withQs + hash;
}
