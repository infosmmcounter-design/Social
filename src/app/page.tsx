"use client";

import { useEffect, useMemo, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { BrandLogo } from "@/components/BrandLogo";
import { CatIcon } from "@/components/Icons";
import { VerifiedTick } from "@/components/VerifiedTick";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { api } from "@/lib/api";
import { stars } from "@/lib/constants";
import { CATEGORIES } from "@/lib/types";
import { CategoryFilters, type MonetizedFilter } from "@/components/CategoryFilters";
import { filtersForCategory } from "@/lib/category-filters";
import type { MsgKey } from "@/lib/i18n/messages";

type Listing = {
  id: number;
  title: string;
  cat: string;
  price: number;
  img?: string;
  followers?: string;
  monetized?: boolean;
  stock?: number;
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

type Seller = {
  id: number;
  name: string;
  country: string;
  bio: string;
  verified: boolean;
  official: boolean;
  rating: number;
  reviewCount: number;
  avatarUrl: string;
  listingCount: number;
};

type SortKey = "recommended" | "newest" | "price_asc" | "price_desc";
type ViewMode = "listings" | "sellers";

export default function HomePage() {
  const { t, locale } = useLang();
  const [listings, setListings] = useState<Listing[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [view, setView] = useState<ViewMode>("listings");
  const [monetized, setMonetized] = useState<MonetizedFilter>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minFollowers, setMinFollowers] = useState("");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "sellers") setView("sellers");
      // Deep-link: /?cat=freelance opens listings filtered to Freelance Services chip
      const c = params.get("cat");
      if (c) setCat(c);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const lang = encodeURIComponent(locale);
    api<{ listings: Listing[] }>(`/api/listings?lang=${lang}`)
      .then((d) => setListings(d.listings))
      .catch(() => setListings([]));
    api<{ sellers: Seller[] }>(`/api/sellers?lang=${lang}`)
      .then((d) => setSellers(d.sellers))
      .catch(() => setSellers([]));
  }, [locale]);

  const counts = Object.fromEntries(
    CATEGORIES.map(([k]) => [k, listings.filter((l) => l.cat === k).length])
  );

  const filtered = useMemo(() => {
    let list = listings;
    if (cat) list = list.filter((l) => l.cat === cat);
    if (q.trim()) {
      const qq = q.trim().toLowerCase();
      list = list.filter((l) =>
        [l.title, l.cat, l.niche || "", l.seller?.name || ""]
          .join(" ")
          .toLowerCase()
          .includes(qq)
      );
    }
    const spec = filtersForCategory(cat);
    if (spec?.monetized) {
      if (monetized === "yes") list = list.filter((l) => l.monetized);
      if (monetized === "no") list = list.filter((l) => !l.monetized);
    }
    const minP = Number(minPrice);
    const maxP = Number(maxPrice);
    if (spec?.price && minPrice && !Number.isNaN(minP)) {
      list = list.filter((l) => l.price >= minP);
    }
    if (spec?.price && maxPrice && !Number.isNaN(maxP)) {
      list = list.filter((l) => l.price <= maxP);
    }
    const minF = Number(minFollowers);
    if (spec?.audience && minFollowers && !Number.isNaN(minF)) {
      list = list.filter((l) => {
        const n = Number(String(l.followers || "").replace(/[^0-9.]/g, ""));
        return n >= minF;
      });
    }
    const byRating = (a: Listing, b: Listing) => {
      const ar = a.seller?.rating || 0;
      const br = b.seller?.rating || 0;
      if (br !== ar) return br - ar;
      return (b.seller?.reviewCount || 0) - (a.seller?.reviewCount || 0);
    };
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "recommended") list = [...list].sort(byRating);
    else list = [...list].sort((a, b) => b.id - a.id);
    return list;
  }, [listings, cat, q, sort, monetized, minPrice, maxPrice, minFollowers]);

  return (
    <>
      <section className="hero hero-home">
        <div className="hero-inner">
          <BrandLogo size={48} />
          <p className="hero-kicker">{t("home.kicker")}</p>
          <h1>{t("home.headline")}</h1>
          <p className="hero-sub">{t("home.sub")}</p>
          <div className="sbox">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#56627a"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21" />
            </svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("home.search")}
              aria-label={t("home.search")}
            />
            <button className="btn" type="button" onClick={() => setView("listings")}>
              {t("home.searchBtn")}
            </button>
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <Link className="btn hero-sell" href="/dashboard/seller">
              Start selling
            </Link>
          </div>
          <EscrowBand />
        </div>
      </section>

      <section className="sec" style={{ paddingBottom: 6 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>
            {cat
              ? t(`cat.${cat}` as MsgKey)
              : sort === "recommended"
                ? t("home.recommended")
                : t("home.browse")}
          </h2>
        </div>

        {view === "listings" ? (
          <>
            <div className="filter-bar">
              <button
                type="button"
                className={`chip ${!cat ? "on" : ""}`}
                onClick={() => {
                  setCat("");
                  setMonetized("all");
                  setMinPrice("");
                  setMaxPrice("");
                  setMinFollowers("");
                }}
              >
                {t("home.all")}
              </button>
              {CATEGORIES.map(([k]) => (
                <button
                  key={k}
                  type="button"
                  className={`chip ${cat === k ? "on" : ""}`}
                  onClick={() => {
                    const next = cat === k ? "" : k;
                    setCat(next);
                    setMonetized("all");
                    setMinPrice("");
                    setMaxPrice("");
                    setMinFollowers("");
                  }}
                >
                  <CatIcon cat={k} size={16} />
                  {t(`cat.${k}` as MsgKey)}
                  {counts[k] ? <span className="chip-n">{counts[k]}</span> : null}
                </button>
              ))}
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort"
              >
                <option value="recommended">{t("home.sortRecommended")}</option>
                <option value="newest">{t("home.newest")}</option>
                <option value="price_asc">{t("home.priceAsc")}</option>
                <option value="price_desc">{t("home.priceDesc")}</option>
              </select>
            </div>
            <CategoryFilters
              cat={cat}
              monetized={monetized}
              onMonetized={setMonetized}
              minPrice={minPrice}
              maxPrice={maxPrice}
              minAudience={minFollowers}
              onMinPrice={setMinPrice}
              onMaxPrice={setMaxPrice}
              onMinAudience={setMinFollowers}
            />

            <div className="listing-grid" style={{ marginTop: 14 }}>
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
              {!filtered.length ? (
                <p className="mut" style={{ gridColumn: "1 / -1" }}>
                  {t("home.noListings")}
                </p>
              ) : null}
            </div>
          </>
        ) : (
          <div className="seller-grid" id="sellers" style={{ marginTop: 14 }}>
            {sellers.map((s) => (
              <Link key={s.id} className="seller-tile" href={`/seller/${s.id}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="seller-av" src={s.avatarUrl} alt="" />
                <div>
                  <strong>
                    {s.name}
                    {s.verified ? <VerifiedTick size={15} /> : null}
                  </strong>
                  <p className="sm mut" style={{ margin: "2px 0 0" }}>
                    {s.official ? t("card.official") : s.country || t("card.seller")} ·{" "}
                    {s.listingCount}{" "}
                    {s.listingCount === 1 ? t("card.listing") : t("card.listings")}
                  </p>
                  <p className="sm" style={{ margin: "4px 0 0" }}>
                    {s.reviewCount ? (
                      <>
                        <span className="star">{stars(s.rating)}</span>{" "}
                        {s.rating.toFixed(1)} ({s.reviewCount})
                      </>
                    ) : (
                      <span className="mut">{t("card.noReviews")}</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
            {!sellers.length ? <p className="mut">{t("home.noSellers")}</p> : null}
          </div>
        )}
      </section>

      <section className="sec deal-how">
        <h2>{t("home.dealTitle")}</h2>
        <div className="deal-steps">
          {(
            [
              ["01", "home.deal1", "home.deal1d"],
              ["02", "home.deal2", "home.deal2d"],
              ["03", "home.deal3", "home.deal3d"],
              ["04", "home.deal4", "home.deal4d"],
            ] as const
          ).map(([n, title, body]) => (
            <article key={n} className="deal-step">
              <span className="deal-n">{n}</span>
              <h3>{t(title)}</h3>
              <p>{t(body)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function EscrowBand() {
  return (
    <section className="escrow-band" aria-label="Protected by USDT Escrow">
      <div className="escrow-band-inner">
        <div className="escrow-shield" aria-hidden>
          <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
            <path
              d="M24 4 8 10v12c0 10 6.8 16.6 16 20 9.2-3.4 16-10 16-20V10L24 4z"
              fill="#1a1408"
            />
            <rect x="18" y="20" width="12" height="10" rx="2" fill="#f6e08a" />
            <path
              d="M20 20v-2a4 4 0 0 1 8 0v2"
              stroke="#f6e08a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="escrow-band-copy">
          <h2>Protected by Escrow</h2>
          <p>Chat first, pay USDT into escrow, then confirm delivery. Funds stay held until you say you received it.</p>
        </div>
        <div className="usdt-coin" aria-hidden>
          <span>₮</span>
          <small>USDT</small>
        </div>
      </div>
    </section>
  );
}
