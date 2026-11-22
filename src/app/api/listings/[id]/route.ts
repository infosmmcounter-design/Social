import { NextResponse } from "next/server";
import { readStore, publicListing, publicUser } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { localeFromRequest } from "@/lib/i18n/api-locale";
import { localizeListing, localizeSeller } from "@/lib/i18n/content";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const locale = localeFromRequest(req);
  const store = await readStore();
  const listing = store.listings.find((l) => l.id === Number(id));
  if (!listing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const user = await getCurrentUser();
  const seller = store.users.find((u) => u.id === listing.sellerId);
  const isOwner =
    user && (user.id === listing.sellerId || user.role === "admin");
  const approvedRequest = store.privateRequests.some(
    (r) =>
      r.listingId === listing.id &&
      r.status === "approved" &&
      user &&
      r.buyerEmail.toLowerCase() === user.email.toLowerCase()
  );
  const activeDeal = store.orders.some(
    (o) =>
      o.listingId === listing.id &&
      o.handleRevealed &&
      ((user && o.buyerId === user.id) ||
        (user && o.buyerEmail.toLowerCase() === user.email.toLowerCase()) ||
        (user && user.role === "admin") ||
        (user && o.sellerId === user.id))
  );

  const reveal = !!(isOwner || approvedRequest || activeDeal);
  const reviews = store.reviews.filter(
    (r) => r.listingId === listing.id && (r.about || "seller") === "seller"
  );

  if (!listing.listed && listing.status !== "approved" && !isOwner) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const pub = localizeListing(publicListing(listing, reveal), locale);

  return NextResponse.json({
    locale,
    listing: pub,
    seller: seller ? localizeSeller(publicUser(seller), locale) : null,
    reviews,
    canReveal: reveal,
    feePct: store.fee ?? store.settings.fee ?? 10,
    seo: {
      title: `${pub.title} | SocialsFlip`,
      description: pub.teaser || pub.desc?.slice(0, 160) || pub.title,
    },
  });
}
