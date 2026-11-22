"use client";

import { CatIcon } from "./Icons";
import { VerifiedTick } from "./VerifiedTick";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { money, stars } from "@/lib/constants";
import { CATEGORIES, isFreelanceCategory } from "@/lib/types";

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
  const catName =
    CATEGORIES.find((c) => c[0] === listing.cat)?.[1] || listing.cat;
  const s = listing.seller;
  const freelance =
    isFreelanceCategory(listing.cat) ||
    listing.isFreelance ||
    listing.listingType === "service";
  const soldOut =
    !freelance &&
    (listing.soldOut || (listing.stock !== undefined && listing.stock <= 0));
  const sold = listing.soldCount ?? 0;

  return (
    <Link className="card lc" href={`/listing/${listing.id}`}>
      <div className="im">
        {listing.img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={listing.img} alt="" />
        ) : (
          <CatIcon cat={listing.cat} size={56} />
        )}
        {freelance ? (
          <span className="stock-badge">
            {sold} {t("freelance.sold")}
          </span>
        ) : soldOut ? (
          <span className="stock-badge sold">{t("common.soldOut")}</span>
        ) : listing.stock !== undefined && listing.stock > 0 ? (
          <span className="stock-badge">
            {listing.stock} {t("common.available")}
          </span>
        ) : null}
      </div>
      <div className="bd2">
        <span
          className="pill"
          style={{ display: "inline-flex", gap: 5, alignItems: "center" }}
        >
          <CatIcon cat={listing.cat} size={14} />
          {catName}
        </span>{" "}
        {freelance ? <span className="pill w">{t("freelance.badge")}</span> : null}{" "}
        {s?.official ? <span className="pill g">Sold by SocialsFlip</span> : null}
        {s?.verified && !s.official ? (
          <span
            className="pill bl"
            style={{ display: "inline-flex", alignItems: "center" }}
          >
            {t("common.verified")} <VerifiedTick size={12} />
          </span>
        ) : null}
        <h3 style={{ marginTop: 8 }}>{listing.title}</h3>
        <p className="sm mut" style={{ margin: "0 0 4px" }}>
          {s?.official ? "SocialsFlip" : s?.name || "Seller"}
          {s?.verified ? <VerifiedTick size={14} /> : null}
          {s?.country ? `, ${s.country}` : ""}
        </p>
        {freelance ? (
          <p className="sm mut" style={{ margin: "0 0 4px" }}>
            {listing.niche ? `${listing.niche} · ` : ""}
            {t("freelance.delivery")}{" "}
            {listing.deliveryDays || 3} {t("freelance.days")}
            {listing.revisions !== undefined
              ? ` · ${listing.revisions} ${t("freelance.revisions").toLowerCase()}`
              : ""}
          </p>
        ) : listing.followers ? (
          <p className="sm mut" style={{ margin: "0 0 4px" }}>
            {listing.followers} ·{" "}
            {listing.monetized ? "Monetized" : "Not monetized"}
          </p>
        ) : null}
        <p className="sm" style={{ margin: "0 0 6px" }}>
          {s?.reviewCount ? (
            <>
              <span className="star">{stars(s.rating || 0)}</span>{" "}
              {(s.rating || 0).toFixed(1)} ({s.reviewCount})
            </>
          ) : (
            <span className="mut">No reviews yet</span>
          )}
        </p>
        <div className="price">{money(listing.price)}</div>
      </div>
    </Link>
  );
}
