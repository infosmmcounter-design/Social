"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { StartEscrowChat } from "@/components/StartEscrowChat";
import { useLang } from "@/components/LanguageProvider";

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
  const { user } = useAuth();
  const { t } = useLang();
  const [rows, setRows] = useState<Row[]>([]);
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  async function load(forEmail?: string) {
    setErr("");
    try {
      const q = forEmail
        ? `?email=${encodeURIComponent(forEmail)}`
        : "";
      const d = await api<{ chats: Row[] }>(`/api/chats${q}`);
      setRows(d.chats || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
      setRows([]);
    }
  }

  useEffect(() => {
    if (user) load().catch(() => undefined);
  }, [user]);

  return (
    <section className="sec" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("nav.chats")}</h1>
      <p className="mut">
        Seller chats and deal rooms stay here. Escrow support is pinned at the bottom.
      </p>

      {!user ? (
        <div className="card" style={{ marginTop: 14 }}>
          <label>Email used when you started a chat</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <button
            className="btn"
            style={{ marginTop: 10 }}
            onClick={() => load(email.trim())}
          >
            Find my chats
          </button>
        </div>
      ) : null}

      {err ? <p className="err">{err}</p> : null}

      <div className="chat-page-list">
        {(rows.some((r) => r.kind === "escrow")
          ? rows
          : [
              ...rows,
              {
                source: "inquiry" as const,
                id: 0,
                kind: "escrow" as const,
                title: "Chat with Escrow",
                subject: "SocialsFlip escrow",
                preview: "Talk with SocialsFlip escrow. No seller is in this room.",
                updatedAt: "",
                unread: 0,
                sellerName: "SocialsFlip Escrow",
                buyerName: "",
                buyerEmail: email,
              },
            ]
        ).map((r) => {
          const escrow = r.kind === "escrow";
          const href =
            r.source === "deal"
              ? `/deal/${r.id}`
              : `/chat/${r.id}${
                  !user || user.email.toLowerCase() === r.buyerEmail.toLowerCase()
                    ? `?email=${encodeURIComponent(email || r.buyerEmail)}`
                    : ""
                }`;
          return (
            <article key={`${r.source}-${r.id}`} className={`chat-page-row ${escrow ? "escrow" : ""}`}>
              <div className="grow">
                <b>{escrow ? `⚖ ${t("chat.withEscrow")}` : r.title}</b>
                {r.unread > 0 ? <span className="pill g">{r.unread} new</span> : null}
                {escrow ? null : <small>{r.subject}</small>}
                <span>{r.preview}</span>
              </div>
              <time className="sm mut">
                {r.updatedAt && new Date(r.updatedAt).getTime()
                  ? new Date(r.updatedAt).toLocaleString()
                  : ""}
              </time>
              <div className="row">
                {r.id ? (
                  <Link className="btn s" href={href}>
                    Open
                  </Link>
                ) : (
                  <StartEscrowChat />
                )}
                {user && r.source === "inquiry" && r.id ? (
                  <>
                    <button
                      type="button"
                      className="btn s o"
                      onClick={async () => {
                        await api(`/api/inquiries/${r.id}`, {
                          method: "POST",
                          json: { action: "delete", email: email || r.buyerEmail },
                        });
                        load();
                      }}
                    >
                      Delete
                    </button>
                    {escrow ? null : (
                      <button
                        type="button"
                        className="btn s d"
                        onClick={async () => {
                          await api(`/api/inquiries/${r.id}`, {
                            method: "POST",
                            json: { action: "block" },
                          });
                          setErr(`Blocked ${r.sellerName || r.buyerName}`);
                        }}
                      >
                        Block
                      </button>
                    )}
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
        {!rows.length ? (
          <p className="mut">
            No seller or deal chats yet. Open a listing and tap Chat, or place an order.
          </p>
        ) : null}
      </div>
    </section>
  );
}
