"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { StartEscrowChat } from "@/components/StartEscrowChat";
import { useLang } from "@/components/LanguageProvider";

type Row = {
  id: number;
  kind?: "seller" | "escrow";
  subject: string;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
  updatedAt: string;
  status: string;
  lastMsg: { text: string; from: string } | null;
  seller?: { name: string; verified?: boolean } | null;
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
        : user?.role === "admin"
          ? "?scope=admin"
          : user?.role === "seller"
            ? "?scope=seller"
            : "";
      const d = await api<{ inquiries: Row[] }>(`/api/inquiries${q}`);
      setRows(d.inquiries);
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
        Seller chats and direct Escrow support. Deal rooms stay under Orders.
      </p>

      <div className="card f escrow-support-hero" style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>{t("help.chatEscrow")}</h3>
        <p className="sm mut">{t("help.chatEscrowSub")}</p>
        <StartEscrowChat compact />
      </div>

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

      <div className="tbl" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>With</th>
              <th>Topic</th>
              <th>Last</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const escrow = (r.kind || "seller") === "escrow";
              return (
                <tr key={r.id}>
                  <td>
                    <b>{escrow ? "SocialsFlip Escrow" : r.sellerName}</b>
                    {escrow ? (
                      <>
                        {" "}
                        <span className="pill g">Escrow</span>
                      </>
                    ) : null}
                    <br />
                    <span className="mut sm">Buyer: {r.buyerName}</span>
                  </td>
                  <td>{r.subject}</td>
                  <td className="sm mut">
                    {r.lastMsg
                      ? r.lastMsg.text.slice(0, 60)
                      : new Date(r.updatedAt).toLocaleString()}
                  </td>
                  <td>
                    <div className="row">
                    <Link
                      className="btn s"
                      href={`/chat/${r.id}${
                        !user
                          ? `?email=${encodeURIComponent(email || r.buyerEmail)}`
                          : user.role === "buyer" ||
                              user.email.toLowerCase() ===
                                r.buyerEmail.toLowerCase()
                            ? `?email=${encodeURIComponent(r.buyerEmail)}`
                            : ""
                      }`}
                    >
                      Open
                    </Link>
                    {user ? (
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length ? (
          <p className="mut">
            No chats yet. Use <b>Chat with Escrow</b> above, or open a seller
            profile and tap Chat.
          </p>
        ) : null}
      </div>
    </section>
  );
}
