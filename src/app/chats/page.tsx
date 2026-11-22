"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";

type Row = {
  id: number;
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
      <h1 style={{ fontSize: "2rem" }}>Seller chats</h1>
      <p className="mut">
        Pre-deal conversations with sellers by name. Escrow can join every room.
        Deals stay under Orders.
      </p>

      {!user ? (
        <div className="card">
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
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <b>{r.sellerName}</b>
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
                    Open {r.sellerName}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? (
          <p className="mut">
            No chats yet. Open a seller profile or listing and tap{" "}
            <b>Chat with …</b>
          </p>
        ) : null}
      </div>
    </section>
  );
}
