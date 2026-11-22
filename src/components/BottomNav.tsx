"use client";

import { usePathname } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { stripLocalePrefix } from "@/lib/i18n/locale-path";
import type { MsgKey } from "@/lib/i18n/messages";

const NAV: { href: string; labelKey: MsgKey; sell?: boolean; d: string }[] = [
  {
    href: "/",
    labelKey: "nav.home",
    d: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  },
  {
    href: "/listings",
    labelKey: "nav.listings",
    d: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  },
  {
    href: "/apply",
    labelKey: "nav.sell",
    sell: true,
    d: '<path d="M12 5v14M5 12h14"/>',
  },
  {
    href: "/chats",
    labelKey: "nav.chats",
    d: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  },
  {
    href: "/orders",
    labelKey: "nav.orders",
    d: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  },
  {
    href: "/blog",
    labelKey: "nav.blog",
    d: '<path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3z"/><path d="M9 8h6M9 12h6"/>',
  },
];

export function BottomNav() {
  const rawPath = usePathname() || "/";
  const path = stripLocalePrefix(rawPath).path;
  const { t } = useLang();
  if (path.startsWith("/admin") || rawPath.includes("/admin")) return null;

  return (
    <nav className="bn" aria-label="Main">
      {NAV.map((n) => {
        const on =
          n.href === "/"
            ? path === "/"
            : path === n.href || path.startsWith(n.href + "/");
        return (
          <Link
            key={n.href}
            href={n.href}
            className={`${on ? "on" : ""} ${n.sell ? "sell" : ""}`}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
              <g dangerouslySetInnerHTML={{ __html: n.d }} />
            </svg>
            {t(n.labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}
