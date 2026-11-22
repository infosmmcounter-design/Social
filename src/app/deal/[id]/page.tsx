"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import { DEAL_STATUS_LABEL, type DealStatus } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";

type Order = {
  id: number;
  title: string;
  status: DealStatus;
  total: number;
  price: number;
  fee: number;
  coin: string;
  paymentInstructions: string;
  paymentProof: string;
  buyerMarkedPaid?: boolean;
  paymentDueAt?: string | null;
  paymentWindowMins?: number;
  deliveryDueAt?: string | null;
  deliveryWindowHours?: number;
  deliveredAt?: string | null;
  buyerName: string;
  buyerEmail: string;
  det: string;
  qty?: number;
  handleRevealed: boolean;
  privateHandle: string | null;
  msgs: { id: number; from: string; text: string; createdAt: string }[];
  sellerId: number;
  buyerId: number | null;
};

function formatRemain(ms: number) {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0)
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function DealInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const emailQ = search.get("email") || "";
  const { user } = useAuth();
  const { t, locale } = useLang();
  const [order, setOrder] = useState<Order | null>(null);
  const [seller, setSeller] = useState<{
    name: string;
    dummy?: boolean;
    verified?: boolean;
  } | null>(null);
  const [wallets, setWallets] = useState<
    { asset: string; network: string; address: string }[]
  >([]);
  const [txHash, setTxHash] = useState("");
  const [text, setText] = useState("");
  const [asRole, setAsRole] = useState<"admin" | "seller">("admin");
  const [stars, setStars] = useState(5);
  const [review, setReview] = useState("");
  const [sellerReview, setSellerReview] = useState("");
  const [sellerStars, setSellerStars] = useState(5);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [now, setNow] = useState(Date.now());

  const load = useCallback(async () => {
    const q = emailQ ? `&email=${encodeURIComponent(emailQ)}` : "";
    const d = await api<{
      order: Order;
      seller: { name: string; dummy?: boolean; verified?: boolean } | null;
      wallets: { asset: string; network: string; address: string }[];
    }>(`/api/orders?id=${id}${q}`);
    setOrder(d.order);
    setSeller(d.seller);
    setWallets(d.wallets || []);
  }, [id, emailQ]);

  useEffect(() => {
    load().catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      load().catch(() => undefined);
    }, 4000);
    return () => clearInterval(t);
  }, [load]);

  const isBuyer =
    !!order &&
    ((user &&
      (user.id === order.buyerId ||
        user.email.toLowerCase() === order.buyerEmail.toLowerCase())) ||
      (!!emailQ &&
        emailQ.toLowerCase() === order.buyerEmail.toLowerCase()));
  const isSeller = !!user && !!order && user.id === order.sellerId;
  const isAdmin = user?.role === "admin";
  const adminAsDummy = isAdmin && seller?.dummy;

  const remainMs = useMemo(() => {
    if (!order?.paymentDueAt) return 0;
    return new Date(order.paymentDueAt).getTime() - now;
  }, [order?.paymentDueAt, now]);

  const deliveryRemainMs = useMemo(() => {
    if (!order?.deliveryDueAt) return 0;
    return new Date(order.deliveryDueAt).getTime() - now;
  }, [order?.deliveryDueAt, now]);

  const expired =
    !!order &&
    order.status === "awaiting_payment" &&
    !!order.paymentDueAt &&
    remainMs <= 0;

  const deliveryOverdue =
    !!order &&
    order.status === "funds_held" &&
    !order.deliveredAt &&
    !!order.deliveryDueAt &&
    deliveryRemainMs <= 0;

  async function setStatus(status: DealStatus) {
    setErr("");
    try {
      await api(`/api/orders/${id}/status`, {
        method: "POST",
        json: { status, email: emailQ || order?.buyerEmail },
      });
      await load();
      setMsg(`Status → ${DEAL_STATUS_LABEL[status]}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function submitProof(markPaidOnly = false) {
    setErr("");
    setMsg("");
    try {
      await api(`/api/orders/${id}/proof`, {
        method: "POST",
        json: {
          txHash: markPaidOnly ? "" : txHash,
          markPaidOnly,
          email: emailQ || order?.buyerEmail,
        },
      });
      setTxHash("");
      await load();
      setMsg(
        markPaidOnly
          ? "Marked as paid — seller & admin notified. Add TX hash when ready."
          : "Payment proof sent. Seller notified."
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function send() {
    if (!text.trim()) return;
    setErr("");
    try {
      await api(`/api/orders/${id}/messages`, {
        method: "POST",
        json: {
          text,
          asRole: isAdmin ? asRole : undefined,
          email: emailQ || order?.buyerEmail,
        },
      });
      setText("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  async function postReview(about: "seller" | "buyer") {
    setErr("");
    try {
      await api("/api/reviews", {
        method: "POST",
        json: {
          orderId: order!.id,
          stars: about === "seller" ? stars : sellerStars,
          text: about === "seller" ? review : sellerReview,
          about,
          locale,
          email: emailQ || order?.buyerEmail,
        },
      });
      setMsg(
        about === "seller"
          ? "Public seller review posted in your selected language."
          : "Buyer review posted."
      );
      if (about === "seller") setReview("");
      else setSellerReview("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  if (!order) {
    return <p className="sec mut">{err || "Loading deal…"}</p>;
  }

  const sellerName = seller?.name || "Seller";
  const roleLabel = (from: string) => {
    if (from === "seller") return sellerName;
    if (from === "admin" || from === "escrow") return "Escrow";
    if (from === "buyer") return order.buyerName || "Buyer";
    return from;
  };

  const wallet =
    wallets.find((w) =>
      order.coin.toUpperCase().includes("BEP")
        ? w.asset.includes("BEP")
        : w.asset.includes("TRC")
    ) || wallets[0];

  const steps: DealStatus[] = [
    "awaiting_payment",
    "funds_held",
    "credentials_shared",
    "completed",
  ];

  return (
    <section className="sec">
      <Link className="mut sm" href="/orders">
        ← Orders
      </Link>
      <h1 style={{ fontSize: "1.7rem", marginTop: 8 }}>
        Deal #{order.id}: {order.title}
      </h1>
      <p className="sm mut">
        Status: <b>{DEAL_STATUS_LABEL[order.status]}</b> · Qty{" "}
        {order.qty || 1} · Total {money(order.total)} · {order.coin}
      </p>

      <div className="steps">
        {steps.map((s) => (
          <span key={s} className={order.status === s ? "on" : ""}>
            {DEAL_STATUS_LABEL[s]}
          </span>
        ))}
        {order.status === "disputed" ? (
          <span className="on">{DEAL_STATUS_LABEL.disputed}</span>
        ) : null}
      </div>

      {err ? <p className="err">{err}</p> : null}
      {msg ? <p className="okmsg">{msg}</p> : null}

      {(isSeller || adminAsDummy) &&
      (order.buyerMarkedPaid || order.paymentProof) &&
      order.status === "awaiting_payment" ? (
        <div className="seller-alert">
          Buyer says payment is done
          {order.paymentProof ? ` — TX: ${order.paymentProof}` : ""}. Waiting for
          escrow confirmation.
        </div>
      ) : null}

      {order.status === "funds_held" && order.deliveryDueAt ? (
        <div className={`pay-timer ${deliveryOverdue ? "expired" : ""}`}>
          <span>
            {deliveryOverdue
              ? `Seller missed the ${order.deliveryWindowHours || 24}h delivery window.`
              : `Seller must deliver within ${order.deliveryWindowHours || 24} hours`}
          </span>
          <span className="clock" aria-live="polite">
            {deliveryOverdue ? "00:00:00" : formatRemain(deliveryRemainMs)}
          </span>
          {isBuyer && deliveryOverdue ? (
            <div className="row" style={{ width: "100%", marginTop: 4 }}>
              <button
                className="btn s d"
                type="button"
                onClick={() => setStatus("refunded")}
              >
                {t("deal.claimRefund")}
              </button>
              <button
                className="btn s o"
                type="button"
                onClick={() => setStatus("cancelled")}
              >
                {t("deal.cancel")}
              </button>
            </div>
          ) : null}
          {isBuyer && !deliveryOverdue ? (
            <p className="sm" style={{ width: "100%", margin: "4px 0 0" }}>
              If the seller does not deliver before this timer ends, you can
              cancel or claim a refund here.
            </p>
          ) : null}
          {(isSeller || adminAsDummy) && !deliveryOverdue ? (
            <p className="sm" style={{ width: "100%", margin: "4px 0 0" }}>
              Deliver now — use “Share credentials” before the timer hits zero.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="card f">
        <h3>{t("deal.escrowPay")}</h3>
        {order.status === "awaiting_payment" && order.paymentDueAt ? (
          <div className={`pay-timer ${expired ? "expired" : ""}`}>
            <span>
              {expired
                ? "Payment window ended — you can still pay & come back; escrow will verify."
                : `Pay within ${order.paymentWindowMins || 60} min window`}
            </span>
            <span className="clock" aria-live="polite">
              {expired ? "00:00" : formatRemain(remainMs)}
            </span>
          </div>
        ) : null}

        {wallet?.address ? (
          <p>
            Send <b>{money(order.total)}</b> USDT to:
            <br />
            <code style={{ wordBreak: "break-all" }}>{wallet.address}</code>
            <br />
            <span className="sm mut">
              Network: {wallet.network} ({wallet.asset})
            </span>
          </p>
        ) : (
          <p className="err">Escrow wallet not configured yet.</p>
        )}
        <p className="sm mut" style={{ marginTop: 8 }}>
          {order.paymentInstructions}
        </p>
        {order.buyerMarkedPaid || order.paymentProof ? (
          <p className="okmsg">
            {order.paymentProof
              ? `Proof submitted: ${order.paymentProof}`
              : "Buyer marked payment as done (awaiting TX / confirmation)."}
          </p>
        ) : null}

        {isBuyer && order.status === "awaiting_payment" ? (
          <div style={{ marginTop: 12 }}>
            <label>TX hash / payment proof</label>
            <div className="row" style={{ flexWrap: "nowrap" }}>
              <input
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste transaction hash after sending USDT"
              />
            </div>
            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="btn"
                type="button"
                onClick={() => submitProof(false)}
                disabled={!txHash.trim()}
              >
                {t("deal.iPaid")}
              </button>
              <button
                className="btn o"
                type="button"
                onClick={() => submitProof(true)}
              >
                Mark paid (TX later)
              </button>
              <Link className="btn o" href="/">
                {t("deal.comeAgain")}
              </Link>
            </div>
            <p className="sm mut" style={{ marginTop: 8 }}>
              You can leave and return anytime — this deal stays open. Seller is
              notified when you mark payment done.
            </p>
          </div>
        ) : null}
      </div>

      <div className="note sm">
        <b>Buyer:</b> {order.buyerName} ({order.buyerEmail}) · <b>Seller:</b>{" "}
        {seller?.name}
        {isAdmin && seller?.dummy ? " (dummy — admin can reply)" : ""}
        <br />
        <b>Transfer notes:</b> {order.det}
        {order.handleRevealed && order.privateHandle ? (
          <>
            <br />
            <b>Private handle:</b> {order.privateHandle}
          </>
        ) : order.handleRevealed ? (
          <>
            <br />
            <b>Private handle:</b> Share in chat if not set on listing
          </>
        ) : (
          <>
            <br />
            <b>Private handle:</b> {t("listing.privateHidden")}
          </>
        )}
      </div>

      <div className="row" style={{ marginBottom: 12 }}>
        {isAdmin ? (
          <>
            <button
              className="btn s"
              disabled={order.status !== "awaiting_payment"}
              onClick={() => setStatus("funds_held")}
            >
              Confirm payment / Hold funds
            </button>
            <button className="btn s g" onClick={() => setStatus("completed")}>
              Release funds / Complete
            </button>
            <button className="btn s d" onClick={() => setStatus("disputed")}>
              Mark disputed
            </button>
            <button className="btn s o" onClick={() => setStatus("cancelled")}>
              Cancel deal
            </button>
            <button className="btn s o" onClick={() => setStatus("refunded")}>
              Refund buyer
            </button>
          </>
        ) : null}
        {(isSeller || adminAsDummy) && (
          <button
            className="btn s"
            disabled={!["funds_held", "awaiting_payment"].includes(order.status)}
            onClick={() => setStatus("credentials_shared")}
          >
            Mark delivered / transfer done
          </button>
        )}
        {isBuyer && (
          <>
            <button
              className="btn s"
              disabled={order.status !== "credentials_shared"}
              onClick={() => setStatus("completed")}
              title="Confirm only after seller shared credentials / delivery"
            >
              Confirm I received it
            </button>
            {order.status === "awaiting_payment" ? (
              <button
                className="btn s o"
                type="button"
                onClick={() => setStatus("cancelled")}
              >
                {t("deal.cancel")}
              </button>
            ) : null}
            <button
              className="btn s d"
              disabled={
                ![
                  "awaiting_payment",
                  "funds_held",
                  "credentials_shared",
                ].includes(order.status)
              }
              onClick={() => setStatus("disputed")}
            >
              Open dispute
            </button>
          </>
        )}
      </div>

      <h2>{t("deal.chat")}</h2>
      <div className="chat" role="log">
        {order.msgs.map((m) => (
          <div key={m.id} className={`m ${m.from}`}>
            <small>
              {roleLabel(m.from)} · {new Date(m.createdAt).toLocaleString()}
            </small>
            {m.text}
          </div>
        ))}
      </div>
      <div className="row" style={{ marginTop: 8, flexWrap: "nowrap" }}>
        {isAdmin ? (
          <select
            value={asRole}
            onChange={(e) => setAsRole(e.target.value as "admin" | "seller")}
            style={{ width: "auto" }}
          >
            <option value="admin">{t("deal.asEscrow")}</option>
            <option value="seller">As {sellerName}</option>
          </select>
        ) : null}
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message to buyer, seller and escrow"
          aria-label="Message"
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <button className="btn" onClick={send}>
          {t("deal.send")}
        </button>
      </div>

      {order.status === "completed" && isBuyer ? (
        <div className="card f" style={{ marginTop: 16 }}>
          <h3>{t("reviews.reviewSeller")}</h3>
          <p className="sm mut">{t("reviews.publicNote")}</p>
          <label>{t("reviews.rating")}</label>
          <select
            value={stars}
            onChange={(e) => setStars(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
          <label>{t("reviews.yourReview")}</label>
          <textarea
            rows={3}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder={t("reviews.writeInYourLang")}
            lang={locale}
          />
          <div style={{ marginTop: 10 }}>
            <button className="btn" onClick={() => postReview("seller")}>
              {t("reviews.post")}
            </button>
          </div>
        </div>
      ) : null}

      {order.status === "completed" && (isSeller || adminAsDummy) ? (
        <div className="card f" style={{ marginTop: 16 }}>
          <h3>Review the buyer</h3>
          <label>Rating</label>
          <select
            value={sellerStars}
            onChange={(e) => setSellerStars(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
          <label>Your review</label>
          <textarea
            rows={3}
            value={sellerReview}
            onChange={(e) => setSellerReview(e.target.value)}
          />
          <div style={{ marginTop: 10 }}>
            <button className="btn" onClick={() => postReview("buyer")}>
              Post buyer review
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function DealFallback() {
  const { t } = useLang();
  return <p className="sec mut">{t("common.loading")}</p>;
}

export default function DealPage() {
  return (
    <Suspense fallback={<DealFallback />}>
      <DealInner />
    </Suspense>
  );
}
