"use client";

import { useEffect, useRef, useState } from "react";
import { LOCALES } from "@/lib/i18n/locales";
import { useLang } from "./LanguageProvider";

const SHORT: Record<string, string> = {
  en: "E",
  ko: "KR",
  ar: "AR",
  zh: "ZH",
  ja: "JA",
  ru: "RU",
  fil: "FIL",
  de: "DE",
  fr: "FR",
  es: "ES",
};

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLang();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className={`lang-switch ${compact ? "compact" : ""}`} ref={box}>
      <button
        type="button"
        className="lang-current"
        aria-label={t("nav.language")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="lang-globe" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          />
        </svg>
        {SHORT[locale] || locale.toUpperCase()}
      </button>
      {open ? (
        <ul className="lang-menu" role="listbox">
          {LOCALES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === locale}
                className={l.code === locale ? "on" : ""}
                onClick={() => {
                  setLocale(l.code);
                  setOpen(false);
                }}
              >
                <b>{SHORT[l.code] || l.code.toUpperCase()}</b>
                <span>{l.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
