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

type KindFilter = "all" | "account" | "service";

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

type SortKey = "newest" | "price_asc" | "price_desc";
type ViewMode = "listings" | "sellers";

export default function HomePage() {
  const { t, locale } = useLang();
  const [listings, setListings] = useState<Listing[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<ViewMode>("listings");

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "sellers") setView("sellers");
      const t = params.get("type");
      if (t === "service" || t === "freelance") setKind("service");
      if (t === "account") setKind("account");
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

  const byKind = useMemo(() => {
    if (kind === "service")
      return listings.filter(
        (l) => l.isFreelance || l.listingType === "service"
      );
    if (kind === "account")
      return listings.filter(
        (l) => !l.isFreelance && (l.listingType || "account") !== "service"
      );
    return listings;
  }, [listings, kind]);

  const counts = Object.fromEntries(
    CATEGORIES.map(([k]) => [k, byKind.filter((l) => l.cat === k).length])
  );

  const filtered = useMemo(() => {
    let list = byKind;
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
    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else list = [...list].sort((a, b) => b.id - a.id);
    return list;
  }, [byKind, cat, q, sort]);

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
        </div>
      </section>

      <section className="sec" style={{ paddingBottom: 6 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>{t("home.browse")}</h2>
          <div className="view-toggle">
            <button
              type="button"
              className={view === "listings" && kind === "all" ? "on" : ""}
              onClick={() => {
                setView("listings");
                setKind("all");
              }}
            >
              {t("home.listings")}
            </button>
            <button
              type="button"
              className={view === "listings" && kind === "account" ? "on" : ""}
              onClick={() => {
                setView("listings");
                setKind("account");
              }}
            >
              {t("home.accounts")}
            </button>
            <button
              type="button"
              className={view === "listings" && kind === "service" ? "on" : ""}
              onClick={() => {
                setView("listings");
                setKind("service");
              }}
            >
              {t("home.services")}
            </button>
            <button
              type="button"
              className={view === "sellers" ? "on" : ""}
              onClick={() => setView("sellers")}
            >
              {t("home.sellers")}
            </button>
          </div>
        </div>

        {view === "listings" ? (
          <>
            <div className="filter-bar">
              <button
                type="button"
                className={`chip ${!cat ? "on" : ""}`}
                onClick={() => setCat("")}
              >
                {t("home.all")}
              </button>
              {CATEGORIES.map(([k, name]) => (
                <button
                  key={k}
                  type="button"
                  className={`chip ${cat === k ? "on" : ""}`}
                  onClick={() => setCat(cat === k ? "" : k)}
                >
                  <CatIcon cat={k} size={16} />
                  {name}
                  {counts[k] ? <span className="chip-n">{counts[k]}</span> : null}
                </button>
              ))}
              <select
                className="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="Sort"
              >
                <option value="newest">{t("home.newest")}</option>
                <option value="price_asc">{t("home.priceAsc")}</option>
                <option value="price_desc">{t("home.priceDesc")}</option>
              </select>
            </div>

            <div className="grid" style={{ marginTop: 14 }}>
              {filtered.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
              {!filtered.length ? (
                <p className="mut">{t("home.noListings")}</p>
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
                    {s.official ? "Official store" : s.country || "Seller"} ·{" "}
                    {s.listingCount} listing{s.listingCount === 1 ? "" : "s"}
                  </p>
                  <p className="sm" style={{ margin: "4px 0 0" }}>
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
              </Link>
            ))}
            {!sellers.length ? <p className="mut">{t("home.noSellers")}</p> : null}
          </div>
        )}
      </section>
    </>
  );
}
