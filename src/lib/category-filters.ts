/** Browse filters that belong to one category, not the whole store. */

export type AudienceKind = "subscribers" | "followers";

export type CategoryFilterSpec = {
  /** Monetized / non-monetized sections. YouTube and TikTok only. */
  monetized: boolean;
  /** YouTube says “channel”; TikTok says the account is monetized. */
  channel: boolean;
  audience: AudienceKind | null;
  price: boolean;
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

export function filtersForCategory(cat: string): CategoryFilterSpec | null {
  if (!cat) return null;
  return CATEGORY_FILTERS[cat] || null;
}

export function showsMonetized(cat: string | undefined | null): boolean {
  return cat === "youtube" || cat === "tiktok";
}
