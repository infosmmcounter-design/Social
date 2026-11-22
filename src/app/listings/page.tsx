"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ListingCard } from "@/components/ListingCard";
import { useLang } from "@/components/LanguageProvider";
import { api } from "@/lib/api";
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
  const rawType = sp.get("type") || "";
  const [type, setType] = useState(
    rawType === "freelance" || rawType === "gig" ? "service" : rawType
  );
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cat) params.set("cat", cat);
    if (type) params.set("type", type);
    if (sort) params.set("sort", sort);
    params.set("lang", locale);
    api<{ listings: Listing[] }>(`/api/listings?${params}`)
      .then((d) => setListings(d.listings))
      .catch(() => setListings([]));
  }, [q, cat, type, sort, locale]);

  const title = useMemo(() => {
    if (type === "service") return t("nav.services");
    if (type === "account") return t("home.accounts");
    if (cat) return CATEGORIES.find((c) => c[0] === cat)?.[1] || t("home.listings");
    return t("home.listings");
  }, [cat, type, t]);

  return (
    <section className="sec">
      <h1 style={{ fontSize: "1.8rem" }}>{title}</h1>
      {type === "service" ? (
        <p className="mut">
          Fiverr-style freelance gigs — YouTube, Facebook, Instagram, AI tools and
          more. Pay into escrow; freelancers deliver in chat.
        </p>
      ) : null}
      <div className="row" style={{ flexWrap: "wrap" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("home.search")}
          aria-label={t("home.search")}
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="Type"
          style={{ width: "auto" }}
        >
          <option value="">{t("home.all")}</option>
          <option value="account">{t("home.accounts")}</option>
          <option value="service">{t("home.services")}</option>
          <option value="tool">Tools</option>
        </select>
        <select
          value={cat}
          onChange={(e) => setCat(e.target.value)}
          aria-label="Platform"
          style={{ width: "auto" }}
        >
          <option value="">{t("home.all")}</option>
          {CATEGORIES.map(([k, n]) => (
            <option key={k} value={k}>
              {n}
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
