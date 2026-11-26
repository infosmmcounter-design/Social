"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { StartEscrowChat } from "@/components/StartEscrowChat";
import { useLang } from "@/components/LanguageProvider";
import { readGuestEmail, saveGuestEmail } from "@/lib/guest-email";

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

export default function ChatsPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
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

  const sellerRows = rows.filter((r) => r.kind !== "escrow");
  const escrowRows = rows.filter((r) => r.kind === "escrow");

  function hrefFor(r: Row) {
    if (r.source === "deal") return `/deal/${r.id}?email=${encodeURIComponent(email || r.buyerEmail)}`;
    return `/chat/${r.id}?email=${encodeURIComponent(email || r.buyerEmail)}`;
  }

  function list(items: Row[]) {
    return items.map((r) => (
      <article key={`${r.source}-${r.id}`} className="chat-page-row">
        <div className="grow">
          <b>
            {r.kind === "deal" ? "Deal" : "Seller"} · {r.title}
            {r.unread > 0 ? <span className="pill g">{r.unread} new</span> : null}
          </b>
          <small>{r.subject}</small>
          <span>{r.preview}</span>
        </div>
        <Link className="btn s" href={hrefFor(r)}>
          Open
        </Link>
      </article>
    ));
  }

  return (
    <section className="sec chat-sections" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("nav.chats")}</h1>
      <p className="mut">
        Seller and deal chats are listed first. Escrow support is its own section below.
      </p>

      {!user ? (
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
          <article key={`${r.source}-${r.id}`} className="chat-page-row escrow">
            <div className="grow">
              <b>
                {t("chat.withEscrow")}
                {r.unread > 0 ? <span className="pill g">{r.unread} new</span> : null}
              </b>
              <span>{r.preview}</span>
            </div>
            <Link className="btn s" href={hrefFor(r)}>
              Open
            </Link>
          </article>
        ))}
        {!escrowRows.length ? (
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
