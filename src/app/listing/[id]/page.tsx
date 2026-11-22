"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CatIcon } from "@/components/Icons";
import { VerifiedTick } from "@/components/VerifiedTick";
import { StartSellerChat } from "@/components/StartSellerChat";
import { api } from "@/lib/api";
import { money, stars } from "@/lib/constants";
import { CATEGORIES, isFreelanceCategory } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { PublicReview } from "@/components/PublicReview";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { t, locale } = useLang();
  const router = useRouter();
  const [data, setData] = useState<{
    listing: Record<string, unknown>;
    seller: Record<string, unknown> | null;
    reviews: {
      stars: number;
      who: string;
      date: string;
      text: string;
      locale?: string;
    }[];
  } | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [det, setDet] = useState("");
  const [coin, setCoin] = useState("USDT (TRC20)");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [feePct, setFeePct] = useState(10);

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setName(user.name);
    }
  }, [user]);

  useEffect(() => {
    api<{
      listing: Record<string, unknown>;
      seller: Record<string, unknown> | null;
      reviews: {
        stars: number;
        who: string;
        date: string;
        text: string;
        locale?: string;
      }[];
      seo?: { title: string; description: string };
      feePct?: number;
    }>(`/api/listings/${id}?lang=${encodeURIComponent(locale)}`)
      .then((d) => {
        setData(d);
        if (typeof d.feePct === "number") setFeePct(d.feePct);
        if (d.seo?.title) document.title = d.seo.title;
        if (d.seo?.description) {
          let meta = document.querySelector('meta[name="description"]');
          if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", "description");
            document.head.appendChild(meta);
          }
          meta.setAttribute("content", d.seo.description);
        }
      })
      .catch(() => setData(null));
  }, [id, locale]);

  if (!data) return <p className="sec mut">{t("common.loading")}</p>;
  const l = data.listing as {
    id: number;
    title: string;
    cat: string;
    price: number;
    desc: string;
    teaser: string;
    niche: string;
    followers: string;
    monetized: boolean;
    img?: string;
    images?: string[];
    stock?: number;
    soldCount?: number;
    soldOut?: boolean;
    listingType?: string;
    isFreelance?: boolean;
    deliveryDays?: number;
    revisions?: number;
    privateHandle: string | null;
    handleHidden: boolean;
    sellerId: number;
  };
  const s = data.seller as {
    id: number;
    name: string;
    country: string;
    bio: string;
    official?: boolean;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
    avatarUrl?: string;
  } | null;
  const gallery = [l.img, ...(l.images || [])].filter(Boolean) as string[];

  const fee = s?.official ? 0 : Math.round(l.price * feePct) / 100;
  const total = l.price + fee;
  const catName = CATEGORIES.find((c) => c[0] === l.cat)?.[1] || l.cat;
  const freelance = !!(
    isFreelanceCategory(l.cat) ||
    l.isFreelance ||
    l.listingType === "service"
  );
  const soldOut =
    !freelance &&
    (l.soldOut || (l.stock !== undefined && l.stock <= 0));
  const sold = l.soldCount ?? 0;

  async function startDeal() {
    setErr("");
    setBusy(true);
    try {
      const res = await api<{ order: { id: number } }>("/api/orders", {
        method: "POST",
        json: {
          listingId: l.id,
          email,
          name,
          det,
          coin,
          paymentMode: "escrow_crypto",
        },
      });
      router.push(
        withLocalePrefix(
          `/deal/${res.order.id}?email=${encodeURIComponent(email)}`,
          locale
        )
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function requestPrivate() {
    setErr("");
    try {
      await api("/api/private-requests", {
        method: "POST",
        json: { listingId: l.id, email, name },
      });
      alert("Private details request sent. Seller/Admin will approve.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <section className="sec">
      <Link className="mut sm" href={`/listings?cat=${l.cat}`}>
        {t("listing.back")} · {catName}
      </Link>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))",
          marginTop: 12,
          alignItems: "start",
        }}
      >
        <div>
          {gallery[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gallery[0]}
              alt=""
              style={{ width: "100%", borderRadius: 12, marginBottom: 12 }}
            />
          ) : null}
          {gallery.length > 1 ? (
            <div className="row" style={{ marginBottom: 12 }}>
              {gallery.slice(1).map((src, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={src}
                  alt=""
                  style={{
                    width: 72,
                    height: 54,
                    objectFit: "cover",
                    borderRadius: 8,
                  }}
                />
              ))}
            </div>
          ) : null}
          <span
            className="pill"
            style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
          >
            <CatIcon cat={l.cat} size={14} />
            {catName}
          </span>{" "}
          {freelance ? (
            <span className="pill g">
              {sold} {t("freelance.sold")}
            </span>
          ) : soldOut ? (
            <span className="pill b">{t("common.soldOut")}</span>
          ) : (
            <span className="pill g">
              {l.stock ?? 1} {t("common.available")}
            </span>
          )}
          <h1 style={{ fontSize: "1.8rem", marginTop: 8 }}>{l.title}</h1>
          {freelance ? (
            <>
              <p className="sm mut">
                <span className="pill w">{t("freelance.badge")}</span>{" "}
                {l.niche ? `${l.niche} · ` : ""}
                {catName}
              </p>
              <div className="row" style={{ gap: 8, marginBottom: 10 }}>
                <span className="pill g">
                  {t("freelance.delivery")}: {l.deliveryDays || 3}{" "}
                  {t("freelance.days")}
                </span>
                <span className="pill">
                  {t("freelance.revisions")}: {l.revisions ?? 1}
                </span>
              </div>
            </>
          ) : (
            <p className="sm mut">
              {l.listingType ? `${l.listingType} · ` : ""}
              {l.niche ? `${l.niche} · ` : ""}
              {l.followers || "—"} ·{" "}
              {l.monetized ? "Monetized" : "Not monetized"}
            </p>
          )}
          <p style={{ whiteSpace: "pre-wrap" }}>{l.desc || l.teaser}</p>
          {!freelance && (l.handleHidden || l.privateHandle) ? (
            <div className="note sm">
              <b>Private handle:</b>{" "}
              {l.handleHidden
                ? t("listing.privateHidden")
                : l.privateHandle || "—"}
            </div>
          ) : null}
          {!freelance && l.handleHidden ? (
            <button className="btn o s" onClick={requestPrivate}>
              {t("listing.requestPrivate")}
            </button>
          ) : null}
          <div className="card f" style={{ marginTop: 14 }}>
            <div className="row" style={{ gap: 12, alignItems: "center" }}>
              {s?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={s.avatarUrl}
                  alt=""
                  style={{ width: 48, height: 48, borderRadius: "50%" }}
                />
              ) : null}
              <div>
                <h3 style={{ margin: 0 }}>
                  {s?.official ? "Sold directly by SocialsFlip" : s?.name}
                  {s?.verified ? <VerifiedTick size={16} /> : null}
                </h3>
                <p className="sm mut" style={{ margin: 0 }}>
                  {s?.country}{" "}
                  {s?.reviewCount
                    ? `· ${stars(s.rating || 0)} ${(s.rating || 0).toFixed(1)} (${s.reviewCount})`
                    : ""}
                </p>
              </div>
            </div>
            <p className="sm">{s?.bio}</p>
            {s ? (
              <div className="row" style={{ marginTop: 8 }}>
                <Link className="btn s o" href={`/seller/${s.id}`}>
                  {t("listing.viewSeller")}
                </Link>
                <StartSellerChat
                  sellerId={s.id}
                  sellerName={s.official ? "SocialsFlip" : s.name}
                  listingId={l.id}
                  compact
                />
              </div>
            ) : null}
          </div>
        </div>

        <div className="card">
          <h2>
            {freelance ? t("freelance.orderGig") : t("listing.startEscrow")}
          </h2>
          <p className="sm mut">{t("listing.guestNote")}</p>
          <div className="note sm">
            {freelance ? (
              <>
                <b>{t("freelance.purchased")}:</b> {sold}{" "}
                {t("freelance.soldTimes")}
                <br />
                {t("freelance.sla")}
                <br />
                <b>{t("freelance.delivery")}:</b> {l.deliveryDays || 3}{" "}
                {t("freelance.days")} · <b>{t("freelance.revisions")}:</b>{" "}
                {l.revisions ?? 1}
              </>
            ) : (
              <>
                <b>{t("listing.stockLabel")}:</b>{" "}
                {soldOut
                  ? t("common.soldOut")
                  : `${l.stock ?? 1} ${t("common.available")}`}
                <br />
                {t("listing.sla")}
              </>
            )}
          </div>
          {soldOut ? (
            <p className="err">{t("common.soldOut")}</p>
          ) : null}
          <label>{t("listing.yourName")}</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <label>{t("listing.yourEmail")}</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <label>
            {freelance ? t("freelance.notes") : t("listing.transferNotes")}
          </label>
          <input
            value={det}
            onChange={(e) => setDet(e.target.value)}
            placeholder="Email to receive ownership"
          />

          <label>{t("listing.payWith")}</label>
          <select value={coin} onChange={(e) => setCoin(e.target.value)}>
            <option value="USDT (TRC20)">USDT (TRC20) — Tron</option>
            <option value="USDT (BEP20)">USDT (BEP20) — BNB Smart Chain</option>
          </select>
          <p className="sm mut">
            Send USDT only on the network you select. Wrong network can lose
            funds. Admin confirms payment in escrow chat.
          </p>

          <div className="sum" style={{ marginTop: 12 }}>
            <div>
              <span>{t("common.price")}</span>
              <span>{money(l.price)}</span>
            </div>
            {!s?.official ? (
              <div>
                <span>
                  {t("common.escrowFee")} ({feePct}%)
                </span>
                <span>{money(fee)}</span>
              </div>
            ) : null}
            <div className="t">
              <span>{t("common.total")}</span>
              <span>{money(total)}</span>
            </div>
          </div>
          {err ? <p className="err">{err}</p> : null}
          <button
            className="btn"
            style={{ width: "100%", marginTop: 10 }}
            disabled={busy || soldOut}
            onClick={startDeal}
          >
            {busy
              ? t("listing.opening")
              : soldOut
                ? t("common.soldOut")
                : t("listing.buyNow")}
          </button>
        </div>
      </div>

      <h2 style={{ marginTop: 30 }}>{t("reviews.buyerReviews")}</h2>
      <p className="sm mut">{t("reviews.publicNote")}</p>
      {data.reviews.map((r, i) => (
        <PublicReview key={i} review={r} />
      ))}
      {!data.reviews.length ? (
        <p className="mut">{t("reviews.none")}</p>
      ) : null}
    </section>
  );
}
