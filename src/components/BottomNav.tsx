"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { StartEscrowChat } from "./StartEscrowChat";
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
];

const ORDERS = {
  href: "/orders",
  labelKey: "nav.orders" as MsgKey,
  d: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
};

export function BottomNav() {
  const rawPath = usePathname() || "/";
  const path = stripLocalePrefix(rawPath).path;
  const { t } = useLang();
  const [chatOpen, setChatOpen] = useState(false);
  if (path.startsWith("/admin") || rawPath.includes("/admin")) return null;

  const chatOn = chatOpen || path.startsWith("/chat") || path.startsWith("/chats") || path.startsWith("/help");

  function item(n: (typeof NAV)[number]) {
    const on =
      n.href === "/"
        ? path === "/"
        : path === n.href || path.startsWith(n.href + "/");
    return (
      <Link key={n.href} href={n.href} className={`${on ? "on" : ""} ${n.sell ? "sell" : ""}`}>
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
          <g dangerouslySetInnerHTML={{ __html: n.d }} />
        </svg>
        {t(n.labelKey)}
      </Link>
    );
  }

  return (
    <>
      {chatOpen ? (
        <div className="chat-dock" role="dialog" aria-label={t("chat.withEscrow")}>
          <div className="chat-dock-panel">
            <div className="chat-dock-head">
              <strong>{t("chat.withEscrow")}</strong>
              <button type="button" className="chat-dock-x" onClick={() => setChatOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <StartEscrowChat compact autoOpen />
            <p className="sm chat-dock-links">
              <Link href="/chats" onClick={() => setChatOpen(false)}>
                {t("chat.myChats")}
              </Link>
              <Link href="/help" onClick={() => setChatOpen(false)}>
                {t("nav.help")}
              </Link>
            </p>
          </div>
        </div>
      ) : null}
      <nav className="bn" aria-label="Main">
        {NAV.map(item)}
        <button
          type="button"
          className={`bn-item ${chatOn ? "on" : ""}`}
          aria-expanded={chatOpen}
          onClick={() => setChatOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {t("nav.chats")}
        </button>
        <Link
          href={ORDERS.href}
          className={path === ORDERS.href || path.startsWith(ORDERS.href + "/") ? "on" : ""}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
            <g dangerouslySetInnerHTML={{ __html: ORDERS.d }} />
          </svg>
          {t(ORDERS.labelKey)}
        </Link>
      </nav>
    </>
  );
}
