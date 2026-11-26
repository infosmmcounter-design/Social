"use client";

import { usePathname } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { ChatCountBadge, useUnreadChats } from "./useUnreadChats";
import { stripLocalePrefix } from "@/lib/i18n/locale-path";
import type { MsgKey } from "@/lib/i18n/messages";

const LEFT: { href: string; labelKey: MsgKey; d: string }[] = [
  {
    href: "/",
    labelKey: "nav.home",
    d: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  },
];

export function BottomNav() {
  const rawPath = usePathname() || "/";
  const path = stripLocalePrefix(rawPath).path;
  const { t } = useLang();
  const unread = useUnreadChats();

  if (path.startsWith("/admin") || rawPath.includes("/admin")) return null;

  const chatOn = path.startsWith("/chat");

  function link(n: { href: string; labelKey: MsgKey; d: string }, sell = false) {
    const on =
      n.href === "/"
        ? path === "/"
        : path === n.href || path.startsWith(n.href + "/");
    return (
      <Link key={n.href} href={n.href} className={`${on ? "on" : ""} ${sell ? "sell" : ""}`}>
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
          <g dangerouslySetInnerHTML={{ __html: n.d }} />
        </svg>
        {t(n.labelKey)}
      </Link>
    );
  }

  return (
    <>
      <nav className="bn" aria-label="Main">
        {LEFT.map((n) => link(n))}
        <Link href="/chats" className={chatOn ? "on" : ""}>
          <span className="bn-ico">
            <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <ChatCountBadge count={unread} />
          </span>
          {t("nav.chats")}
        </Link>
        {link(
          {
            href: "/dashboard/seller",
            labelKey: "nav.sell",
            d: '<path d="M12 5v14M5 12h14"/>',
          },
          true
        )}
        {link({
          href: "/deals",
          labelKey: "nav.deals",
          d: '<circle cx="12" cy="2.6" r="1.55"/><g transform="translate(0 4.2) scale(1 0.82)"><path d="m11 17 2 2a1 1 0 1 0 3-3"/><path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4"/><path d="m21 3 1 11h-2"/><path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3"/><path d="M3 4h8"/></g>',
        })}
        {link({
          href: "/account",
          labelKey: "nav.account",
          d: '<circle cx="12" cy="8" r="3.2"/><path d="M5 19c1.4-3 3.8-4.5 7-4.5S17.6 16 19 19"/>',
        })}
      </nav>
    </>
  );
}
