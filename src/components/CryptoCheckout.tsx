"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CryptoAsset, CryptoPayStatus } from "@/lib/types";

type Pay = {
  orderId: number;
  orderStatus: string;
  status: CryptoPayStatus;
  network: CryptoAsset;
  networkLabel: string;
  address: string;
  expected: string;
  received: string | null;
  txHash: string | null;
  confirmations: number;
  requiredConfirmations: number;
  expiresAt: string | null;
  serverNow: string;
  explorer: string | null;
  qrSvg: string;
  reason: string | null;
  lateNote: string;
};

const LABEL: Record<CryptoPayStatus, string> = {
  waiting: "Waiting for Payment",
  detected: "Payment Detected",
  confirming: "Confirming Transaction",
  paid: "Paid",
  expired: "Expired",
  underpaid: "Underpaid",
  overpaid: "Overpaid",
  late: "Late payment — needs review",
  needs_review: "Needs review",
  cancelled: "Cancelled",
};

export function CryptoCheckout({
  orderId,
  email,
  isBuyer,
}: {
  orderId: number;
  email: string;
  isBuyer: boolean;
}) {
  const [pay, setPay] = useState<Pay | null>(null);
  const [err, setErr] = useState("");
  const [now, setNow] = useState(Date.now());
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    const q = email ? `?email=${encodeURIComponent(email)}` : "";
    const d = await api<Pay>(`/api/orders/${orderId}/payment${q}`);
    setPay(d);
  }, [orderId, email]);

  useEffect(() => {
    load().catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => {
      setNow(Date.now());
      load().catch(() => undefined);
    }, 8000);
    return () => clearInterval(t);
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  async function copy(value: string, which: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch {
      setCopied("");
    }
  }

  async function switchNet(network: CryptoAsset) {
    setErr("");
    try {
      await api(`/api/orders/${orderId}/payment`, {
        method: "POST",
        json: { network, email },
      });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  if (!pay) return <p className="sm mut">{err || "Loading payment…"}</p>;

  const skew = pay.serverNow ? now - new Date(pay.serverNow).getTime() : 0;
  const remain = pay.expiresAt ? new Date(pay.expiresAt).getTime() - (now - skew) : 0;
  const clock = remain <= 0 ? "00:00:00" : formatRemain(remain);
  const open = pay.status === "waiting" || pay.status === "detected" || pay.status === "confirming";
  const done = pay.status === "paid" || pay.orderStatus === "funds_held";

  return (
    <div className="crypto-pay">
      <div className="crypto-pay-head">
        <div>
          <p className="crypto-kicker">Order #{pay.orderId}</p>
          <h3>Pay with USDT</h3>
        </div>
        <span className={`pay-pill ${pay.status}`}>{LABEL[pay.status]}</span>
      </div>

      <p className="crypto-amount">
        {pay.expected} <small>USDT</small>
      </p>
      <p className="sm">Send this exact amount. It belongs only to this order.</p>

      {isBuyer && open && !pay.txHash ? (
        <div className="crypto-nets">
          <button
            type="button"
            className={pay.network === "USDT_TRC20" ? "on" : ""}
            onClick={() => switchNet("USDT_TRC20")}
          >
            USDT TRC20
            <small>TRON</small>
          </button>
          <button
            type="button"
            className={pay.network === "USDT_BEP20" ? "on" : ""}
            onClick={() => switchNet("USDT_BEP20")}
          >
            USDT BEP20
            <small>BNB Smart Chain</small>
          </button>
        </div>
      ) : null}

      <div className={`crypto-net ${pay.network === "USDT_BEP20" ? "bep" : "trc"}`}>
        Network: {pay.networkLabel}. Sending on the other network can lose the funds.
      </div>

      {open ? (
        <div className={`pay-timer ${remain <= 0 ? "expired" : ""}`}>
          <span>{remain <= 0 ? "Payment window ended" : "Time left to pay"}</span>
          <span className="clock">{clock}</span>
        </div>
      ) : null}

      {pay.address ? (
        <div className="crypto-grid">
          <div className="crypto-qr" dangerouslySetInnerHTML={{ __html: pay.qrSvg }} />
          <div>
            <label>Receiving address</label>
            <code>{pay.address}</code>
            <div className="row" style={{ marginTop: 8 }}>
              <button className="btn s" type="button" onClick={() => copy(pay.address, "address")}>
                {copied === "address" ? "Copied" : "Copy address"}
              </button>
              <button className="btn s o" type="button" onClick={() => copy(pay.expected, "amount")}>
                {copied === "amount" ? "Copied" : "Copy amount"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="err">Escrow wallet is not configured yet.</p>
      )}

      {pay.txHash ? (
        <p className="sm">
          Transaction:{" "}
          {pay.explorer ? (
            <a href={pay.explorer} target="_blank" rel="noreferrer">
              {pay.txHash.slice(0, 10)}…{pay.txHash.slice(-8)}
            </a>
          ) : (
            pay.txHash
          )}
          <br />
          Confirmations: {pay.confirmations} / {pay.requiredConfirmations}
          {pay.received ? ` · Received ${pay.received} USDT` : ""}
        </p>
      ) : (
        <p className="sm mut">
          Status updates on its own. You do not need to upload a screenshot.
          {pay.network === "USDT_TRC20"
            ? " TRON usually finalizes in about a minute."
            : " BNB Smart Chain usually finalizes in about a minute."}
        </p>
      )}

      {done ? <p className="okmsg">Payment confirmed. Funds are held in escrow.</p> : null}
      {pay.reason ? <p className="sm">{pay.reason}</p> : null}
      <p className="sm mut">{pay.lateNote}</p>
      {err ? <p className="err">{err}</p> : null}
    </div>
  );
}

function formatRemain(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
