"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ListingCard } from "@/components/ListingCard";
import { BrandLogo } from "@/components/BrandLogo";
import { CatIcon } from "@/components/Icons";
import { VerifiedTick } from "@/components/VerifiedTick";
import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { api } from "@/lib/api";
import { stars } from "@/lib/constants";
import { CATEGORIES } from "@/lib/types";
import { CATEGORY_BLURBS } from "@/lib/category-blurbs";
import { CategoryFilters, type MonetizedFilter } from "@/components/CategoryFilters";
import { filtersForCategory } from "@/lib/category-filters";
import { compareListings } from "@/lib/listing-rank";
import type { MsgKey } from "@/lib/i18n/messages";
import type { TrustStats } from "@/lib/home-data";

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

export function HomeClient({
  initialListings,
  initialSellers,
  trust,
}: {
  initialListings: Listing[];
  initialSellers: Seller[];
  trust: TrustStats;
}) {
  const { t, locale } = useLang();
  const [listings, setListings] = useState<Listing[]>(initialListings);
  const [sellers, setSellers] = useState<Seller[]>(initialSellers);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<SortKey>("recommended");
  const [view, setView] = useState<ViewMode>("listings");
  const [monetized, setMonetized] = useState<MonetizedFilter>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minFollowers, setMinFollowers] = useState("");
  const [loadingListings, setLoadingListings] = useState(!initialListings.length);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const PAGE = 12;

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "sellers") setView("sellers");
      const c = params.get("cat");
      if (c) setCat(c);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const lang = encodeURIComponent(locale);
    setLoadingListings(true);
    setHasMore(false);
    api<{ listings: Listing[]; hasMore?: boolean }>(
      `/api/listings?lang=${lang}&lite=1&limit=${PAGE}&offset=0`
    )
      .then((d) => {
        if (cancelled) return;
        setListings(d.listings || []);
        setHasMore(!!d.hasMore);
        setLoadingListings(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadingListings(false);
      });
    api<{ sellers: Seller[] }>(`/api/sellers?lang=${lang}`)
      .then((d) => {
        if (!cancelled) setSellers(d.sellers);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (!hasMore || loadingListings || loadingMore) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoadingMore(true);
      const lang = encodeURIComponent(locale);
      api<{ listings: Listing[]; hasMore?: boolean }>(
        `/api/listings?lang=${lang}&lite=1&limit=${PAGE}&offset=${listings.length}`
      )
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
  }, [hasMore, loadingListings, loadingMore, listings.length, locale]);

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
    const mode = sort === "price_asc" || sort === "price_desc" ? sort : "market";
    list = [...list].sort((a, b) => compareListings(a, b, mode));
    return list;
  }, [listings, cat, q, sort, monetized, minPrice, maxPrice, minFollowers]);

  const activeBlurb = cat
    ? CATEGORY_BLURBS[cat as keyof typeof CATEGORY_BLURBS]
    : null;

  return (
    <>
      <section className="hero hero-home">
        <span className="hero-orb hero-orb-a" aria-hidden />
        <span className="hero-orb hero-orb-b" aria-hidden />
        <span className="hero-orb hero-orb-c" aria-hidden />
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
          <div className="row hero-cta-row" style={{ marginTop: 14 }}>
            <Link className="btn hero-sell" href="/dashboard/seller">
              {t("home.sellPath")}
            </Link>
          </div>
          <EscrowBand />
        </div>
      </section>

      <section className="sec trust-strip" aria-label={t("home.trustTitle")}>
        <h2 className="trust-title">{t("home.trustTitle")}</h2>
        <div className="trust-grid">
          <div className="trust-cell">
            <strong>{trust.completedDeals.toLocaleString()}</strong>
            <span>{t("home.trustDeals")}</span>
          </div>
          <div className="trust-cell">
            <strong>{trust.protectedUsdt.toLocaleString()} USDT</strong>
            <span>{t("home.trustProtected")}</span>
          </div>
          <div className="trust-cell">
            <strong>{trust.feePercent}%</strong>
            <span>{t("home.trustFee")}</span>
          </div>
          <div className="trust-cell">
            <strong>{trust.disputeDays} days</strong>
            <span>{t("home.trustDispute")}</span>
          </div>
          <div className="trust-cell">
            <strong>{trust.verifiedSellers}</strong>
            <span>{t("home.trustSellers")}</span>
          </div>
          <div className="trust-cell">
            <strong>{trust.liveListings}</strong>
            <span>{t("home.trustListings")}</span>
          </div>
        </div>
        <p className="sm mut trust-note">{t("home.trustNote")}</p>
      </section>

      <section className="sec" id="browse" style={{ paddingBottom: 6 }}>
        <div className="row" style={{ justifyContent: "space-between", gap: 12 }}>
          <h2 style={{ margin: 0 }}>
            {cat
              ? t(`cat.${cat}` as MsgKey)
              : sort === "recommended"
                ? t("home.recommended")
                : t("home.browse")}
          </h2>
        </div>
        <p className="sm mut cat-blurb" style={{ marginTop: 6 }}>
          {activeBlurb || t("home.browseHint")}
        </p>

        {view === "listings" ? (
          <>
            <LiveCategoryRail
              cat={cat}
              counts={counts}
              onPick={(next) => {
                setCat(next);
                setMonetized("all");
                setMinPrice("");
                setMaxPrice("");
                setMinFollowers("");
              }}
            />
            <div className="filter-bar filter-bar-sort">
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
              {loadingListings && !listings.length
                ? Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="listing-skeleton" aria-hidden>
                      <div className="sk-img" />
                      <div className="sk-line" />
                      <div className="sk-line short" />
                      <div className="sk-line mid" />
                    </div>
                  ))
                : null}
              {!loadingListings || listings.length
                ? filtered.map((l) => <ListingCard key={l.id} listing={l} />)
                : null}
              {!loadingListings && !filtered.length ? (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                  <strong>{t("home.noListings")}</strong>
                  <p className="sm mut">{t("home.emptyHint")}</p>
                  {cat ? (
                    <button type="button" className="btn s" onClick={() => setCat("")}>
                      {t("home.viewAll")}
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
            {loadingMore ? (
              <p className="sm mut" style={{ marginTop: 12 }}>
                {t("listing.loadingMore")}
              </p>
            ) : null}
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

      <section className="sec support-promise" aria-label={t("home.supportTitle")}>
        <div className="support-promise-inner">
          <div>
            <h2>{t("home.supportTitle")}</h2>
            <p>{t("home.supportBody")}</p>
          </div>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <Link className="btn" href="/help">
              {t("home.supportChat")}
            </Link>
            <Link className="btn o" href="/contact">
              {t("nav.contact")}
            </Link>
          </div>
        </div>
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

function LiveCategoryRail({
  cat,
  counts,
  onPick,
}: {
  cat: string;
  counts: Record<string, number>;
  onPick: (next: string) => void;
}) {
  const { t } = useLang();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const resumeTimer = useRef<number | null>(null);
  const dirRef = useRef<1 | -1>(1);
  const [autoPause, setAutoPause] = useState(false);

  const boards = useMemo(
    () => [
      { key: "", label: t("home.all"), icon: "" as string },
      ...CATEGORIES.map(([k]) => ({
        key: k,
        label: t(`cat.${k}` as MsgKey),
        icon: k,
      })),
    ],
    [t]
  );

  function pauseAutoBriefly(ms = 5000) {
    setAutoPause(true);
    if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      setAutoPause(false);
      resumeTimer.current = null;
    }, ms);
  }

  useEffect(() => {
    return () => {
      if (resumeTimer.current) window.clearTimeout(resumeTimer.current);
    };
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || autoPause) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    let raf = 0;
    let last = performance.now();
    const speed = 36;
    const tick = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;
      if (!document.hidden) {
        const max = el.scrollWidth - el.clientWidth;
        if (max > 8) {
          el.scrollLeft += (dirRef.current * speed * dt) / 1000;
          if (el.scrollLeft >= max - 0.5) {
            el.scrollLeft = max;
            dirRef.current = -1;
          } else if (el.scrollLeft <= 0.5) {
            el.scrollLeft = 0;
            dirRef.current = 1;
          }
        }
      }
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [autoPause]);

  return (
    <div className="cat-live" aria-label={t("home.browse")}>
      <div
        className="cat-live-viewport"
        ref={scrollerRef}
        onPointerDown={() => pauseAutoBriefly()}
        onTouchStart={() => pauseAutoBriefly()}
        onWheel={() => pauseAutoBriefly(2800)}
        onFocusCapture={() => pauseAutoBriefly()}
      >
        <div className="cat-live-set">
          {boards.map((b) => {
            const on = cat === b.key;
            const count = b.key ? counts[b.key] || 0 : listingsTotal(counts);
            return (
              <button
                key={b.key || "all"}
                type="button"
                className={`cat-circle cat-circle-${b.key || "all"} ${on ? "on" : ""}`}
                aria-pressed={on}
                aria-label={b.label}
                title={
                  b.key
                    ? CATEGORY_BLURBS[b.key as keyof typeof CATEGORY_BLURBS]
                    : undefined
                }
                onClick={() => {
                  pauseAutoBriefly();
                  onPick(on && b.key ? "" : b.key);
                }}
              >
                <span className="cat-circle-disc" aria-hidden>
                  {b.icon ? (
                    <CatIcon cat={b.icon} size={36} />
                  ) : (
                    <span className="cat-circle-all">✦</span>
                  )}
                </span>
                {count > 0 ? <span className="cat-circle-n">{count}</span> : null}
                <span className="cat-circle-label">{b.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function listingsTotal(counts: Record<string, number>) {
  return Object.values(counts).reduce((a, b) => a + b, 0);
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
          <p>
            Chat first, pay USDT into escrow, then confirm delivery. Funds stay held
            until you say you received it.
          </p>
        </div>
        <div className="usdt-coin usdt-coin-live" aria-hidden>
          <span>₮</span>
          <small>USDT</small>
        </div>
      </div>
    </section>
  );
}
