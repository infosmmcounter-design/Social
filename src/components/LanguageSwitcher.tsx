"use client";

import { LOCALES } from "@/lib/i18n/locales";
import { useLang } from "./LanguageProvider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLang();

  return (
    <label className={`lang-switch ${compact ? "compact" : ""}`}>
      {!compact ? (
        <span className="lang-switch-label">{t("nav.language")}</span>
      ) : null}
      <select
        aria-label={t("nav.language")}
        value={locale}
        onChange={(e) => setLocale(e.target.value as typeof locale)}
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
}
