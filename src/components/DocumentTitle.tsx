"use client";

import { useEffect } from "react";
import { useLang } from "./LanguageProvider";

/** Keep <title> and meta description in sync with the selected locale. */
export function DocumentTitle() {
  const { t, locale } = useLang();

  useEffect(() => {
    document.title = t("seo.title");
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
  }, [t, locale]);

  return null;
}
