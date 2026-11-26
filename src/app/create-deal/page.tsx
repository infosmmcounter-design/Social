"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORIES, isFreelanceCategory } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";

export default function CreateDealPage() {
  const { user } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState({
    name: "",
    email: "",
    title: "",
    cat: "youtube",
    desc: "",
    price: "",
    stock: "1",
    monetized: false,
    followers: "",
    niche: "",
    privateHandle: "",
  });
  const freelance = isFreelanceCategory(form.cat);
  const [link, setLink] = useState("");
  const [tempPassword, setTempPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({ ...f, name: user.name, email: user.email }));
    }
  }, [user]);

  async function create() {
    setErr("");
    setMsg("");
    setTempPassword("");
    setBusy(true);
    try {
      const stockNum = Math.max(1, Math.floor(Number(form.stock)) || 1);
      const r = await api<{
        sharePath: string;
        message: string;
        tempPassword?: string | null;
      }>("/api/offers", {
        method: "POST",
        json: {
          ...form,
          price: Number(form.price),
          stock: stockNum,
        },
      });
      const full =
        typeof window !== "undefined"
          ? `${window.location.origin}${r.sharePath}`
          : r.sharePath;
      setLink(full);
      if (r.tempPassword) setTempPassword(r.tempPassword);
      setMsg(r.message);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sec create-deal-page">
      <div className="deal-hero">
        <p className="deal-hero-kicker">Off-platform buyer · Escrow protected</p>
        <h1>{t("createDeal.title")}</h1>
        <p className="deal-hero-lead">{t("createDeal.sub")}</p>
        <ul className="deal-steps-mini">
          <li>Fill in the offer details</li>
          <li>Get a unique escrow payment link</li>
          <li>Send it to your buyer (WhatsApp, email, Telegram…)</li>
          <li>Buyer pays USDT into escrow — funds stay held until delivery</li>
        </ul>
      </div>

      <div className="card hl-card create-deal-form">
        {!user ? (
          <>
            <label>Your name (deal creator)</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <label>Your email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </>
        ) : (
          <p className="sm create-deal-as">
            Creating as <b>{user.name}</b> ({user.email})
            {!user.verified && user.role !== "admin" ? (
              <>
                {" "}
                ·{" "}
                <Link href="/account">Verify your profile</Link> before listing
                on the marketplace. Create deal links still work for off-site buyers.
              </>
            ) : null}
          </p>
        )}

        <label>Service / account title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="YouTube 1K monetized channel"
        />
        <label>Category board</label>
        <select
          value={form.cat}
          onChange={(e) => setForm({ ...form, cat: e.target.value })}
        >
          {CATEGORIES.map(([k, n]) => (
            <option key={k} value={k}>
              {n}
            </option>
          ))}
        </select>
        <label>{freelance ? "Gig niche / skill" : "Niche"}</label>
        <input
          value={form.niche}
          onChange={(e) => setForm({ ...form, niche: e.target.value })}
        />
        {!freelance ? (
          <>
            <label>Followers / subscribers</label>
            <input
              value={form.followers}
              onChange={(e) => setForm({ ...form, followers: e.target.value })}
            />
            <label>
              <input
                type="checkbox"
                checked={form.monetized}
                onChange={(e) =>
                  setForm({ ...form, monetized: e.target.checked })
                }
                style={{ width: "auto", marginRight: 8 }}
              />
              Monetized
            </label>
          </>
        ) : null}
        <label>Description</label>
        <textarea
          rows={4}
          value={form.desc}
          onChange={(e) => setForm({ ...form, desc: e.target.value })}
          placeholder={
            freelance
              ? "What the buyer gets, delivery details…"
              : "What the buyer gets, transfer method…"
          }
        />
        {!freelance ? (
          <>
            <label>{t("createDeal.privateOptional")}</label>
            <input
              value={form.privateHandle}
              onChange={(e) =>
                setForm({ ...form, privateHandle: e.target.value })
              }
              placeholder="Optional — share later in escrow chat"
            />
          </>
        ) : null}
        <label>Price (USD)</label>
        <input
          type="number"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />
        {!freelance ? (
          <>
            <label>Stock</label>
            <input
              type="number"
              min={1}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
          </>
        ) : (
          <p className="sm mut">
            No stock — buyers see how many times the gig was purchased.
          </p>
        )}

        <div className="hl-card deal-hold">{t("deal.holdGuide")}</div>

        {err ? <p className="err">{err}</p> : null}
        {msg ? <p className="okmsg">{msg}</p> : null}

        <button
          className="btn"
          style={{ marginTop: 12, width: "100%" }}
          disabled={busy}
          onClick={create}
        >
          {busy ? "…" : t("createDeal.create")}
        </button>

        {link ? (
          <div className="card f hl-card" style={{ marginTop: 14 }}>
            <label>Share this link with your buyer</label>
            <input readOnly value={link} onFocus={(e) => e.target.select()} />
            <div className="row" style={{ marginTop: 8, flexWrap: "wrap", gap: 8 }}>
              <button
                className="btn s"
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(link);
                  setMsg("Link copied.");
                }}
              >
                {t("createDeal.copy")}
              </button>
              {"share" in navigator ? (
                <button
                  className="btn s o"
                  type="button"
                  onClick={() =>
                    navigator.share({
                      title: form.title || "SocialsFlip deal",
                      text: "Pay safely with SocialsFlip escrow",
                      url: link,
                    }).catch(() => undefined)
                  }
                >
                  Share…
                </button>
              ) : null}
            </div>
            {tempPassword ? (
              <div className="note" style={{ marginTop: 12 }}>
                <p className="sm" style={{ margin: 0 }}>
                  Save this temporary login password to manage the deal later
                  (email: <b>{form.email}</b>):
                </p>
                <input
                  readOnly
                  value={tempPassword}
                  onFocus={(e) => e.target.select()}
                  style={{ marginTop: 8 }}
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
