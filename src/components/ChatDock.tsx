"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { stripLocalePrefix } from "@/lib/i18n/locale-path";

type Msg = { id: number; from: string; text: string; createdAt: string };
type Thread = {
  id: number;
  kind?: string;
  subject: string;
  buyerName?: string;
  buyerEmail?: string;
  sellerName?: string;
  msgs?: Msg[];
  lastMsg?: { text: string } | null;
};

export const OPEN_CHAT_EVENT = "sf-open-chat";

/** Side chat opens straight into the Escrow conversation, not a tiny picker. */
export function ChatDock() {
  const raw = usePathname() || "/";
  const path = stripLocalePrefix(raw).path;
  const { t } = useLang();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [thread, setThread] = useState<Thread | null>(null);
  const [others, setOthers] = useState<Thread[]>([]);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;
      if (el.closest(".chat-dock") || el.closest(".chat-fab") || el.closest(".bn-item")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    const openNow = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, openNow);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, openNow);
  }, []);

  async function loadThread(id: number, forEmail?: string) {
    const q = forEmail ? `&email=${encodeURIComponent(forEmail)}` : "";
    const d = await api<{ inquiry: Thread }>(`/api/inquiries?id=${id}${q}`);
    setThread(d.inquiry);
  }

  useEffect(() => {
    if (!open || path.startsWith("/admin")) return;
    let stop = false;
    (async () => {
      setErr("");
      try {
        if (user?.role === "admin") {
          const d = await api<{ inquiries: Thread[] }>("/api/inquiries?scope=admin");
          if (stop) return;
          const list = d.inquiries || [];
          setOthers(list);
          if (list[0]) await loadThread(list[0].id);
          return;
        }
        const mail = (user?.email || email).trim();
        if (!mail) return;
        const res = await api<{ inquiry: { id: number } }>("/api/inquiries", {
          method: "POST",
          json: {
            kind: "escrow",
            name: user?.name || name || "Guest",
            email: mail,
            message: "",
            subject: "Chat with Escrow",
          },
        });
        if (stop) return;
        await loadThread(res.inquiry.id, mail);
        const list = await api<{ inquiries: Thread[] }>("/api/inquiries");
        if (!stop) setOthers(list.inquiries || []);
      } catch (e) {
        if (!stop) setErr(e instanceof Error ? e.message : "Failed");
      }
    })();
    return () => {
      stop = true;
    };
  }, [open, user, path]);

  useEffect(() => {
    if (!open || !thread?.id) return;
    const timer = setInterval(() => {
      loadThread(thread.id, email || user?.email || thread.buyerEmail).catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [open, thread?.id, email, user?.email]);

  async function beginGuest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await api<{ inquiry: { id: number } }>("/api/inquiries", {
        method: "POST",
        json: {
          kind: "escrow",
          name: name || "Guest",
          email,
          message: "",
          subject: "Chat with Escrow",
        },
      });
      await loadThread(res.inquiry.id, email);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!thread || !text.trim()) return;
    setErr("");
    try {
      await api(`/api/inquiries/${thread.id}/messages`, {
        method: "POST",
        json: { text, email: email || user?.email || thread.buyerEmail },
      });
      setText("");
      await loadThread(thread.id, email || user?.email || thread.buyerEmail);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    }
  }

  if (path.startsWith("/admin")) return null;

  const needsGate = open && !thread && user?.role !== "admin" && !(user?.email || "").trim();

  return (
    <>
      {open ? (
        <div className="chat-dock" role="dialog" aria-label={t("chat.withEscrow")}>
          <div className="chat-live">
            <div className="chat-live-head">
              <div>
                <strong>{t("chat.withEscrow")}</strong>
                <p>{t("chat.private")}</p>
              </div>
              <button type="button" className="chat-live-x" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>
            {others.length > 1 ? (
              <div className="chat-live-switch">
                {others.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={thread?.id === c.id ? "on" : ""}
                    onClick={() => loadThread(c.id, email || user?.email || c.buyerEmail)}
                  >
                    {c.kind === "escrow" ? t("chat.withEscrow") : c.sellerName || c.subject}
                  </button>
                ))}
              </div>
            ) : null}
            {needsGate || (!thread && !user) ? (
              <form className="chat-live-gate" onSubmit={beginGuest}>
                <p>{t("help.chatEscrowSub")}</p>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("listing.yourName")}
                  aria-label={t("listing.yourName")}
                  required
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t("listing.yourEmail")}
                  aria-label={t("listing.yourEmail")}
                  required
                />
                {err ? <p className="err">{err}</p> : null}
                <button className="btn" type="submit" disabled={busy}>
                  {busy ? "…" : t("help.startEscrowChat")}
                </button>
              </form>
            ) : (
              <>
                <div className="chat-live-log" role="log">
                  {(thread?.msgs || []).map((m) => (
                    <div key={m.id} className={`m ${m.from}`}>
                      <small>{m.from === "admin" ? "Escrow" : m.from === "buyer" ? thread?.buyerName || "You" : m.from}</small>
                      {m.text}
                    </div>
                  ))}
                  {!thread ? <p className="sm mut">…</p> : null}
                </div>
                {err ? <p className="err" style={{ margin: "0 12px" }}>{err}</p> : null}
                <form
                  className="chat-live-compose"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send();
                  }}
                >
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Message Escrow…"
                    aria-label="Message"
                  />
                  <button className="btn" type="submit">
                    Send
                  </button>
                </form>
              </>
            )}
            <p className="chat-live-links">
              <Link href="/chats" onClick={() => setOpen(false)}>
                {t("chat.myChats")}
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
