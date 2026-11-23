"use client";

import { LOCALES } from "@/lib/i18n/locales";
import { useLang } from "./LanguageProvider";

function shortCode(code: string) {
  return code === "fil" ? "FIL" : code.toUpperCase();
}

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLang();

  return (
    <label className={`lang-switch ${compact ? "compact" : ""}`}>
      <svg className="lang-globe" width="16" height="16" viewBox="0 0 24 24" aria-hidden>
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          d="M3 12h18M12 3c2.5 2.8 3.8 5.8 3.8 9s-1.3 6.2-3.8 9c-2.5-2.8-3.8-5.8-3.8-9S9.5 5.8 12 3z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
      <select
        aria-label={t("nav.language")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {shortCode(l.code)}
          </option>
        ))}
      </select>
    </label>
  );
}
