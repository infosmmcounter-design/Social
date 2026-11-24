"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CatIcon } from "./Icons";
import { VerifiedTick } from "./VerifiedTick";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { useAuth } from "./AuthProvider";
import { api } from "@/lib/api";
import { ESCROW_FEE_PCT, money } from "@/lib/constants";
import { isFreelanceCategory } from "@/lib/types";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import type { MsgKey } from "@/lib/i18n/messages";

type Props = {
  listing: {
    id: number;
    title: string;
    cat: string;
    price: number;
    img?: string;
    monetized?: boolean;
    followers?: string;
    stock?: number;
    soldCount?: number;
    soldOut?: boolean;
    listingType?: string;
    isFreelance?: boolean;
    deliveryDays?: number;
    revisions?: number;
    niche?: string;
    seller?: {
      id?: number;
      name: string;
      country?: string;
      official?: boolean;
      verified?: boolean;
      rating?: number;
      reviewCount?: number;
      avatarUrl?: string;
    } | null;
  };
};

export function ListingCard({ listing }: Props) {
  const { t, locale } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const catKey = `cat.${listing.cat}` as MsgKey;
  const catName = t(catKey) === catKey ? listing.cat : t(catKey);
  const s = listing.seller;
  const freelance =
    isFreelanceCategory(listing.cat) ||
    listing.isFreelance ||
    listing.listingType === "service";
  const soldOut =
    !freelance &&
    (listing.soldOut || (listing.stock !== undefined && listing.stock <= 0));

  async function buy() {
    setErr("");
    if (soldOut) return;
    if (!user) {
      router.push(withLocalePrefix(`/listing/${listing.id}`, locale));
      return;
    }
    setBusy(true);
    try {
      const res = await api<{ order: { id: number } }>("/api/orders", {
        method: "POST",
        json: {
          listingId: listing.id,
          email: user.email,
          name: user.name,
          det: user.email || "Shared in the deal chat",
          qty: 1,
          coin: "USDT (TRC20)",
          paymentMode: "escrow_crypto",
        },
      });
      router.push(withLocalePrefix(`/deal/${res.order.id}`, locale));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not place the order");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="card lc">
      <Link className="lc-link" href={`/listing/${listing.id}`}>
        <div className="im">
          {listing.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={listing.img} alt="" />
          ) : (
            <CatIcon cat={listing.cat} size={48} />
          )}
          {soldOut ? <span className="stock-badge sold">{t("common.soldOut")}</span> : null}
        </div>
        <div className="bd2">
          <span className="pill" style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
            <CatIcon cat={listing.cat} size={14} />
            {catName}
          </span>
          <h3>{listing.title}</h3>
          <p className="sm mut lc-seller">
            {s?.official ? "SocialsFlip" : s?.name || t("card.seller")}
            {s?.verified ? <VerifiedTick size={14} /> : null}
          </p>
          <div className="price">{money(listing.price)}</div>
          <p className="fee-note">+ {ESCROW_FEE_PCT}% {t("common.escrowFee")}</p>
        </div>
      </Link>
      <div className="lc-foot">
        <button className="btn buy-go" type="button" disabled={busy || soldOut} onClick={buy}>
          {busy ? "…" : soldOut ? t("common.soldOut") : "Buy"}
        </button>
        {err ? <p className="err sm">{err}</p> : null}
      </div>
    </article>
  );
}
