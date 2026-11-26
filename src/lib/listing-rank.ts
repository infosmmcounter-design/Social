/** How a public listing should sit on the marketplace. */
export type RankableListing = {
  id: number;
  price?: number;
  cat?: string;
  stock?: number;
  soldCount?: number;
  soldOut?: boolean;
  isFreelance?: boolean;
  listingType?: string;
  seller?: { rating?: number; reviewCount?: number } | null;
};

/**
 * 0 stock batches and freelance gigs (repeatable, ranked by seller rating)
 * 1 a new single channel that has not sold yet (newest first)
 * 2 a channel that has sold out (sinks below everything still for sale)
 */
export function listingBand(l: RankableListing): 0 | 1 | 2 {
  const freelance =
    !!l.isFreelance || l.listingType === "service" || l.cat === "freelance";
  if (freelance) return 0;
  const stock = l.stock ?? 1;
  if (l.soldOut || stock <= 0) return 2;
  if (stock > 1 || (l.soldCount ?? 0) > 0) return 0;
  return 1;
}

export function compareListings(
  a: RankableListing,
  b: RankableListing,
  sort: "market" | "price_asc" | "price_desc" = "market"
): number {
  const band = listingBand(a) - listingBand(b);
  if (band !== 0) return band;

  if (sort === "price_asc" || sort === "price_desc") {
    const price = (a.price ?? 0) - (b.price ?? 0);
    if (price !== 0) return sort === "price_asc" ? price : -price;
    return b.id - a.id;
  }

  if (listingBand(a) === 0) {
    const rating = (b.seller?.rating || 0) - (a.seller?.rating || 0);
    if (rating !== 0) return rating;
    const reviews =
      (b.seller?.reviewCount || 0) - (a.seller?.reviewCount || 0);
    if (reviews !== 0) return reviews;
  }
  return b.id - a.id;
}
