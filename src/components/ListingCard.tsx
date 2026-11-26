"use client";

import { CatIcon } from "./Icons";
import { VerifiedTick } from "./VerifiedTick";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { ESCROW_FEE_PCT, money } from "@/lib/constants";
import { isFreelanceCategory } from "@/lib/types";
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
  const { t } = useLang();
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

  const stockLabel = freelance
    ? null
    : soldOut
      ? t("common.soldOut")
      : `${listing.stock ?? 1} left`;

  return (
    <article className="card lc">
      <Link className="lc-link" href={`/listing/${listing.id}`}>
        <div className="im">
          {listing.img ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={
                listing.img.startsWith("data:")
                  ? `/api/listings/${listing.id}/cover`
                  : listing.img
              }
              alt={`${listing.title} — ${catName} for sale on SocialsFlip`}
              title={listing.title}
            />
          ) : (
            <CatIcon cat={listing.cat} size={48} />
          )}
          {!freelance ? (
            <span className={`stock-badge ${soldOut ? "sold" : ""}`}>
              {soldOut
                ? t("common.soldOut")
                : `${listing.stock ?? 1} ${t("common.available")}`}
            </span>
          ) : null}
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
          {stockLabel ? <p className="sm mut lc-stock">{stockLabel}</p> : null}
          <p className="fee-note">+ {ESCROW_FEE_PCT}% {t("common.escrowFee")}</p>
        </div>
      </Link>
      <div className="lc-foot">
        {soldOut ? (
          <span className="btn buy-go" aria-disabled>
            {t("common.soldOut")}
          </span>
        ) : (
          <Link className="btn buy-go" href={`/listing/${listing.id}`}>
            Buy
          </Link>
        )}
      </div>
    </article>
  );
}
