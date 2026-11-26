"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { StartEscrowChat } from "@/components/StartEscrowChat";
import { useLang } from "@/components/LanguageProvider";
import { readGuestEmail, saveGuestEmail } from "@/lib/guest-email";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

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

function EscrowStartForm() {
  const { user } = useAuth();
  const { locale } = useLang();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || readGuestEmail());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function start(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const mail = email.trim().toLowerCase();
      saveGuestEmail(mail);
      const res = await api<{ inquiry: { id: number } }>("/api/inquiries", {
        method: "POST",
        json: {
          kind: "escrow",
          name: name.trim() || "Guest",
          email: mail,
          message: "",
          subject: "Chat with Escrow",
        },
      });
      router.push(
        withLocalePrefix(
          `/chat/${res.inquiry.id}?email=${encodeURIComponent(mail)}`,
          locale
        )
      );
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Could not open the chat");
      setBusy(false);
    }
  }

  return (
    <form className="card" id="escrow-start" onSubmit={start} style={{ marginTop: 14 }}>
      <h2 style={{ marginTop: 0 }}>Open a chat with Escrow</h2>
      <p className="sm mut">
        This opens its own page. You and SocialsFlip escrow can write there. No seller is in that room.
      </p>
      <label>Your name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} required />
      <label>Your email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
      />
      {err ? <p className="err">{err}</p> : null}
      <button className="btn buy-go" style={{ marginTop: 10, width: "auto" }} type="submit" disabled={busy}>
        {busy ? "Opening…" : "Open escrow chat"}
      </button>
    </form>
  );
}

function ChatsInner() {
  const { user, loading } = useAuth();
  const { t, locale } = useLang();
  const router = useRouter();
  const search = useSearchParams();
  const startEscrow = search.get("start") === "escrow";
  const opened = useRef(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  async function load(forEmail?: string) {
    setErr("");
    setBusy(true);
    try {
      const mail = (forEmail || "").trim().toLowerCase();
      if (mail) saveGuestEmail(mail);
      const q = !user && mail ? `?email=${encodeURIComponent(mail)}` : "";
      const d = await api<{ chats: Row[] }>(`/api/chats${q}`);
      setRows(d.chats || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not load chats");
      setRows([]);
    } finally {
      setBusy(false);
      setReady(true);
    }
  }

  useEffect(() => {
    if (loading) return;
    const saved = readGuestEmail();
    if (saved) setEmail(saved);
    if (user) {
      load().catch(() => undefined);
      return;
    }
    if (saved) {
      load(saved).catch(() => undefined);
      return;
    }
    setReady(true);
  }, [user, loading]);

  useEffect(() => {
    if (!startEscrow || loading || !user?.email || opened.current) return;
    opened.current = true;
    saveGuestEmail(user.email);
    api<{ inquiry: { id: number } }>("/api/inquiries", {
      method: "POST",
      json: {
        kind: "escrow",
        name: user.name || "Guest",
        email: user.email,
        message: "",
        subject: "Chat with Escrow",
      },
    })
      .then((res) => {
        router.replace(withLocalePrefix(`/chat/${res.inquiry.id}`, locale));
      })
      .catch(() => {
        opened.current = false;
      });
  }, [startEscrow, loading, user, locale, router]);

  const sellerRows = rows.filter((r) => r.kind !== "escrow");
  const escrowRows = rows.filter((r) => r.kind === "escrow");

  function hrefFor(r: Row) {
    const mail = encodeURIComponent(email || r.buyerEmail || "");
    if (r.source === "deal") return `/deal/${r.id}?email=${mail}`;
    return `/chat/${r.id}?email=${mail}`;
  }

  function list(items: Row[]) {
    return items.map((r) => (
      <Link key={`${r.source}-${r.id}`} className="chat-page-row" href={hrefFor(r)}>
        <div className="grow">
          <b>
            {r.kind === "deal" ? "Deal" : "Seller"} · {r.title}
            {r.unread > 0 ? <span className="pill g">{r.unread} new</span> : null}
          </b>
          <small>{r.subject}</small>
          <span>{r.preview}</span>
        </div>
        <span className="chat-open">Open</span>
      </Link>
    ));
  }

  return (
    <section className="sec chat-sections" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("nav.chats")}</h1>
      <p className="mut">
        Each conversation opens on its own page, so you can read and reply without a small box in the way.
      </p>

      {startEscrow && !user ? <EscrowStartForm /> : null}

      {!user && !startEscrow ? (
        <form
          className="card"
          style={{ marginTop: 14 }}
          onSubmit={(e) => {
            e.preventDefault();
            load(email);
          }}
        >
          <label>Find my chats</label>
          <p className="sm mut">Use the email you typed when you started a chat or a deal.</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <button className="btn" style={{ marginTop: 10 }} type="submit" disabled={busy}>
            {busy ? "Looking…" : "Find my chats"}
          </button>
        </form>
      ) : null}

      {err ? <p className="err">{err}</p> : null}
      {!ready || busy ? <p className="mut">Loading chats…</p> : null}

      <h2>Seller and deal chats</h2>
      <div className="chat-page-list">
        {list(sellerRows)}
        {ready && !busy && !sellerRows.length ? (
          <p className="mut">No seller chats yet. Open a listing and tap Chat with Seller.</p>
        ) : null}
      </div>

      <h2>Escrow support</h2>
      <div className="chat-page-list">
        {escrowRows.map((r) => (
          <Link key={`${r.source}-${r.id}`} className="chat-page-row escrow" href={hrefFor(r)}>
            <div className="grow">
              <b>
                {t("chat.withEscrow")}
                {r.unread > 0 ? <span className="pill g">{r.unread} new</span> : null}
              </b>
              <span>{r.preview}</span>
            </div>
            <span className="chat-open">Open</span>
          </Link>
        ))}
        {!escrowRows.length && !startEscrow ? (
          <article className="chat-page-row escrow">
            <div className="grow">
              <b>{t("chat.withEscrow")}</b>
              <span>Talk with SocialsFlip escrow. No seller is in this room.</span>
            </div>
            <StartEscrowChat />
          </article>
        ) : null}
      </div>
    </section>
  );
}

export default function ChatsPage() {
  return (
    <Suspense fallback={<p className="sec mut">Loading chats…</p>}>
      <ChatsInner />
    </Suspense>
  );
}
