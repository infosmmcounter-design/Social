"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { useLang } from "@/components/LanguageProvider";
import { api } from "@/lib/api";
import { CATEGORIES } from "@/lib/types";
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

function ListingsInner() {
  const sp = useSearchParams();
  const { t, locale } = useLang();
  const [listings, setListings] = useState<Listing[]>([]);
  const [q, setQ] = useState(sp.get("q") || "");
  const [cat, setCat] = useState(sp.get("cat") || "");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("cat", cat);
    if (sort) params.set("sort", sort);
    params.set("lang", locale);
    api<{ listings: Listing[] }>(`/api/listings?${params}`)
      .then((d) => setListings(d.listings))
      .catch(() => setListings([]));
  }, [q, cat, sort, locale]);

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
          aria-label={t("home.search")}
        />
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Category"
          style={{ width: "auto" }}
        >
          <option value="">{t("home.all")}</option>
          {CATEGORIES.map(([k]) => (
            <option key={k} value={k}>
              {t(`cat.${k}` as MsgKey)}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          aria-label="Sort"
          style={{ width: "auto" }}
        >
          <option value="newest">{t("home.newest")}</option>
          <option value="price_asc">{t("home.priceAsc")}</option>
          <option value="price_desc">{t("home.priceDesc")}</option>
        </select>
      </div>
      <div className="grid" style={{ marginTop: 14 }}>
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
        {!listings.length ? (
          <p className="mut">{t("home.noListings")}</p>
        ) : null}
      </div>
    </section>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<p className="sec mut">…</p>}>
      <ListingsInner />
    </Suspense>
  );
}
