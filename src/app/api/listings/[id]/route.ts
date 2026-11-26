import { NextResponse } from "next/server";
import { readStore, updateStore, publicListing, publicUser } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
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

/** Seller (or admin) permanently removes their own listing/gig. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireUser(["seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    return NextResponse.json({ error: "Listing id required" }, { status: 400 });
  }

  try {
    await updateStore((data) => {
      const listing = data.listings.find((l) => l.id === listingId);
      if (!listing) throw new Error("Listing not found");
      const isAdmin = auth.user!.role === "admin";
      if (!isAdmin && listing.sellerId !== auth.user!.id)
        throw new Error("Forbidden");

      const openDeal = data.orders.some(
        (o) =>
          o.listingId === listingId &&
          !["completed", "cancelled", "refunded"].includes(o.status)
      );
      if (openDeal) {
        // Keep history for open escrow; pull it off the marketplace.
        listing.listed = false;
        listing.stock = 0;
        return;
      }

      data.listings = data.listings.filter((l) => l.id !== listingId);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
