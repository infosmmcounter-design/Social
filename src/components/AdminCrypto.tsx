"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type Row = {
  id: string;
  orderId: number;
  networkLabel: string;
  status: string;
  expected: string;
  received: string | null;
  address: string;
  txHash: string | null;
  explorer: string | null;
  confirmations: number;
  createdAt: string;
  expiresAt: string;
  confirmedAt: string | null;
  reason: string | null;
  orderStatus: string | null;
};

type Unmatched = {
  txHash: string;
  networkLabel: string;
  amount: string;
  reason: string;
  confirmations: number;
  blockTime: string | null;
  explorer: string;
  toAddress: string;
};

export function AdminCrypto() {
  const [payments, setPayments] = useState<Row[]>([]);
  const [unmatched, setUnmatched] = useState<Unmatched[]>([]);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    const d = await api<{ payments: Row[]; unmatched: Unmatched[] }>("/api/admin/crypto");
    setPayments(d.payments);
    setUnmatched(d.unmatched);
  }, []);

  useEffect(() => {
    load().catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [load]);

  async function accept(orderId: number, txHash: string) {
    setErr("");
    try {
      await api("/api/admin/crypto", { method: "POST", json: { orderId, txHash } });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  const shown =
    filter === "all" ? payments : payments.filter((p) => p.status === filter);

  return (
    <div>
      <h2>Crypto payments</h2>
      <p className="sm mut">
        Chain checks mark an order paid. A pasted hash never does. Late, underpaid, and unmatched transfers stay here for review.
      </p>
      {err ? <p className="err">{err}</p> : null}
      <div className="row" style={{ margin: "10px 0" }}>
        {["all", "waiting", "paid", "expired", "late", "underpaid", "overpaid", "needs_review"].map((k) => (
          <button key={k} className={`btn s ${filter === k ? "" : "o"}`} type="button" onClick={() => setFilter(k)}>
            {k}
          </button>
        ))}
        <button className="btn s o" type="button" onClick={() => load().catch(() => undefined)}>
          Refresh
        </button>
      </div>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Status</th>
              <th>Network</th>
              <th>Expected</th>
              <th>Received</th>
              <th>Tx</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((p) => (
              <tr key={p.id}>
                <td>#{p.orderId}</td>
                <td>
                  {p.status}
                  {p.orderStatus ? ` / ${p.orderStatus}` : ""}
                  {p.reason ? <div className="sm">{p.reason}</div> : null}
                </td>
                <td>{p.networkLabel}</td>
                <td>{p.expected}</td>
                <td>{p.received || "—"}</td>
                <td>
                  {p.txHash && p.explorer ? (
                    <a href={p.explorer} target="_blank" rel="noreferrer">
                      {p.txHash.slice(0, 8)}…
                    </a>
                  ) : (
                    "—"
                  )}
                  {p.txHash && p.status !== "paid" ? (
                    <div>
                      <button className="btn s" type="button" onClick={() => accept(p.orderId, p.txHash!)}>
                        Accept
                      </button>
                    </div>
                  ) : null}
                </td>
                <td className="sm">
                  {p.createdAt.slice(0, 16).replace("T", " ")}
                  <br />
                  due {p.expiresAt.slice(0, 16).replace("T", " ")}
                </td>
              </tr>
            ))}
            {!shown.length ? (
              <tr>
                <td colSpan={7}>No payments in this view.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginTop: 18 }}>Unmatched transactions</h3>
      <div className="tbl">
        <table>
          <thead>
            <tr>
              <th>Network</th>
              <th>Amount</th>
              <th>Why</th>
              <th>Tx</th>
            </tr>
          </thead>
          <tbody>
            {unmatched.map((u) => (
              <tr key={u.txHash}>
                <td>{u.networkLabel}</td>
                <td>{u.amount}</td>
                <td>{u.reason}</td>
                <td>
                  <a href={u.explorer} target="_blank" rel="noreferrer">
                    {u.txHash.slice(0, 10)}…
                  </a>
                  <form
                    className="row"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = new FormData(e.currentTarget).get("orderId");
                      accept(Number(input), u.txHash);
                    }}
                  >
                    <input name="orderId" placeholder="Order #" style={{ maxWidth: 90 }} />
                    <button className="btn s" type="submit">
                      Attach
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {!unmatched.length ? (
              <tr>
                <td colSpan={4}>No unmatched transfers.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
