"use client";

import { stars } from "@/lib/constants";
import { localeMeta, type LocaleCode, isLocale } from "@/lib/i18n/locales";
import { useLang } from "./LanguageProvider";

type Props = {
  review: {
    stars: number;
    who: string;
    date: string;
    text: string;
    locale?: string;
  };
};

/** Public buyer→seller review — shown in the language the buyer wrote it in. */
export function PublicReview({ review }: Props) {
  const { t } = useLang();
  const code = review.locale && isLocale(review.locale) ? review.locale : null;
  const meta = code ? localeMeta(code as LocaleCode) : null;

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="row" style={{ gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <span className="star">{stars(review.stars)}</span>
        <span className="sm mut">
          {review.who} · {review.date}
        </span>
        {meta ? (
          <span className="pill w" title={t("reviews.buyerLanguage")}>
            {meta.native}
          </span>
        ) : null}
      </div>
      <p
        style={{ margin: "8px 0 0", whiteSpace: "pre-wrap" }}
        lang={code || undefined}
        dir={meta?.dir}
      >
        {review.text}
      </p>
      {meta ? (
        <p className="sm mut" style={{ margin: "6px 0 0" }}>
          {t("reviews.shownInBuyerLang")}: {meta.native}
        </p>
      ) : null}
    </div>
  );
}
