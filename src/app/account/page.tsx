"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";

type Deposit = {
  id: number;
  amount: number;
  note: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type WalletAddr = { asset: string; network: string; address: string; label?: string };

function EmailStatus() {
  const { user, refresh } = useAuth();
  const { t } = useLang();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  if (!user || user.emailVerified !== false) {
    return (
      <p className="sm">
        {"✓ "}
        {t("account.emailVerified")}
      </p>
    );
  }
  async function resend() {
    setBusy(true);
    setNote("");
    try {
      const res = await api<{
        ok?: boolean;
        mailConfigured?: boolean;
        error?: string;
      }>("/api/auth/verify/resend", { method: "POST" });
      if (res.ok) {
        setNote(t("account.emailSent"));
        refresh();
      } else if (res.mailConfigured === false) {
        setNote(t("account.emailMailOff"));
      } else {
        setNote(res.error || t("account.emailMailOff"));
      }
    } catch (e) {
      setNote(e instanceof Error ? e.message : t("account.emailMailOff"));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="note" style={{ marginTop: 8 }}>
      <p className="sm" style={{ margin: 0 }}>
        {"○ "}
        {t("account.emailPending")}
      </p>
      <button className="btn s" type="button" disabled={busy} onClick={resend} style={{ marginTop: 8 }}>
        {t("account.resendEmail")}
      </button>
      {note ? <p className="sm">{note}</p> : null}
    </div>
  );
}

export default function AccountPage() {
  const { user, loading, refresh, setUser, logout } = useAuth();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [wallets, setWallets] = useState<WalletAddr[]>([]);
  const [panel, setPanel] = useState<
    "notes" | "help" | "settings" | "how" | "escrow" | "fees" | "rules" | "chats" | ""
  >("");
  const [currentPw, setCurrentPw] = useState("");
  const [nextPw, setNextPw] = useState("");
  const [deletePw, setDeletePw] = useState("");
  const [chats, setChats] = useState<{ id: number; sellerName?: string; buyerName?: string; subject: string; lastMsg?: { text: string } | null }[]>([]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setCountry(user.country || "");
    setBio(user.bio || "");
    api<{ balance: number; deposits: Deposit[]; wallets?: WalletAddr[] }>("/api/wallet")
      .then((d) => {
        setBalance(d.balance);
        setDeposits(d.deposits || []);
        setWallets(d.wallets || []);
      })
      .catch(() => undefined);
    api<{ inquiries: typeof chats }>("/api/inquiries")
      .then((d) => setChats(d.inquiries || []))
      .catch(() => setChats([]));
  }, [user]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const d = await api<{ user: NonNullable<typeof user> }>("/api/account", {
        method: "POST",
        json: { name, country, bio, phone },
      });
      setUser(d.user);
      await refresh();
      setEditing(false);
      setMsg(t("account.saved"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function deposit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const d = await api<{ message: string }>("/api/wallet", {
        method: "POST",
        json: { amount: Number(amount), note },
      });
      setMsg(d.message);
      setAmount("");
      setNote("");
      const w = await api<{ balance: number; deposits: Deposit[]; wallets?: WalletAddr[] }>("/api/wallet");
      setWallets(w.wallets || []);
      setBalance(w.balance);
      setDeposits(w.deposits || []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  if (loading) return <p className="sec mut">{t("common.loading")}</p>;

  if (!user) {
    return (
      <section className="sec" style={{ maxWidth: 520 }}>
        <h1>{t("nav.account")}</h1>
        <p className="mut">{t("account.login")}</p>
        <div className="row">
          <Link className="btn" href="/auth/login">
            {t("nav.login")}
          </Link>
          <Link className="btn o" href="/auth/signup">
            {t("nav.signup")}
          </Link>
        </div>
      </section>
    );
  }

  const days = Math.max(
    1,
    Math.round((Date.now() - new Date(user.joinedAt).getTime()) / 86400000)
  );
  const initial = (user.name || "?").slice(0, 1).toUpperCase();

  return (
    <section className="sec account-page">
      <h1 style={{ fontSize: "2rem" }}>{t("nav.account")}</h1>
      {msg ? <p className="okmsg">{msg}</p> : null}
      {err ? <p className="err">{err}</p> : null}

      <div className="account-hero">
        <div className="account-av" aria-hidden>
          {initial}
        </div>
        <div>
          <strong>{user.name}</strong>
          <p className="sm" style={{ margin: "2px 0 0", opacity: 0.85 }}>
            {user.email}
          </p>
          <p className="sm" style={{ margin: "2px 0 0", opacity: 0.75 }}>
            {user.role === "seller" ? t("account.seller") : t("account.buyer")}
            {user.country ? ` · ${user.country}` : ""}
          </p>
        </div>
        <div className="account-hero-actions">
          <button type="button" className="btn s" onClick={() => setEditing((v) => !v)}>
            {t("account.edit")}
          </button>
          {user.role === "seller" ? (
            <Link className="btn s o" href={`/seller/${user.id}`}>
              {t("account.view")}
            </Link>
          ) : (
            <Link className="btn s o" href="/apply">
              {t("account.applySell")}
            </Link>
          )}
        </div>
      </div>

      {editing ? (
        <form className="card" onSubmit={saveProfile} style={{ marginTop: 14 }}>
          <label>{t("listing.yourName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
          <label>{t("account.country")}</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} />
          <label>{t("account.phone")}</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label>{t("account.bio")}</label>
          <textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          <button className="btn" type="submit" style={{ marginTop: 12 }}>
            {t("account.save")}
          </button>
        </form>
      ) : null}

      <div className="card wallet-card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>{t("account.wallet")}</strong>
          <span className="price" style={{ margin: 0 }}>
            {money(balance)}
          </span>
        </div>
        <p className="sm mut">{t("account.walletHint")}</p>
        <div className="note sm">
          <b>USDT TRC20</b>
          <br />
          {wallets.find((w) => w.asset.includes("TRC"))?.address || "Address appears after admin saves it."}
          <br />
          <b>USDT BEP20</b>
          <br />
          {wallets.find((w) => w.asset.includes("BEP"))?.address || "Address appears after admin saves it."}
        </div>
        <form onSubmit={deposit}>
          <label>{t("account.depositAmount")}</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="50"
          />
          <label>{t("account.depositNote")}</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="TX hash"
          />
          <button className="btn" type="submit" style={{ marginTop: 12 }}>
            {t("account.deposit")}
          </button>
        </form>
        {deposits.length ? (
          <ul className="wallet-list">
            {deposits.slice(0, 6).map((d) => (
              <li key={d.id}>
                <span>{money(d.amount)}</span>
                <span className="pill w">{d.status}</span>
                <span className="sm mut">{d.note}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="account-stats">
        <div>
          <strong>{user.reviewCount || 0}</strong>
          <span>{t("nav.deals")}</span>
        </div>
        <div>
          <strong>{user.rating ? user.rating.toFixed(1) : "—"}</strong>
          <span>{t("reviews.rating")}</span>
        </div>
        <div>
          <strong>{days}</strong>
          <span>{t("account.days")}</span>
        </div>
      </div>
      <EmailStatus />

      <div className="row" style={{ marginTop: 16 }}>
        {(
          [
            ["notes", "Notifications"],
            ["help", "Help and support"],
            ["settings", "Settings"],
            ["how", "How to use SocialsFlip"],
            ["escrow", "How escrow works"],
            ["fees", "Fee and trust"],
            ["rules", "Rules and safety"],
            ["chats", "Chat previews"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`btn s ${panel === id ? "" : "o"}`}
            onClick={() => setPanel(panel === id ? "" : id)}
          >
            {label}
          </button>
        ))}
        <button className="btn s d" type="button" onClick={() => logout()}>
          {t("nav.logout")}
        </button>
      </div>

      {panel === "notes" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Notifications</h3>
          {deposits.slice(0, 5).map((d) => (
            <p key={d.id} className="sm">
              Deposit {money(d.amount)} · {d.status}
            </p>
          ))}
          {!deposits.length ? <p className="sm mut">No wallet alerts yet.</p> : null}
          <Link href="/deals">Open my deals</Link>
        </div>
      ) : null}
      {panel === "help" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Help and support</h3>
          <p className="sm">Chat goes straight to escrow. No seller is in that room.</p>
          <Link className="btn s" href="/help">Open help</Link>
        </div>
      ) : null}
      {panel === "settings" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Settings</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setErr("");
              setMsg("");
              try {
                const d = await api<{ message: string }>("/api/account/password", {
                  method: "POST",
                  json: { current: currentPw, next: nextPw },
                });
                setMsg(d.message);
                setCurrentPw("");
                setNextPw("");
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "Failed");
              }
            }}
          >
            <label>Current password</label>
            <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
            <label>New password</label>
            <input type="password" value={nextPw} onChange={(e) => setNextPw(e.target.value)} />
            <button className="btn" type="submit" style={{ marginTop: 10 }}>Update password</button>
          </form>
          <p style={{ marginTop: 14 }}>
            <Link href="/privacy">Terms and privacy</Link>
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!confirm("Delete this account?")) return;
              setErr("");
              try {
                await api("/api/account/delete", {
                  method: "POST",
                  json: { password: deletePw },
                });
                setUser(null);
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "Failed");
              }
            }}
          >
            <label>Delete account</label>
            <input type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} placeholder="Password" />
            <button className="btn d" type="submit" style={{ marginTop: 10 }}>Delete account</button>
          </form>
        </div>
      ) : null}
      {panel === "how" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>How to use SocialsFlip</h3>
          <ol>
            <li>Pick an account or freelance service.</li>
            <li>Choose quantity, then pay escrow with USDT or your wallet balance.</li>
            <li>Chat stays open until the seller delivers and you confirm.</li>
          </ol>
        </div>
      ) : null}
      {panel === "escrow" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>How escrow works</h3>
          <p>The buyer pays SocialsFlip, not the seller. Funds stay held until delivery is confirmed. Admin can hold, refund, or complete the deal.</p>
        </div>
      ) : null}
      {panel === "fees" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Fee and trust</h3>
          <p>The escrow fee is added at checkout. A seller’s trust percent follows their star rating. Under 80% the profile shows a warning.</p>
        </div>
      ) : null}
      {panel === "rules" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Rules and safety</h3>
          <p>Pay only the escrow wallets. Do not send USDT on the wrong network. Keep transfer emails and delivery notes inside the deal.</p>
        </div>
      ) : null}
      {panel === "chats" ? (
        <div className="card" style={{ marginTop: 12 }}>
          <h3>Chat previews</h3>
          {chats.slice(0, 6).map((c) => (
            <p key={c.id} className="sm">
              <Link href={`/chat/${c.id}`}>
                <b>{c.sellerName || c.buyerName || c.subject}</b>
              </Link>
              <br />
              <span className="mut">{c.lastMsg?.text || c.subject}</span>
            </p>
          ))}
          {!chats.length ? <p className="sm mut">No chats yet.</p> : null}
        </div>
      ) : null}
    </section>
  );
}
