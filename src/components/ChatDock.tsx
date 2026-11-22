"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { StartEscrowChat } from "./StartEscrowChat";
import { stripLocalePrefix } from "@/lib/i18n/locale-path";

type ChatRow = {
  id: number;
  kind?: string;
  subject: string;
  sellerName?: string;
  lastMsg?: { text: string } | null;
};

export const OPEN_CHAT_EVENT = "sf-open-chat";

/** Round chat button fixed on the side. Stays on screen while the page scrolls. */
export function ChatDock() {
  const raw = usePathname() || "/";
  const path = stripLocalePrefix(raw).path;
  const { t } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [chats, setChats] = useState<ChatRow[]>([]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest(".chat-dock") || el.closest(".chat-fab")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    window.addEventListener(OPEN_CHAT_EVENT, toggle);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, toggle);
  }, []);

  useEffect(() => {
    if (!open) return;
    const q = user?.role === "admin" ? "?scope=admin" : "";
    api<{ inquiries: ChatRow[] }>(`/api/inquiries${q}`)
      .then((d) => setChats(d.inquiries || []))
      .catch(() => setChats([]));
  }, [open, user]);

  if (path.startsWith("/admin")) return null;

  return (
    <>
      {open ? (
        <div className="chat-dock" role="dialog" aria-label={t("nav.chats")}>
          <div className="chat-dock-panel">
            <div className="chat-dock-head">
              <div>
                <strong>{t("nav.chats")}</strong>
                <p className="sm mut" style={{ margin: 0 }}>
                  {t("chat.private")}
                </p>
              </div>
              <button type="button" className="chat-dock-x" onClick={() => setOpen(false)} aria-label="Close">
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
                    onClick={() => setOpen(false)}
                  >
                    <strong>
                      {c.kind === "escrow" ? t("chat.withEscrow") : c.sellerName || c.subject}
                    </strong>
                    <span className="sm mut">{c.lastMsg?.text || c.subject}</span>
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
              <Link href="/chats" onClick={() => setOpen(false)}>
                {t("chat.myChats")}
              </Link>
              <Link href="/help" onClick={() => setOpen(false)}>
                {t("nav.help")}
              </Link>
            </p>
          </div>
        </div>
      ) : null}
      <button
        type="button"
        className={`chat-fab ${open ? "on" : ""}`}
        aria-expanded={open}
        aria-label={t("chat.fab")}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden>
          <path
            d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </>
  );
}
