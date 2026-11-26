import { readStore, publicListing, publicSellerCard } from "@/lib/db";
import { localizeListing, localizeSeller } from "@/lib/i18n/content";
import type { LocaleCode } from "@/lib/i18n/locales";

export type HomeListing = ReturnType<typeof publicListing> & {
  seller: ReturnType<typeof publicSellerCard> | null;
};

export type TrustStats = {
  completedDeals: number;
  protectedUsdt: number;
  feePercent: number;
  disputeDays: number;
  verifiedSellers: number;
  liveListings: number;
};

export async function getHomeListings(locale: LocaleCode = "en") {
  const store = await readStore();
  const list = store.listings
    .filter((l) => l.listed && l.status === "approved")
    .sort((a, b) => b.id - a.id)
    .slice(0, 12);
  const sellers = Object.fromEntries(
    store.users.map((u) => [u.id, localizeSeller(publicSellerCard(u), locale)])
  );
  return list.map((l) => ({
    ...localizeListing(publicListing(l, false, { lite: true }), locale),
    seller: sellers[l.sellerId] || null,
  }));
}

export async function getHomeSellers(locale: LocaleCode = "en") {
  const store = await readStore();
  const counts = new Map<number, number>();
  for (const l of store.listings) {
    if (l.listed && l.status === "approved") {
      counts.set(l.sellerId, (counts.get(l.sellerId) || 0) + 1);
    }
  }
  return store.users
    .filter((u) => (u.role === "seller" || u.role === "admin") && u.active !== false)
    .map((u) => ({
      ...localizeSeller(publicSellerCard(u), locale),
      listingCount: counts.get(u.id) || 0,
    }))
    .filter((s) => s.listingCount > 0)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
}

export async function getTrustStats(): Promise<TrustStats> {
  const store = await readStore();
  const done = store.orders.filter(
    (o) => o.status === "completed" || o.status === "release_requested"
  );
  const protectedUsdt = store.orders
    .filter(
      (o) =>
        o.status === "funds_held" ||
        o.status === "credentials_shared" ||
        o.status === "release_requested" ||
        o.status === "completed" ||
        o.status === "disputed"
    )
    .reduce((sum, o) => sum + Number(o.total || o.price || 0), 0);
  const completedFromUsers = store.users.reduce(
    (sum, u) => sum + (u.completedDeals || 0),
    0
  );
  return {
    completedDeals: Math.max(done.length, completedFromUsers),
    protectedUsdt: Math.round(protectedUsdt),
    feePercent: Number(store.settings.fee || 5),
    disputeDays: Number(store.settings.escrowHoldDays || 7),
    verifiedSellers: store.users.filter((u) => u.verified && u.role !== "buyer").length,
    liveListings: store.listings.filter((l) => l.listed && l.status === "approved")
      .length,
  };
}
