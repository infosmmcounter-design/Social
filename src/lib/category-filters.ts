/** Browse filters + seller-form fields that belong to one category. */

export type AudienceKind = "subscribers" | "followers";

export type CategoryFilterSpec = {
  /** Monetized / non-monetized sections. YouTube and TikTok only. */
  monetized: boolean;
  /** YouTube says “channel”; TikTok says the account is monetized. */
  channel: boolean;
  audience: AudienceKind | null;
  price: boolean;
};

/** What the seller listing form should ask for this board. */
export type SellFormSpec = {
  kind: "social" | "ai" | "freelance" | "subscription";
  stockMode: boolean;
  audience: AudienceKind | null;
  monetized: boolean;
  /** Channel / page / profile / product URL field. */
  urlField: "channel" | "profile" | "product" | null;
  urlVisibility: boolean;
  gigMeta: boolean;
  gigIdeas: boolean;
};

export const CATEGORY_FILTERS: Record<string, CategoryFilterSpec> = {
  youtube: { monetized: true, channel: true, audience: "subscribers", price: true },
  tiktok: { monetized: true, channel: false, audience: "followers", price: true },
  facebook: { monetized: false, channel: false, audience: "followers", price: true },
  instagram: { monetized: false, channel: false, audience: "followers", price: true },
  x: { monetized: false, channel: false, audience: "followers", price: true },
  ai: { monetized: false, channel: false, audience: null, price: true },
  freelance: { monetized: false, channel: false, audience: null, price: true },
  other: { monetized: false, channel: false, audience: null, price: true },
};

const SELL_FORMS: Record<string, SellFormSpec> = {
  youtube: {
    kind: "social",
    stockMode: true,
    audience: "subscribers",
    monetized: true,
    urlField: "channel",
    urlVisibility: true,
    gigMeta: false,
    gigIdeas: false,
  },
  tiktok: {
    kind: "social",
    stockMode: true,
    audience: "followers",
    monetized: true,
    urlField: "profile",
    urlVisibility: true,
    gigMeta: false,
    gigIdeas: false,
  },
  instagram: {
    kind: "social",
    stockMode: true,
    audience: "followers",
    monetized: false,
    urlField: "profile",
    urlVisibility: true,
    gigMeta: false,
    gigIdeas: false,
  },
  facebook: {
    kind: "social",
    stockMode: true,
    audience: "followers",
    monetized: false,
    urlField: "profile",
    urlVisibility: true,
    gigMeta: false,
    gigIdeas: false,
  },
  ai: {
    kind: "ai",
    stockMode: true,
    audience: null,
    monetized: false,
    urlField: "product",
    urlVisibility: true,
    gigMeta: false,
    gigIdeas: false,
  },
  freelance: {
    kind: "freelance",
    stockMode: false,
    audience: null,
    monetized: false,
    urlField: null,
    urlVisibility: false,
    gigMeta: true,
    gigIdeas: true,
  },
  other: {
    kind: "subscription",
    stockMode: true,
    audience: null,
    monetized: false,
    urlField: "product",
    urlVisibility: true,
    gigMeta: false,
    gigIdeas: false,
  },
};

export function filtersForCategory(cat: string): CategoryFilterSpec | null {
  if (!cat) return null;
  return CATEGORY_FILTERS[cat] || null;
}

export function sellFormForCategory(cat: string): SellFormSpec | null {
  if (!cat) return null;
  return SELL_FORMS[cat] || null;
}

export function showsMonetized(cat: string | undefined | null): boolean {
  return cat === "youtube" || cat === "tiktok";
}
