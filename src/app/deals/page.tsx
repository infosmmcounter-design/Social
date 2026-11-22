"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import { DEAL_STATUS_LABEL, type DealStatus } from "@/lib/types";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";

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
  "disputed",
];

export default function DealsPage() {
  const { user, loading } = useAuth();
  const { t } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [onlyOpen, setOnlyOpen] = useState(true);

  useEffect(() => {
    if (!user) return;
    api<{ orders: Order[] }>("/api/orders")
      .then((d) => setOrders(d.orders || []))
      .catch(() => setOrders([]));
  }, [user]);

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

  if (loading) return <p className="sec mut">{t("common.loading")}</p>;

  return (
    <section className="sec deals-page">
      <h1 style={{ fontSize: "2rem" }}>{t("deals.title")}</h1>
      {!user ? (
        <div className="card" style={{ marginTop: 12 }}>
          <p>{t("deals.login")}</p>
          <div className="row">
            <Link className="btn" href="/auth/login">
              {t("nav.login")}
            </Link>
            <Link className="btn o" href="/auth/signup">
              {t("nav.signup")}
            </Link>
          </div>
        </div>
      ) : (
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
                      <td>
                        <Link className="btn s o" href={`/deal/${o.id}`}>
                          {t("deal.chat")}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}
