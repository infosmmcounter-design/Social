"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALES } from "@/lib/i18n/locales";
import { stripLocalePrefix, withLocalePrefix } from "@/lib/i18n/locale-path";
import { useLang } from "./LanguageProvider";

/** Inject hreflang alternates using locale path prefixes for Search Console. */
export function HreflangTags() {
  const pathname = usePathname() || "/";
  const { locale } = useLang();

  useEffect(() => {
    const head = document.head;
    head
      .querySelectorAll('link[data-sf-hreflang="1"]')
      .forEach((n) => n.remove());

    const origin = window.location.origin;
    const { path } = stripLocalePrefix(pathname);

    const add = (hreflang: string, href: string) => {
      const link = document.createElement("link");
      link.rel = "alternate";
      link.hreflang = hreflang;
      link.href = href;
      link.setAttribute("data-sf-hreflang", "1");
      head.appendChild(link);
    };

    for (const l of LOCALES) {
      add(
        l.code === "zh" ? "zh-CN" : l.code,
        `${origin}${withLocalePrefix(path, l.code)}`
      );
    }
    add("x-default", `${origin}${withLocalePrefix(path, "en")}`);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
  }, [pathname, locale]);

  return null;
}
