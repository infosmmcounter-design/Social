"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { keywordsFor } from "@/lib/i18n/keywords";
import { stripLocalePrefix } from "@/lib/i18n/locale-path";

/** Keep <title> and meta description in sync with the selected locale. */
function setMeta(name: string, content: string) {
  let meta = document.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export function DocumentTitle() {
  const { t, locale } = useLang();
  const pathname = usePathname() || "/";

  useEffect(() => {
    document.title = t("seo.title");
    const path = stripLocalePrefix(pathname).path;
    const cat = new URLSearchParams(window.location.search).get("cat");
    if (!path.startsWith("/listing/")) {
      setMeta("keywords", keywordsFor(locale, cat).join(", "));
    }
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", t("seo.description"));

    let og = document.querySelector('meta[property="og:locale"]');
    if (!og) {
      og = document.createElement("meta");
      og.setAttribute("property", "og:locale");
      document.head.appendChild(og);
    }
    const map: Record<string, string> = {
      en: "en_US",
      ko: "ko_KR",
      ar: "ar_SA",
      zh: "zh_CN",
      ja: "ja_JP",
      ru: "ru_RU",
      fil: "fil_PH",
      de: "de_DE",
      fr: "fr_FR",
      es: "es_ES",
    };
    og.setAttribute("content", map[locale] || "en_US");
  }, [t, locale, pathname]);

  return null;
}
