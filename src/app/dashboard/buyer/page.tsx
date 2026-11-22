"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import { DEAL_STATUS_LABEL, type DealStatus } from "@/lib/types";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

export default function BuyerDashboard() {
  const { user, loading } = useAuth();
  const { locale } = useLang();
  const router = useRouter();
  const [orders, setOrders] = useState<
    { id: number; title: string; total: number; status: DealStatus }[]
  >([]);

  useEffect(() => {
    if (!loading && !user)
      router.push(withLocalePrefix("/auth/login", locale));
  }, [user, loading, router, locale]);

  useEffect(() => {
    if (!user) return;
    api<{ orders: typeof orders }>("/api/orders").then((d) => setOrders(d.orders));
  }, [user]);

  if (loading || !user) return <p className="sec mut">Loading…</p>;

  return (
    <section className="sec">
      <h1 style={{ fontSize: "2rem" }}>Buyer dashboard</h1>
      <p className="mut">
        Welcome, {user.name}. Track escrow deals and continue chats.
      </p>
      <div className="row">
        <Link className="btn" href="/listings">
          Browse listings
        </Link>
        <Link className="btn o" href="/apply">
          Apply to sell
        </Link>
      </div>
      <h2 style={{ marginTop: 24 }}>Your deals</h2>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Total</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.title}</td>
                <td>{money(o.total)}</td>
                <td>
                  <span className="pill w">{DEAL_STATUS_LABEL[o.status]}</span>
                </td>
                <td>
                  <Link className="btn s o" href={`/deal/${o.id}`}>
                    Open chat
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!orders.length ? <p className="mut">No deals yet.</p> : null}
      </div>
    </section>
  );
}
