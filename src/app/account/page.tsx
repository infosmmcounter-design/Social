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
  network?: string;
  address?: string;
  expectedMicro?: string;
  expiresAt?: string;
  confirmations?: number;
  txHash?: string | null;
};

const ICONS = ["😎", "🚀", "🎯", "🦊", "🦁", "🐼", "🌟", "💎", "🔥", "🎵", "📸", "💼", "⚡", "👑", "🤝"];

function iconAvatar(emoji: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><rect width="128" height="128" rx="64" fill="#1a1408"/><text x="64" y="86" text-anchor="middle" font-size="72">${emoji}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function exactAmount(d: Deposit) {
  if (!d.expectedMicro) return d.amount.toFixed(2);
  return (Number(d.expectedMicro) / 1_000_000).toFixed(6);
}

type WalletAddr = { asset: string; network: string; address: string; label?: string };

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
  const [net, setNet] = useState<"USDT_TRC20" | "USDT_BEP20">("USDT_TRC20");
  const [qr, setQr] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [wallets, setWallets] = useState<WalletAddr[]>([]);
  const [panel, setPanel] = useState<
    "notes" | "help" | "settings" | "how" | "escrow" | "fees" | "rules" | "chats" | ""
  >("");
  const [currentPw, setCurrentPw] = useState("");
  const [backupPw, setBackupPw] = useState("");
  const [freshCode, setFreshCode] = useState("");
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

  const openDep = deposits.find((d) => d.status === "pending" && d.expectedMicro && d.address);
  const openDepId = openDep?.id || 0;

  useEffect(() => {
    if (!user || !openDepId) return;
    const id = window.setInterval(() => {
      api<{ balance: number; deposits: Deposit[]; wallets?: WalletAddr[] }>("/api/wallet")
        .then((d) => {
          setBalance(d.balance);
          setDeposits(d.deposits || []);
          setWallets(d.wallets || []);
        })
        .catch(() => undefined);
    }, 8000);
    return () => window.clearInterval(id);
  }, [user, openDepId]);

  useEffect(() => {
    if (!openDep?.address) {
      setQr("");
      return;
    }
    let stop = false;
    import("qrcode").then((QR) =>
      QR.toString(openDep.address || "", { type: "svg", margin: 1, width: 168 }).then((svg) => {
        if (!stop) setQr(svg);
      })
    );
    return () => {
      stop = true;
    };
  }, [openDep?.address]);

  async function saveAvatar(avatarUrl: string) {
    if (!user) return;
    setErr("");
    setMsg("");
    try {
      const d = await api<{ user: NonNullable<typeof user> }>("/api/account", {
        method: "POST",
        json: { name: name || user.name, country, bio, phone, avatarUrl },
      });
      setUser(d.user);
      setMsg("Profile photo saved.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function onPhoto(file: File) {
    const img = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const scale = Math.max(256 / img.width, 256 / img.height);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (256 - w) / 2, (256 - h) / 2, w, h);
    await saveAvatar(canvas.toDataURL("image/jpeg", 0.72));
  }

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
        json: { amount: Number(amount), network: net },
      });
      setMsg(d.message);
      setAmount("");
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
          {user.avatarUrl ? <img src={user.avatarUrl} alt="" /> : initial}
        </div>
        <div>
          <strong>{user.name}</strong>
          {user.username ? (
            <p className="sm" style={{ margin: "2px 0 0", opacity: 0.85 }}>
              @{user.username}
            </p>
          ) : null}
          {user.email ? (
            <p className="sm" style={{ margin: "2px 0 0", opacity: 0.85 }}>
              {user.email}
            </p>
          ) : null}
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
        <form className="card hl-card" onSubmit={saveProfile} style={{ marginTop: 14 }}>
          <label>Profile photo or icon</label>
          <div className="emoji-row">
            {ICONS.map((emoji) => (
              <button key={emoji} type="button" onClick={() => saveAvatar(iconAvatar(emoji))}>
                {emoji}
              </button>
            ))}
          </div>
          <label className="btn s o" style={{ marginTop: 10, display: "inline-block" }}>
            Upload photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPhoto(file);
                e.target.value = "";
              }}
            />
          </label>
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

      <div className="card wallet-card crypto-pay">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>{t("account.wallet")}</strong>
          <span className="price" style={{ margin: 0 }}>
            {money(balance)}
          </span>
        </div>
        <p className="sm">{t("account.walletHint")}</p>
        <p className="crypto-kicker">Deposit USDT</p>
        <div className="crypto-nets">
          {(["USDT_TRC20", "USDT_BEP20"] as const).map((asset) => {
            const w = wallets.find((x) => x.asset === asset);
            return (
              <button
                key={asset}
                type="button"
                className={`crypto-net ${asset === "USDT_TRC20" ? "trc" : "bep"} ${net === asset ? "on" : ""}`}
                onClick={() => setNet(asset)}
              >
                {asset === "USDT_TRC20" ? "USDT TRC20" : "USDT BEP20"}
                <span className="sm">{w?.network || ""}</span>
              </button>
            );
          })}
        </div>
        {wallets.map((w) => (
          <div key={w.asset} className="hl-line">
            <b>{w.asset === "USDT_TRC20" ? "TRC20" : "BEP20"}</b>
            <code>{w.address}</code>
            <button
              type="button"
              className="btn s"
              onClick={async () => {
                await navigator.clipboard.writeText(w.address);
                setMsg("Address copied.");
              }}
            >
              Copy address
            </button>
          </div>
        ))}
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
          <button className="btn" type="submit" style={{ marginTop: 12 }}>
            {t("account.deposit")}
          </button>
        </form>
        {openDep ? (
          <div className="hl-card dep-live">
            <p className="sm" style={{ margin: 0 }}>
              Send this exact amount on {openDep.network === "USDT_BEP20" ? "BEP20" : "TRC20"}. A different amount stays unmatched.
            </p>
            <p className="dep-exact">{exactAmount(openDep)} USDT</p>
            <button
              type="button"
              className="btn s"
              onClick={async () => {
                await navigator.clipboard.writeText(exactAmount(openDep));
                setMsg("Amount copied.");
              }}
            >
              Copy amount
            </button>
            <code className="dep-addr">{openDep.address}</code>
            <button
              type="button"
              className="btn s"
              onClick={async () => {
                await navigator.clipboard.writeText(openDep.address || "");
                setMsg("Address copied.");
              }}
            >
              Copy address
            </button>
            {qr ? <div className="crypto-qr" dangerouslySetInnerHTML={{ __html: qr }} /> : null}
            <p className="sm">
              {openDep.note}
              {openDep.confirmations ? ` · ${openDep.confirmations} confirmations` : ""}
            </p>
          </div>
        ) : null}
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
        <div className="card hl-card" style={{ marginTop: 12 }}>
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
        <div className="card hl-card" style={{ marginTop: 12 }}>
          <h3>Help and support</h3>
          <p className="sm">Chat goes straight to escrow. No seller is in that room.</p>
          <Link className="btn s" href="/help">Open help</Link>
        </div>
      ) : null}
      {panel === "settings" ? (
        <div className="card hl-card" style={{ marginTop: 12 }}>
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
          <form
            style={{ marginTop: 16 }}
            onSubmit={async (e) => {
              e.preventDefault();
              setErr("");
              setMsg("");
              setFreshCode("");
              try {
                const d = await api<{ backupCode: string }>("/api/account/backup-code", {
                  method: "POST",
                  json: { password: backupPw },
                });
                setFreshCode(d.backupCode);
                setBackupPw("");
                setMsg("New backup code ready. The old code no longer works.");
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "Failed");
              }
            }}
          >
            <label>{t("auth.newBackup")}</label>
            <p className="sm mut">{t("auth.backupHint")}</p>
            <input
              type="password"
              value={backupPw}
              onChange={(e) => setBackupPw(e.target.value)}
              placeholder="Current password"
            />
            <button className="btn o" type="submit" style={{ marginTop: 10 }}>
              {t("auth.newBackup")}
            </button>
            {freshCode ? <p className="backup-code">{freshCode}</p> : null}
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
        <div className="card hl-card" style={{ marginTop: 12 }}>
          <h3>How to use SocialsFlip</h3>
          <ol>
            <li>Pick an account or freelance service.</li>
            <li>Choose quantity, then pay escrow with USDT or your wallet balance.</li>
            <li>Chat stays open until the seller delivers and you confirm.</li>
          </ol>
        </div>
      ) : null}
      {panel === "escrow" ? (
        <div className="card hl-card" style={{ marginTop: 12 }}>
          <h3>How escrow works</h3>
          <p>The buyer pays SocialsFlip, not the seller. Funds stay held until delivery is confirmed. Admin can hold, refund, or complete the deal.</p>
        </div>
      ) : null}
      {panel === "fees" ? (
        <div className="card hl-card" style={{ marginTop: 12 }}>
          <h3>Fee and trust</h3>
          <p>The escrow fee is added at checkout. A seller’s trust percent follows their star rating. Under 80% the profile shows a warning.</p>
        </div>
      ) : null}
      {panel === "rules" ? (
        <div className="card hl-card" style={{ marginTop: 12 }}>
          <h3>Rules and safety</h3>
          <p>Pay only the escrow wallets. Do not send USDT on the wrong network. Keep transfer emails and delivery notes inside the deal.</p>
        </div>
      ) : null}
      {panel === "chats" ? (
        <div className="card hl-card" style={{ marginTop: 12 }}>
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
