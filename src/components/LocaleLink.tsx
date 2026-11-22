"use client";

import Link, { type LinkProps } from "next/link";
import type { ReactNode, AnchorHTMLAttributes } from "react";
import { useLang } from "./LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children?: ReactNode;
  };

/** Next Link that keeps the active language path prefix. */
export function LocaleLink({ href, children, ...rest }: Props) {
  const { locale } = useLang();
  const raw =
    typeof href === "string"
      ? href
      : href.pathname
        ? `${href.pathname}${href.search || ""}${href.hash || ""}`
        : "/";
  // External / hash-only / api — leave alone
  if (
    raw.startsWith("http") ||
    raw.startsWith("mailto:") ||
    raw.startsWith("#") ||
    raw.startsWith("/api")
  ) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  const localized = withLocalePrefix(raw, locale);
  return (
    <Link href={localized} {...rest}>
      {children}
    </Link>
  );
}
