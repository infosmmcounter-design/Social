"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { stripLocalePrefix } from "@/lib/i18n/locale-path";
import { CHATS_REFRESH_EVENT, ChatCountBadge, useUnreadChats } from "./useUnreadChats";
import { readGuestEmail, saveGuestEmail } from "@/lib/guest-email";

type Msg = { id: number; from: string; text: string; createdAt: string };
type Row = {
  source: "inquiry" | "deal";
  id: number;
  kind: "seller" | "escrow" | "deal";
  title: string;
  subject: string;
  preview: string;
  updatedAt: string;
  unread: number;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
};

export const OPEN_CHAT_EVENT = "sf-open-chat";
export const OPEN_ESCROW_EVENT = "sf-open-escrow";

function when(iso: string) {
  const t = new Date(iso).getTime();
  if (!t) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Chat opens on the conversation list. Escrow stays as its own row at the bottom. */
export function ChatDock() {
  const raw = usePathname() || "/";
  const path = stripLocalePrefix(raw).path;
  const { t } = useLang();
  const { user } = useAuth();
  const unread = useUnreadChats();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"list" | "room">("list");
  const [rows, setRows] = useState<Row[]>([]);
  const [active, setActive] = useState<Row | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [buyerName, setBuyerName] = useState("");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [openEscrow, setOpenEscrow] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      return;
    }
    const saved = readGuestEmail();
    if (saved) setEmail(saved);
  }, [user]);

  const loadList = useCallback(async (): Promise<Row[]> => {
    const mail = (user?.email || email).trim();
    if (!user && !mail) {
      setRows([]);
      return [];
    }
    const q = !user && mail ? `?email=${encodeURIComponent(mail)}` : "";
    const d = await api<{ chats: Row[] }>(`/api/chats${q}`);
    const chats = d.chats || [];
    setRows(chats);
    window.dispatchEvent(new Event(CHATS_REFRESH_EVENT));
    return chats;
  }, [user, email]);

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
    const openNow = () => {
      setView("list");
      setActive(null);
      setOpen(true);
    };
    const openEscrowNow = () => {
      setView("list");
      setActive(null);
      setOpenEscrow(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_CHAT_EVENT, openNow);
    window.addEventListener(OPEN_ESCROW_EVENT, openEscrowNow);
    return () => {
      window.removeEventListener(OPEN_CHAT_EVENT, openNow);
      window.removeEventListener(OPEN_ESCROW_EVENT, openEscrowNow);
    };
  }, []);

  useEffect(() => {
    if (!open || view !== "list" || path.startsWith("/admin")) return;
    let cancelled = false;
    loadList()
      .then((chats) => {
        if (cancelled || !openEscrow) return;
        setOpenEscrow(false);
        const row =
          (chats || []).find((r) => r.kind === "escrow") ||
          ({
            source: "inquiry",
            id: 0,
            kind: "escrow",
            title: "Chat with Escrow",
            subject: "SocialsFlip escrow",
            preview: "",
            updatedAt: "",
            unread: 0,
            sellerName: "SocialsFlip Escrow",
            buyerName: name,
            buyerEmail: (user?.email || email).trim(),
          } satisfies Row);
        openRow(row);
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed");
      });
    return () => {
      cancelled = true;
    };
  }, [open, view, path, loadList, openEscrow]);

  async function openInquiry(id: number, mail: string, mark = false) {
    const q = mail ? `&email=${encodeURIComponent(mail)}` : "";
    const d = await api<{
      inquiry: { msgs?: Msg[]; buyerName?: string; buyerEmail?: string };
    }>(`/api/inquiries?id=${id}${q}`);
    setMsgs(d.inquiry.msgs || []);
    setBuyerName(d.inquiry.buyerName || "");
    if (mark) {
      await api("/api/chats/seen", {
        method: "POST",
        json: { source: "inquiry", id, email: mail },
      }).catch(() => undefined);
    }
  }

  async function openDeal(id: number, mail: string, mark = false) {
    const q = mail ? `&email=${encodeURIComponent(mail)}` : "";
    const d = await api<{ order: { msgs?: Msg[]; buyerName?: string } }>(
      `/api/orders?id=${id}${q}`
    );
    setMsgs(d.order.msgs || []);
    setBuyerName(d.order.buyerName || "");
    if (mark) {
      await api("/api/chats/seen", {
        method: "POST",
        json: { source: "deal", id, email: mail },
      }).catch(() => undefined);
    }
  }

  async function openRow(row: Row) {
    setErr("");
    setActive(row);
    setView("room");
    const mail = (email || user?.email || row.buyerEmail).trim();
    try {
      if (row.kind === "escrow" && row.id === 0) {
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
        const next = { ...row, id: res.inquiry.id };
        setActive(next);
        await openInquiry(res.inquiry.id, mail, true);
        return;
      }
      if (row.source === "deal") await openDeal(row.id, mail, true);
      else await openInquiry(row.id, mail, true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  useEffect(() => {
    if (!open || view !== "room" || !active?.id) return;
    const mail = email || user?.email || active.buyerEmail;
    const timer = setInterval(() => {
      const load = active.source === "deal" ? openDeal : openInquiry;
      load(active.id, mail).catch(() => undefined);
    }, 4000);
    return () => clearInterval(timer);
  }, [open, view, active?.id, active?.source, email, user?.email]);

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
      setActive({
        source: "inquiry",
        id: res.inquiry.id,
        kind: "escrow",
        title: "Chat with Escrow",
        subject: "SocialsFlip escrow",
        preview: "",
        updatedAt: new Date().toISOString(),
        unread: 0,
        sellerName: "SocialsFlip Escrow",
        buyerName: name,
        buyerEmail: email,
      });
      await openInquiry(res.inquiry.id, email, true);
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    if (!active?.id || !text.trim()) return;
    setErr("");
    const mail = email || user?.email || active.buyerEmail;
    try {
      if (active.source === "deal") {
        await api(`/api/orders/${active.id}/messages`, {
          method: "POST",
          json: { text, email: mail },
        });
        setText("");
        await openDeal(active.id, mail);
      } else {
        await api(`/api/inquiries/${active.id}/messages`, {
          method: "POST",
          json: { text, email: mail },
        });
        setText("");
        await openInquiry(active.id, mail);
      }
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Failed");
    }
  }

  if (path.startsWith("/admin")) return null;

  const market = rows.filter((r) => r.kind !== "escrow");
  const escrow = rows.filter((r) => r.kind === "escrow");
  const escrowFallback: Row = {
    source: "inquiry",
    id: 0,
    kind: "escrow",
    title: "Chat with Escrow",
    subject: "SocialsFlip escrow",
    preview: "Talk with SocialsFlip escrow. No seller is in this room.",
    updatedAt: "",
    unread: 0,
    sellerName: "SocialsFlip Escrow",
    buyerName: "",
    buyerEmail: email || user?.email || "",
  };
  const escrowRows = escrow.length ? escrow : [escrowFallback];
  const needsGate = view === "room" && active?.kind === "escrow" && active.id === 0 && !(email || user?.email);
  const roomTitle =
    active?.kind === "escrow" ? t("chat.withEscrow") : active?.title || t("nav.chats");

  function rowButton(row: Row, escrowRow = false) {
    return (
      <button
        key={`${row.source}-${row.kind}-${row.id}`}
        type="button"
        className={`chat-inbox-row ${escrowRow ? "escrow" : ""}`}
        onClick={() => openRow(row)}
      >
        <span className="chat-inbox-main">
          <strong>{escrowRow ? `⚖ ${t("chat.withEscrow")}` : row.title}</strong>
          {escrowRow ? null : <small>{row.subject}</small>}
          <span>{row.preview}</span>
        </span>
        <span className="chat-inbox-meta">
          {row.updatedAt ? <time>{when(row.updatedAt)}</time> : null}
          {row.unread > 0 ? <em>{row.unread > 9 ? "9+" : row.unread}</em> : null}
        </span>
      </button>
    );
  }

  return (
    <>
      {open ? (
        <div className="chat-dock" role="dialog" aria-label={t("nav.chats")}>
          <div className="chat-live">
            <div className="chat-live-head">
              <div>
                {view === "room" ? (
                  <button
                    type="button"
                    className="chat-back"
                    onClick={() => {
                      if (active?.id) {
                        api("/api/chats/seen", {
                          method: "POST",
                          json: {
                            source: active.source,
                            id: active.id,
                            email: email || user?.email || active.buyerEmail,
                          },
                        }).catch(() => undefined);
                      }
                      setView("list");
                    }}
                  >
                    ←
                  </button>
                ) : null}
                <strong>{view === "list" ? t("nav.chats") : roomTitle}</strong>
                <p>
                  {view === "list"
                    ? "Buyer, seller, and deal conversations"
                    : active?.kind === "deal"
                      ? active.preview.slice(0, 80)
                      : t("chat.private")}
                </p>
              </div>
              <button type="button" className="chat-live-x" onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </div>

            {view === "list" ? (
              <div className="chat-inbox">
                {!user ? (
                  <form
                    className="chat-find"
                    onSubmit={(e) => {
                      e.preventDefault();
                      loadList().catch(() => undefined);
                    }}
                  >
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        saveGuestEmail(e.target.value);
                      }}
                      placeholder="Email used on your orders"
                      aria-label="Email"
                    />
                  </form>
                ) : null}
                {err ? <p className="err">{err}</p> : null}
                <div className="chat-inbox-scroll">
                  {market.map((row) => rowButton(row))}
                  {!market.length ? (
                    <p className="sm mut chat-inbox-empty">
                      No seller or deal chats yet. Open a listing and tap Chat, or place an order.
                    </p>
                  ) : null}
                </div>
                <div className="chat-inbox-foot">{escrowRows.map((row) => rowButton(row, true))}</div>
              </div>
            ) : needsGate ? (
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
                  onChange={(e) => {
                    setEmail(e.target.value);
                    saveGuestEmail(e.target.value);
                  }}
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
                  {msgs.map((m) => (
                    <div key={m.id} className={`m ${m.from}`}>
                      <small>
                        {m.from === "admin"
                          ? "Escrow"
                          : m.from === "buyer"
                            ? buyerName || "Buyer"
                            : m.from === "seller"
                              ? active?.sellerName || "Seller"
                              : m.from}
                      </small>
                      {m.text}
                    </div>
                  ))}
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
                    placeholder={active?.kind === "escrow" ? "Message Escrow…" : "Message…"}
                    aria-label="Message"
                  />
                  <button className="btn" type="submit">
                    Send
                  </button>
                </form>
                {active?.source === "deal" ? (
                  <p className="chat-live-links">
                    <Link href={`/deal/${active.id}`} onClick={() => setOpen(false)}>
                      Open full deal
                    </Link>
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}
      <button
        type="button"
        className={`chat-fab ${open ? "on" : ""}`}
        aria-expanded={open}
        aria-label={t("chat.fab")}
        onClick={() => {
          setView("list");
          setOpen((v) => !v);
        }}
      >
        <ChatCountBadge count={unread} />
        <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
          <path d="M4 12a8 8 0 0 1 16 0" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <rect x="2.5" y="11" width="4.2" height="7" rx="1.4" fill="currentColor" />
          <rect x="17.3" y="11" width="4.2" height="7" rx="1.4" fill="currentColor" />
          <path d="M19.2 18.2v.8a3 3 0 0 1-3 3h-2.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="12" cy="11.2" r="2" fill="currentColor" />
        </svg>
      </button>
    </>
  );
}
