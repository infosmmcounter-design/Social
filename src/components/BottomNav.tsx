"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { StartEscrowChat } from "./StartEscrowChat";
import { useAuth } from "./AuthProvider";
import { api } from "@/lib/api";
import { stripLocalePrefix } from "@/lib/i18n/locale-path";
import type { MsgKey } from "@/lib/i18n/messages";

type ChatRow = {
  id: number;
  kind?: string;
  subject: string;
  sellerName?: string;
  lastMsg?: { text: string } | null;
};

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
  const { user } = useAuth();
  const [chatOpen, setChatOpen] = useState(false);
  const [chats, setChats] = useState<ChatRow[]>([]);

  useEffect(() => {
    if (!chatOpen) return;
    const q = user?.role === "admin" ? "?scope=admin" : "";
    api<{ inquiries: ChatRow[] }>(`/api/inquiries${q}`)
      .then((d) => setChats(d.inquiries || []))
      .catch(() => setChats([]));
  }, [chatOpen, user]);

  if (path.startsWith("/admin") || rawPath.includes("/admin")) return null;

  const chatOn = chatOpen || path.startsWith("/chat") || path.startsWith("/chats") || path.startsWith("/help");

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
      {chatOpen ? (
        <div className="chat-dock" role="dialog" aria-label={t("nav.chats")}>
          <div className="chat-dock-panel">
            <div className="chat-dock-head">
              <div>
                <strong>{t("nav.chats")}</strong>
                <p className="sm mut" style={{ margin: 0 }}>
                  {t("chat.private")}
                </p>
              </div>
              <button type="button" className="chat-dock-x" onClick={() => setChatOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            <div className="chat-dock-list">
              {chats.length ? (
                chats.slice(0, 6).map((c) => (
                  <Link
                    key={c.id}
                    href={`/chat/${c.id}`}
                    className="chat-dock-row"
                    onClick={() => setChatOpen(false)}
                  >
                    <strong>{c.kind === "escrow" ? t("chat.withEscrow") : c.sellerName || c.subject}</strong>
                    <span className="sm mut">
                      {c.lastMsg?.text || c.subject}
                    </span>
                  </Link>
                ))
              ) : (
                <p className="sm mut" style={{ margin: "8px 0 12px" }}>
                  {t("chat.empty")}
                </p>
              )}
            </div>
            <StartEscrowChat compact />
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
        {LEFT.map((n) => link(n))}
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
        {link(
          {
            href: "/apply",
            labelKey: "nav.sell",
            d: '<path d="M12 5v14M5 12h14"/>',
          },
          true
        )}
        {link({
          href: "/deals",
          labelKey: "nav.deals",
          d: '<path d="M8 7h8M7 12h10M8 17h8"/><path d="M4 5h16v14H4z"/>',
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
