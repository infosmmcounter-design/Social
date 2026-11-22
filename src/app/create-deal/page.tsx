"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CATEGORIES, isFreelanceCategory } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";

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
    <section className="sec" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("createDeal.title")}</h1>
      <p className="mut">{t("createDeal.sub")}</p>

      <div className="card">
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
          <p className="sm mut">
            Creating as <b>{user.name}</b> ({user.email})
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

        <div className="note sm" style={{ marginTop: 12 }}>
          {t("deal.holdGuide")}
        </div>

        {err ? <p className="err">{err}</p> : null}
        {msg ? <p className="okmsg">{msg}</p> : null}

        <button
          className="btn"
          style={{ marginTop: 12 }}
          disabled={busy}
          onClick={create}
        >
          {busy ? "…" : t("createDeal.create")}
        </button>

        {link ? (
          <div className="card f" style={{ marginTop: 14 }}>
            <label>Share this link with your buyer</label>
            <input readOnly value={link} onFocus={(e) => e.target.select()} />
            <button
              className="btn s"
              style={{ marginTop: 8 }}
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(link);
                setMsg("Link copied.");
              }}
            >
              {t("createDeal.copy")}
            </button>
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
