export const LOCALES = [
  { code: "en", name: "English", native: "English", dir: "ltr" as const },
  { code: "ko", name: "Korean", native: "한국어", dir: "ltr" as const },
  { code: "ar", name: "Arabic", native: "العربية", dir: "rtl" as const },
  { code: "zh", name: "Chinese", native: "中文", dir: "ltr" as const },
  { code: "ja", name: "Japanese", native: "日本語", dir: "ltr" as const },
  { code: "ru", name: "Russian", native: "Русский", dir: "ltr" as const },
  { code: "fil", name: "Filipino", native: "Filipino", dir: "ltr" as const },
  { code: "de", name: "German", native: "Deutsch", dir: "ltr" as const },
  { code: "fr", name: "French", native: "Français", dir: "ltr" as const },
  { code: "es", name: "Spanish", native: "Español", dir: "ltr" as const },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";
export const LOCALE_CODES = LOCALES.map((l) => l.code);

export function isLocale(v: string): v is LocaleCode {
  return (LOCALE_CODES as string[]).includes(v);
}

export function localeMeta(code: LocaleCode) {
  return LOCALES.find((l) => l.code === code) || LOCALES[0];
}
