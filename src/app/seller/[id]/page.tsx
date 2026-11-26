"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { VerifiedTick } from "@/components/VerifiedTick";
import { StartSellerChat } from "@/components/StartSellerChat";
import { CatIcon } from "@/components/Icons";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { PublicReview } from "@/components/PublicReview";
import { api } from "@/lib/api";
import { stars, trustFromRating } from "@/lib/constants";
import { CATEGORIES } from "@/lib/types";
import type { MsgKey } from "@/lib/i18n/messages";

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLang();
  const [shareMsg, setShareMsg] = useState("");
  const [data, setData] = useState<{
    seller: {
      id: number;
      name: string;
      country: string;
      bio: string;
      verified: boolean;
      official: boolean;
      rating: number;
      reviewCount: number;
      joinedAt: string;
      completedDeals?: number;
      avatarUrl?: string;
    };
    listings: {
      id: number;
      title: string;
      cat: string;
      price: number;
      followers?: string;
      monetized?: boolean;
      img?: string;
      stock?: number;
      soldOut?: boolean;
    }[];
    reviews: {
      stars: number;
      who: string;
      date: string;
      text: string;
      about?: string;
      locale?: string;
    }[];
  } | null>(null);

  useEffect(() => {
    api<NonNullable<typeof data>>(
      `/api/sellers/${id}?lang=${encodeURIComponent(locale)}`
    )
      .then(setData)
      .catch(() => setData(null));
  }, [id, locale]);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/seller/${id}`
      : `/seller/${id}`;

  const boards = useMemo(() => {
    if (!data) return [];
    const set = new Set(data.listings.map((l) => l.cat));
    return CATEGORIES.filter(([k]) => set.has(k));
  }, [data]);

  async function shareProfile() {
    setShareMsg("");
    const payload = {
      title: `${data?.seller.name || "Seller"} on SocialsFlip`,
      text: "View this seller profile on SocialsFlip (escrow marketplace).",
      url: profileUrl,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(profileUrl);
      setShareMsg("Profile link copied.");
    } catch {
      try {
        await navigator.clipboard.writeText(profileUrl);
        setShareMsg("Profile link copied.");
      } catch {
        setShareMsg("Could not share. Copy the URL from the address bar.");
      }
    }
  }

  if (!data) return <p className="sec mut">{t("common.loading")}</p>;
  const s = data.seller;
  const sellerReviews = data.reviews.filter(
    (r) => (r.about || "seller") === "seller"
  );
  const trust = trustFromRating(s.rating, s.reviewCount);

  return (
    <section className="sec seller-profile">
      <Link className="mut sm" href="/#sellers">
        ← {t("nav.sellers")}
      </Link>

      <div className="seller-profile-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="seller-profile-av"
          src={s.avatarUrl || ""}
          alt=""
          style={{
            border: s.verified ? "3px solid #1D9BF0" : "2px solid var(--line)",
          }}
        />
        <div className="seller-profile-main">
          <h1>
            {s.name}
            {s.verified ? <VerifiedTick size={22} /> : null}
          </h1>
          <div className="row seller-pills">
            {s.official ? <span className="pill g">Official store</span> : null}
            {s.verified ? (
              <span
                className="pill bl"
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                {t("common.verified")} <VerifiedTick size={12} />
              </span>
            ) : null}
            {s.country ? <span className="pill">{s.country}</span> : null}
          </div>
          <p className="sm" style={{ margin: "8px 0 0" }}>
            {s.reviewCount ? (
              <>
                <span className="star">{stars(s.rating)}</span>{" "}
                {s.rating.toFixed(1)} ({s.reviewCount}) · Trust {trust.percent}%
              </>
            ) : (
              <span className="mut">New seller · Trust 100%</span>
            )}
          </p>
          <p className="sm mut" style={{ margin: "4px 0 0" }}>
            Member since {new Date(s.joinedAt).toLocaleDateString()}
          </p>
          {s.reviewCount && trust.risky ? (
            <p className="err">
              Warning: people have not had a good experience with this seller.
            </p>
          ) : null}
        </div>
      </div>

      <div className="seller-stat-grid" aria-label="Seller stats">
        <div className="seller-stat">
          <strong>{data.listings.length}</strong>
          <span>Live listings</span>
        </div>
        <div className="seller-stat">
          <strong>{s.completedDeals || 0}</strong>
          <span>Completed deals</span>
        </div>
        <div className="seller-stat">
          <strong>{s.reviewCount || 0}</strong>
          <span>Reviews</span>
        </div>
        <div className="seller-stat">
          <strong>{trust.percent}%</strong>
          <span>Trust score</span>
        </div>
      </div>

      {s.bio ? <p className="seller-bio">{s.bio}</p> : null}

      {boards.length ? (
        <div className="seller-boards">
          <p className="sm mut" style={{ margin: "0 0 8px" }}>
            Sells on
          </p>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {boards.map(([k]) => (
              <Link
                key={k}
                className="seller-board-chip"
                href={`/?cat=${k}`}
              >
                <CatIcon cat={k} size={16} />
                {t(`cat.${k}` as MsgKey)}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="seller-actions">
        <StartSellerChat sellerId={s.id} sellerName={s.name} />
        <button type="button" className="btn s o" onClick={shareProfile}>
          Share profile
        </button>
        <button
          type="button"
          className="btn s o"
          onClick={async () => {
            await navigator.clipboard.writeText(profileUrl);
            setShareMsg("Profile link copied.");
          }}
        >
          Copy link
        </button>
      </div>
      {shareMsg ? <p className="okmsg sm">{shareMsg}</p> : null}

      <h2 style={{ marginTop: 28 }}>{t("home.listings")}</h2>
      <div className="listing-grid">
        {data.listings.map((l) => (
          <ListingCard key={l.id} listing={{ ...l, seller: s }} />
        ))}
        {!data.listings.length ? (
          <p className="mut">{t("home.noListings")}</p>
        ) : null}
      </div>

      <h2 style={{ marginTop: 28 }}>{t("reviews.buyerReviews")}</h2>
      <p className="sm mut">{t("reviews.publicNote")}</p>
      {sellerReviews.map((r, i) => (
        <PublicReview key={i} review={r} />
      ))}
      {!sellerReviews.length ? (
        <p className="mut">{t("reviews.none")}</p>
      ) : null}
    </section>
  );
}
