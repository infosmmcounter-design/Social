"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import { DEAL_STATUS_LABEL, type DealStatus } from "@/lib/types";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { readGuestEmail, saveGuestEmail } from "@/lib/guest-email";

type Order = {
  id: number;
  title: string;
  total: number;
  status: DealStatus;
  buyerId: number | null;
  sellerId: number;
  buyerEmail: string;
};

const OPEN: DealStatus[] = [
  "awaiting_payment",
  "funds_held",
  "credentials_shared",
  "release_requested",
  "disputed",
];

export default function DealsPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [onlyOpen, setOnlyOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loading) return;
    const saved = readGuestEmail();
    if (saved) setEmail(saved);
    if (!user && !saved) {
      setLoaded(true);
      return;
    }
    const q = !user && saved ? `?email=${encodeURIComponent(saved)}` : "";
    api<{ orders: Order[] }>(`/api/orders${q}`)
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoaded(true));
  }, [user, loading]);

  const rows = useMemo(() => {
    let list = orders;
    if (user) {
      list =
        side === "sell"
          ? list.filter((o) => o.sellerId === user.id)
          : list.filter(
              (o) =>
                o.buyerId === user.id ||
                o.buyerEmail.toLowerCase() === user.email.toLowerCase()
            );
    }
    if (onlyOpen) list = list.filter((o) => OPEN.includes(o.status));
    return list;
  }, [orders, side, onlyOpen, user]);

  if (loading || !loaded) return <p className="sec mut">{t("common.loading")}</p>;

  function nextStep(status: DealStatus) {
    if (status === "awaiting_payment") return "Pay in the deal room";
    if (status === "funds_held") return "Waiting for delivery";
    if (status === "credentials_shared") return "Tap I received it";
    if (status === "release_requested") return "Leave a review";
    return "";
  }

  return (
    <section className="sec deals-page">
      <h1 style={{ fontSize: "2rem" }}>{t("deals.title")}</h1>
      {!user ? (
        <form
          className="card"
          style={{ marginTop: 12 }}
          onSubmit={(e) => {
            e.preventDefault();
            const mail = email.trim().toLowerCase();
            saveGuestEmail(mail);
            setLoaded(false);
            api<{ orders: Order[] }>(`/api/orders?email=${encodeURIComponent(mail)}`)
              .then((d) => setOrders(d.orders || []))
              .catch(() => setOrders([]))
              .finally(() => setLoaded(true));
          }}
        >
          <p>{t("deals.login")}</p>
          <label>Or find deals with your checkout email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn" type="submit">
              Find my deals
            </button>
            <Link className="btn o" href="/auth/login">
              {t("nav.login")}
            </Link>
          </div>
        </form>
      ) : null}
      {user || orders.length ? (
        <>
          <div className="row" style={{ marginTop: 8 }}>
            <button
              type="button"
              className={`btn s ${side === "buy" ? "" : "o"}`}
              onClick={() => setSide("buy")}
            >
              {t("deals.buying")}
            </button>
            <button
              type="button"
              className={`btn s ${side === "sell" ? "" : "o"}`}
              onClick={() => setSide("sell")}
            >
              {t("deals.selling")}
            </button>
            <button type="button" className="btn s o" onClick={() => setOnlyOpen((v) => !v)}>
              {onlyOpen ? t("deals.inProgress") : t("deals.all")}
            </button>
          </div>
          {!rows.length ? (
            <div className="deals-empty">
              <div className="deals-empty-ic" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M6 7h12l-1 13H7L6 7z" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" />
                </svg>
              </div>
              <p>{side === "sell" ? t("deals.emptySell") : t("deals.emptyBuy")}</p>
              <Link className="btn" href="/listings">
                {t("deals.browse")}
              </Link>
            </div>
          ) : (
            <div className="tbl" style={{ marginTop: 16 }}>
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{t("deals.item")}</th>
                    <th>{t("common.total")}</th>
                    <th />
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id}>
                      <td>{o.id}</td>
                      <td>{o.title}</td>
                      <td>{money(o.total)}</td>
                      <td>
                        <span className="pill w">{DEAL_STATUS_LABEL[o.status]}</span>
                      </td>
                      <td className="sm">{nextStep(o.status)}</td>
                      <td>
                        <Link className="btn s o" href={`/deal/${o.id}?email=${encodeURIComponent(email || user?.email || o.buyerEmail)}`}>
                          {o.status === "credentials_shared" ? "I received it" : t("deal.chat")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
