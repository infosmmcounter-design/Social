"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import { DEAL_STATUS_LABEL, type DealStatus } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { useEffect } from "react";

type Order = {
  id: number;
  title: string;
  total: number;
  status: DealStatus;
  buyerEmail: string;
};

export default function OrdersPage() {
  const { user } = useAuth();
  const { t, locale } = useLang();
  const [orders, setOrders] = useState<Order[]>([]);
  const [to, setTo] = useState("");
  const [te, setTe] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    api<{ orders: Order[] }>("/api/orders")
      .then((d) => setOrders(d.orders))
      .catch(() => setOrders([]));
  }, [user]);

  async function findOrder() {
    setErr("");
    try {
      const d = await api<{ orders: Order[] }>(
        `/api/orders?email=${encodeURIComponent(te.trim())}`
      );
      const o = d.orders.find((x) => String(x.id) === String(to.trim()));
      if (!o) {
        setErr("No order matches those details.");
        return;
      }
      router.push(
        withLocalePrefix(
          `/deal/${o.id}?email=${encodeURIComponent(te.trim())}`,
          locale
        )
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <section className="sec" style={{ maxWidth: 640 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("orders.title")}</h1>
      <p className="mut">
        Guests can open a deal with order number + checkout email. Logged-in
        buyers see their deals below.
      </p>
      <div className="card">
        <label>Order number</label>
        <input value={to} onChange={(e) => setTo(e.target.value)} type="number" />
        <label>Email used at checkout</label>
        <input
          value={te}
          onChange={(e) => setTe(e.target.value)}
          type="email"
        />
        {err ? <p className="err">{err}</p> : null}
        <div style={{ marginTop: 12 }}>
          <button className="btn" onClick={findOrder}>
            {t("orders.track")}
          </button>
        </div>
      </div>

      {user && orders.length ? (
        <>
          <h2 style={{ marginTop: 28 }}>Your deals</h2>
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
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </section>
  );
}
