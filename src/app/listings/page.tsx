"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { useLang } from "@/components/LanguageProvider";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/types";
import { CategoryFilters, type MonetizedFilter } from "@/components/CategoryFilters";
import { filtersForCategory } from "@/lib/category-filters";
import { compareListings } from "@/lib/listing-rank";
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
    name: string;
    country?: string;
    official?: boolean;
    verified?: boolean;
    rating?: number;
    reviewCount?: number;
  } | null;
};

const PAGE = 12;

function ListingsInner() {
  const sp = useSearchParams();
  const { t, locale } = useLang();
  const [listings, setListings] = useState<Listing[]>([]);
  const [q, setQ] = useState(sp.get("q") || "");
  const [cat, setCat] = useState(sp.get("cat") || "");
  const [sort, setSort] = useState("newest");
  const [monetized, setMonetized] = useState<MonetizedFilter>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minAudience, setMinAudience] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("cat", cat);
    if (sort) params.set("sort", sort);
    params.set("lang", locale);
    params.set("lite", "1");
    params.set("limit", String(PAGE));
    params.set("offset", "0");
    setLoading(true);
    setHasMore(false);
    api<{ listings: Listing[]; hasMore?: boolean }>(`/api/listings?${params}`)
      .then((d) => {
        if (cancelled) return;
        setListings(d.listings || []);
        setHasMore(!!d.hasMore);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setListings([]);
        setHasMore(false);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, cat, sort, locale]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat) params.set("cat", cat);
      if (sort) params.set("sort", sort);
      params.set("lang", locale);
      params.set("lite", "1");
      params.set("limit", String(PAGE));
      params.set("offset", String(listings.length));
      setLoadingMore(true);
      api<{ listings: Listing[]; hasMore?: boolean }>(`/api/listings?${params}`)
        .then((d) => {
          if (cancelled) return;
          setListings((prev) => {
            const seen = new Set(prev.map((l) => l.id));
            return [...prev, ...(d.listings || []).filter((l) => !seen.has(l.id))];
          });
          setHasMore(!!d.hasMore);
        })
        .catch(() => {
          if (!cancelled) setHasMore(false);
        })
        .finally(() => {
          if (!cancelled) setLoadingMore(false);
        });
    }, 120);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hasMore, loading, loadingMore, listings.length, q, cat, sort, locale]);

  const shown = useMemo(() => {
    const spec = filtersForCategory(cat);
    let list = listings;
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
    const minF = Number(minAudience);
    if (spec?.audience && minAudience && !Number.isNaN(minF)) {
      list = list.filter((l) => {
        const n = Number(String(l.followers || "").replace(/[^0-9.]/g, ""));
        return n >= minF;
      });
    }
    const mode =
      sort === "price_asc" || sort === "price_desc" ? sort : "market";
    return [...list].sort((a, b) => compareListings(a, b, mode));
  }, [listings, cat, monetized, minPrice, maxPrice, minAudience, sort]);

  const title = useMemo(() => {
    if (cat) return t(`cat.${cat}` as MsgKey);
    return t("home.listings");
  }, [cat, t]);

  return (
    <section className="sec">
      <h1 style={{ fontSize: "1.8rem" }}>{title}</h1>
      {cat === "freelance" ? (
        <p className="mut">{t("listings.freelanceIntro")}</p>
      ) : null}
      <div className="row" style={{ flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("home.search")}
          style={{ flex: 1, minWidth: 180 }}
        />
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">{t("home.all")}</option>
          {CATEGORIES.map(([k]) => (
            <option key={k} value={k}>
              {t(`cat.${k}` as MsgKey)}
            </option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">{t("home.newest")}</option>
          <option value="recommended">{t("home.sortRecommended")}</option>
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
        minAudience={minAudience}
        onMinPrice={setMinPrice}
        onMaxPrice={setMaxPrice}
        onMinAudience={setMinAudience}
      />
      <div className="listing-grid" style={{ marginTop: 16 }}>
        {shown.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
        {loading && !shown.length ? (
          <p className="mut" style={{ gridColumn: "1 / -1" }}>
            {t("common.loading")}
          </p>
        ) : null}
        {!loading && !shown.length ? (
          <p className="mut" style={{ gridColumn: "1 / -1" }}>
            {t("home.noListings")}
          </p>
        ) : null}
      </div>
      {loadingMore ? (
        <p className="sm mut" style={{ marginTop: 12 }}>
          {t("listing.loadingMore")}
        </p>
      ) : null}
    </section>
  );
}

export default function ListingsPage() {
  const { t } = useLang();
  return (
    <Suspense fallback={<p className="sec mut">{t("common.loading")}</p>}>
      <ListingsInner />
    </Suspense>
  );
}
