"use client";

import { filtersForCategory } from "@/lib/category-filters";
import { useLang } from "./LanguageProvider";

export type MonetizedFilter = "all" | "yes" | "no";

export function CategoryFilters({
  cat,
  monetized,
  onMonetized,
  minPrice,
  maxPrice,
  minAudience,
  onMinPrice,
  onMaxPrice,
  onMinAudience,
}: {
  cat: string;
  monetized: MonetizedFilter;
  onMonetized: (v: MonetizedFilter) => void;
  minPrice: string;
  maxPrice: string;
  minAudience: string;
  onMinPrice: (v: string) => void;
  onMaxPrice: (v: string) => void;
  onMinAudience: (v: string) => void;
}) {
  const { t } = useLang();
  const spec = filtersForCategory(cat);
  if (!spec) return null;

  return (
    <div className="cat-filters" aria-label="Section filters">
      {spec.monetized ? (
        <div className="filter-bar" style={{ marginTop: 0 }}>
          <button
            type="button"
            className={`chip ${monetized === "all" ? "on" : ""}`}
            onClick={() => onMonetized("all")}
          >
            {spec.channel ? t("filter.allChannels") : t("filter.allHere")}
          </button>
          <button
            type="button"
            className={`chip ${monetized === "yes" ? "on" : ""}`}
            onClick={() => onMonetized("yes")}
          >
            {spec.channel ? t("filter.monetizedChannel") : t("filter.monetized")}
          </button>
          <button
            type="button"
            className={`chip ${monetized === "no" ? "on" : ""}`}
            onClick={() => onMonetized("no")}
          >
            {spec.channel
              ? t("filter.nonMonetizedChannel")
              : t("filter.notMonetized")}
          </button>
        </div>
      ) : null}
      <div className="row" style={{ marginTop: 8 }}>
        {spec.price ? (
          <>
            <input
              style={{ width: 110 }}
              inputMode="decimal"
              placeholder={t("filter.minPrice")}
              value={minPrice}
              onChange={(e) => onMinPrice(e.target.value)}
              aria-label={t("filter.minPrice")}
            />
            <input
              style={{ width: 110 }}
              inputMode="decimal"
              placeholder={t("filter.maxPrice")}
              value={maxPrice}
              onChange={(e) => onMaxPrice(e.target.value)}
              aria-label={t("filter.maxPrice")}
            />
          </>
        ) : null}
        {spec.audience ? (
          <input
            style={{ width: 160 }}
            inputMode="numeric"
            placeholder={
              spec.audience === "subscribers"
                ? t("filter.minSubscribers")
                : t("filter.minFollowers")
            }
            value={minAudience}
            onChange={(e) => onMinAudience(e.target.value)}
            aria-label={
              spec.audience === "subscribers"
                ? t("filter.minSubscribers")
                : t("filter.minFollowers")
            }
          />
        ) : null}
      </div>
    </div>
  );
}
