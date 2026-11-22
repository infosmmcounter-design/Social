"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { VerifiedTick } from "@/components/VerifiedTick";
import { StartSellerChat } from "@/components/StartSellerChat";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { api } from "@/lib/api";
import { stars } from "@/lib/constants";

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLang();
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
    }[];
  } | null>(null);

  useEffect(() => {
    api<NonNullable<typeof data>>(
      `/api/sellers/${id}?lang=${encodeURIComponent(locale)}`
    )
      .then(setData)
      .catch(() => setData(null));
  }, [id, locale]);

  if (!data) return <p className="sec mut">{t("common.loading")}</p>;
  const s = data.seller;
  const sellerReviews = data.reviews.filter(
    (r) => (r.about || "seller") === "seller"
  );

  return (
    <section className="sec">
      <Link className="mut sm" href="/#sellers">
        ← {t("nav.sellers")}
      </Link>
      <div
        className="row"
        style={{ marginTop: 12, gap: 16, alignItems: "center" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={s.avatarUrl || ""}
          alt=""
          style={{
            width: 88,
            height: 88,
            borderRadius: "50%",
            objectFit: "cover",
            border: s.verified ? "3px solid #1D9BF0" : "2px solid var(--line)",
          }}
        />
        <div>
          <h1 style={{ fontSize: "2rem", margin: 0 }}>
            {s.name}
            {s.verified ? <VerifiedTick size={22} /> : null}
          </h1>
          <div className="row" style={{ marginTop: 6 }}>
            {s.official ? <span className="pill g">Official store</span> : null}
            {s.verified ? (
              <span
                className="pill bl"
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                {t("common.verified")} <VerifiedTick size={12} />
              </span>
            ) : null}
            <span className="pill">{s.country}</span>
          </div>
          <p className="sm" style={{ margin: "8px 0 0" }}>
            {s.reviewCount ? (
              <>
                <span className="star">{stars(s.rating)}</span>{" "}
                {s.rating.toFixed(1)} ({s.reviewCount})
              </>
            ) : (
              <span className="mut">No reviews yet</span>
            )}
          </p>
        </div>
      </div>
      {s.bio ? <p style={{ marginTop: 14 }}>{s.bio}</p> : null}
      <div style={{ marginTop: 12 }}>
        <StartSellerChat sellerId={s.id} sellerName={s.name} />
      </div>

      <h2 style={{ marginTop: 28 }}>{t("home.listings")}</h2>
      <div className="grid">
        {data.listings.map((l) => (
          <ListingCard key={l.id} listing={{ ...l, seller: s }} />
        ))}
        {!data.listings.length ? (
          <p className="mut">{t("home.noListings")}</p>
        ) : null}
      </div>

      <h2 style={{ marginTop: 28 }}>Reviews</h2>
      {sellerReviews.map((r, i) => (
        <div className="card" key={i} style={{ marginBottom: 10 }}>
          <span className="star">{stars(r.stars)}</span>{" "}
          <span className="sm mut">
            {r.who} · {r.date}
          </span>
          <p style={{ margin: "6px 0 0" }}>{r.text}</p>
        </div>
      ))}
      {!sellerReviews.length ? <p className="mut">No reviews yet</p> : null}
    </section>
  );
}
