import { NextResponse } from "next/server";
import { readStore, publicUser, publicListing } from "@/lib/db";
import { localeFromRequest } from "@/lib/i18n/api-locale";
import { localizeListing, localizeSeller } from "@/lib/i18n/content";
import { compareListings } from "@/lib/listing-rank";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const locale = localeFromRequest(req);
  const store = await readStore();
  const seller = store.users.find(
    (u) => u.id === Number(id) && (u.role === "seller" || u.official)
  );
  if (!seller || !seller.active)
    return NextResponse.json({ error: "Seller not found" }, { status: 404 });

  const sellerCard = {
    rating: seller.rating,
    reviewCount: seller.reviewCount,
  };
  const listings = store.listings
    .filter(
      (l) => l.sellerId === seller.id && l.listed && l.status === "approved"
    )
    .map((l) => localizeListing(publicListing(l, false), locale))
    .sort((a, b) =>
      compareListings(
        { ...a, seller: sellerCard },
        { ...b, seller: sellerCard }
      )
    );
  const reviews = store.reviews.filter(
    (r) => r.sellerId === seller.id && (r.about || "seller") === "seller"
  );

  return NextResponse.json({
    locale,
    seller: localizeSeller(publicUser(seller), locale),
    listings,
    reviews,
  });
}
