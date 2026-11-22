"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeMeta,
  type LocaleCode,
} from "@/lib/i18n/locales";
import { t as translate, type MsgKey } from "@/lib/i18n/messages";
import {
  stripLocalePrefix,
  withLocalePrefix,
} from "@/lib/i18n/locale-path";

const STORAGE_KEY = "sf_locale";

type LangCtx = {
  locale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: MsgKey) => string;
  dir: "ltr" | "rtl";
};

const Ctx = createContext<LangCtx | null>(null);

function detectInitial(pathname: string): LocaleCode {
  const fromPath = stripLocalePrefix(pathname).locale;
  if (fromPath) return fromPath;
  if (typeof window !== "undefined") {
    try {
      const q = new URLSearchParams(window.location.search).get("lang") || "";
      if (isLocale(q)) return q;
      const saved = localStorage.getItem(STORAGE_KEY) || "";
      if (isLocale(saved)) return saved;
      const nav = (navigator.language || "en").toLowerCase();
      const short = nav.split("-")[0];
      if (short === "zh") return "zh";
      if (isLocale(short)) return short as LocaleCode;
    } catch {
      /* ignore */
    }
  }
  return DEFAULT_LOCALE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const [locale, setLocaleState] = useState<LocaleCode>(() =>
    detectInitial(pathname)
  );

  // Sync when URL path locale changes (back/forward, shared links)
  useEffect(() => {
    const fromPath = stripLocalePrefix(pathname).locale;
    if (fromPath && fromPath !== locale) setLocaleState(fromPath);
  }, [pathname, locale]);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : locale;
    document.documentElement.dir = localeMeta(locale).dir;
    try {
      localStorage.setItem(STORAGE_KEY, locale);
      document.cookie = `sf_locale=${locale};path=/;max-age=31536000;samesite=lax`;
    } catch {
      /* ignore */
    }
  }, [locale]);

  const setLocale = useCallback(
    (code: LocaleCode) => {
      setLocaleState(code);
      try {
        localStorage.setItem(STORAGE_KEY, code);
        document.cookie = `sf_locale=${code};path=/;max-age=31536000;samesite=lax`;
      } catch {
        /* ignore */
      }
      const next = withLocalePrefix(pathname, code);
      if (next !== pathname) router.push(next);
    },
    [pathname, router]
  );

  const value = useMemo<LangCtx>(
    () => ({
      locale,
      setLocale,
      t: (key) => translate(locale, key),
      dir: localeMeta(locale).dir,
    }),
    [locale, setLocale]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useLang() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}
