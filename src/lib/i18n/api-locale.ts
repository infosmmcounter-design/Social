import { parseLocaleParam } from "./content";
import type { LocaleCode } from "./locales";

/** Read locale from request URL (?lang=) or cookie. */
export function localeFromRequest(req: Request): LocaleCode {
  const url = new URL(req.url);
  const q = url.searchParams.get("lang");
  if (q) return parseLocaleParam(q);
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/(?:^|;\s*)sf_locale=([a-z-]+)/i);
  if (m) return parseLocaleParam(m[1]);
  return "en";
}
