import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = [
  "en",
  "ko",
  "ar",
  "zh",
  "ja",
  "ru",
  "fil",
  "de",
  "fr",
  "es",
] as const;

const LOCALE_SET = new Set<string>(LOCALES);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Never touch internals / API / static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.match(/\.(zip|png|jpg|jpeg|gif|webp|svg|ico|txt|xml|json|js|css|map|woff2?)$/i)
  ) {
    return NextResponse.next();
  }

  const seg = pathname.split("/").filter(Boolean)[0] || "";

  // /ko/... → rewrite to /... with lang (browser URL keeps /ko for SEO)
  if (LOCALE_SET.has(seg) && seg !== "en") {
    const rest = pathname.slice(seg.length + 1) || "/";
    const url = req.nextUrl.clone();
    url.pathname = rest.startsWith("/") ? rest : `/${rest}`;
    if (!url.pathname) url.pathname = "/";
    url.searchParams.set("lang", seg);
    const res = NextResponse.rewrite(url);
    res.cookies.set("sf_locale", seg, { path: "/", sameSite: "lax", maxAge: 31536000 });
    res.headers.set("x-sf-locale", seg);
    return res;
  }

  // Bare English paths: set cookie if query has lang=en, otherwise leave alone.
  // Do NOT auto-redirect bare paths to /{locale} — that caused flicker/500 races.
  const qLang = req.nextUrl.searchParams.get("lang") || "";
  if (LOCALE_SET.has(qLang)) {
    const res = NextResponse.next();
    res.cookies.set("sf_locale", qLang, {
      path: "/",
      sameSite: "lax",
      maxAge: 31536000,
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
