"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { money } from "@/lib/constants";
import { CATEGORIES } from "@/lib/types";
import { showsMonetized } from "@/lib/category-filters";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { CatIcon } from "@/components/Icons";
import { VerifiedTick } from "@/components/VerifiedTick";
import { QtyPicker } from "@/components/QtyPicker";

export default function OfferPage() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const { t, locale } = useLang();
  const router = useRouter();
  const [data, setData] = useState<{
    offer: {
      id: number;
      token: string;
      title: string;
      cat: string;
      desc: string;
      price: number;
      stock: number;
      monetized: boolean;
      followers: string;
      niche: string;
      status: string;
      orderId: number | null;
    };
    listing: { id: number; img?: string; soldOut?: boolean; stock?: number } | null;
    creator: {
      id: number;
      name: string;
      verified?: boolean;
      country?: string;
      avatarUrl?: string;
    } | null;
    settings: {
      escrowHoldDays: number;
      deliveryWindowHours: number;
      fee: number;
      wallets: { asset: string; network: string; address: string }[];
    };
  } | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [det, setDet] = useState("");
  const [qty, setQty] = useState(1);
  const [coin, setCoin] = useState("USDT (TRC20)");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  useEffect(() => {
    api<NonNullable<typeof data>>(
      `/api/offers?token=${encodeURIComponent(token)}&lang=${encodeURIComponent(locale)}`
    )
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Not found"));
  }, [token, locale]);

  if (err && !data) return <p className="sec err">{err}</p>;
  if (!data) return <p className="sec mut">{t("common.loading")}</p>;

  const { offer, listing, creator, settings } = data;
  const catName = CATEGORIES.find((c) => c[0] === offer.cat)?.[1] || offer.cat;
  const freelance = !!(
    offer.cat === "freelance" ||
    (listing as { isFreelance?: boolean; listingType?: string } | null)
      ?.isFreelance ||
    (listing as { listingType?: string } | null)?.listingType === "service"
  );
  const available = freelance
    ? null
    : Math.max(0, Math.floor(listing?.stock ?? offer.stock ?? 1));
  const qtyOver = available !== null && qty > available;
  const line = Math.round(offer.price * qty * 100) / 100;
  const fee = Math.round(line * (settings.fee || 10)) / 100;
  const total = line + fee;
  const soldOut =
    !freelance &&
    (offer.status !== "open" ||
      listing?.soldOut ||
      (listing?.stock !== undefined && listing.stock <= 0));
  const sold =
    (listing as { soldCount?: number } | null)?.soldCount ?? 0;

  async function placeOrder() {
    if (qtyOver) {
      setErr(t("listing.qtyOver"));
      return;
    }
    setErr("");
    setBusy(true);
    try {
      const res = await api<{ order: { id: number } }>("/api/orders", {
        method: "POST",
        json: {
          offerToken: token,
          listingId: listing?.id,
          email,
          name,
          det,
          qty,
          coin,
        },
      });
      router.push(
        withLocalePrefix(
          `/deal/${res.order.id}?email=${encodeURIComponent(email.trim())}`,
          locale
        )
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="sec">
      <p className="pill w">Created deal · Escrow protected</p>
      <h1 style={{ fontSize: "1.85rem", marginTop: 8 }}>{offer.title}</h1>
      <div className="row">
        <span
          className="pill"
          style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
        >
          <CatIcon cat={offer.cat} size={14} />
          {catName}
        </span>
        {showsMonetized(offer.cat) ? (
          <span className={`pill ${offer.monetized ? "g" : ""}`}>
            {offer.monetized ? t("card.monetized") : t("card.notMonetized")}
          </span>
        ) : null}
        <span className="pill">
          {freelance
            ? `${sold} ${t("freelance.sold")}`
            : soldOut
              ? t("common.soldOut")
              : `${listing?.stock ?? offer.stock} ${t("common.available")}`}
        </span>
      </div>

      {listing?.img ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.img}
          alt=""
          style={{
            width: "100%",
            maxHeight: 220,
            objectFit: "cover",
            borderRadius: 12,
            marginTop: 14,
          }}
        />
      ) : null}

      <p className="sm mut" style={{ marginTop: 12 }}>
        {offer.niche ? `${offer.niche} · ` : ""}
        {offer.followers || "—"}
      </p>
      <p style={{ whiteSpace: "pre-wrap" }}>{offer.desc}</p>

      {creator ? (
        <div className="card f" style={{ marginTop: 12 }}>
          <div className="row" style={{ gap: 10, alignItems: "center" }}>
            {creator.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={creator.avatarUrl}
                alt=""
                style={{ width: 44, height: 44, borderRadius: "50%" }}
              />
            ) : null}
            <div>
              <b>
                Deal creator: {creator.name}
                {creator.verified ? <VerifiedTick size={14} /> : null}
              </b>
              <p className="sm mut" style={{ margin: 0 }}>
                {creator.country || "Seller"} · {t("offer.creatorPaidByUs")}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="note sm" style={{ marginTop: 14 }}>
        <b>{t("offer.guideTitle")}</b>
        <ol style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          <li>
            Place the order below. A 3-way chat opens: <b>you (buyer)</b>,{" "}
            <b>deal creator</b>, and <b>Admin / Escrow</b>.
          </li>
          <li>
            Pay <b>only SocialsFlip escrow</b> in USDT (TRC20 or BEP20) — never
            send money directly to the creator.
          </li>
          <li>
            Payment stays <b>held in escrow until the deal is completed</b>{" "}
            (typically up to {settings.escrowHoldDays} days, or until you confirm
            delivery — whichever comes with completion).
          </li>
          <li>
            After funds are held, creator has {settings.deliveryWindowHours}{" "}
            hours to deliver. If they miss it, you can cancel / claim refund.
          </li>
          <li>
            When you confirm receipt, escrow releases payment to the creator.
          </li>
        </ol>
      </div>

      <div className="card" style={{ marginTop: 16, maxWidth: 480 }}>
        <h2>Place order &amp; pay escrow</h2>
        {offer.status === "ordered" && offer.orderId ? (
          <p className="okmsg">
            This link already has an order.{" "}
            <Link href={`/deal/${offer.orderId}`}>Open deal chat</Link>
          </p>
        ) : null}
        {soldOut && offer.status === "open" ? (
          <p className="err">Sold out.</p>
        ) : null}

        <label>Your name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <label>Your email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label>Transfer notes</label>
        <input
          value={det}
          onChange={(e) => setDet(e.target.value)}
          placeholder="Email to receive ownership"
        />
        <QtyPicker
          value={qty}
          onChange={setQty}
          max={available}
          label={t("listing.quantity")}
          overText={t("listing.qtyOver")}
          availableText={
            available === null
              ? undefined
              : `${available} ${t("common.available")}`
          }
        />
        <label>Pay with</label>
        <select value={coin} onChange={(e) => setCoin(e.target.value)}>
          <option value="USDT (TRC20)">USDT (TRC20) — Tron</option>
          <option value="USDT (BEP20)">USDT (BEP20) — BNB Smart Chain</option>
        </select>

        <div className="sum" style={{ marginTop: 12 }}>
          <div>
            <span>
              {t("common.price")} · {money(offer.price)} {t("listing.each")} × {qty}
            </span>
            <span>{money(line)}</span>
          </div>
          <div>
            <span>{t("common.escrowFee")}</span>
            <span>{money(fee)}</span>
          </div>
          <div className="t">
            <span>{t("common.total")}</span>
            <span>{money(total)}</span>
          </div>
        </div>

        {err ? <p className="err">{err}</p> : null}
        <button
          className="btn"
          style={{ width: "100%", marginTop: 10 }}
          disabled={busy || soldOut || qtyOver || offer.status !== "open"}
          onClick={placeOrder}
        >
          {busy ? t("listing.opening") : t("offer.payEscrow")}
        </button>
      </div>
    </section>
  );
}
