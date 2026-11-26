import { NextResponse } from "next/server";
import {
  readStore,
  updateStore,
  nextId,
  publicListing,
  publicUser,
  publicSellerCard,
} from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isFreelanceCategory, type Category } from "@/lib/types";
import { listingCoverDataUrl } from "@/lib/placeholders";
import { localeFromRequest } from "@/lib/i18n/api-locale";
import { localizeListing, localizeSeller } from "@/lib/i18n/content";
import { compareListings } from "@/lib/listing-rank";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const cat = searchParams.get("cat") || "";
  const q = (searchParams.get("q") || "").toLowerCase();
  const sort = searchParams.get("sort") || "newest";
  const sellerId = searchParams.get("sellerId");
  const mine = searchParams.get("mine") === "1";
  const admin = searchParams.get("admin") === "1";
  // type=account | service | tool | freelance (alias of service)
  let type = (searchParams.get("type") || "").toLowerCase();
  if (type === "freelance" || type === "gig") type = "service";
  const locale = localeFromRequest(req);
  const lite =
    searchParams.get("lite") === "1" ||
    (!mine && !admin && searchParams.get("lite") !== "0");
  const limitRaw = Number(searchParams.get("limit"));
  const offsetRaw = Number(searchParams.get("offset"));
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(48, Math.floor(limitRaw))
      : lite
        ? 12
        : 0;
  const offset =
    Number.isFinite(offsetRaw) && offsetRaw > 0 ? Math.floor(offsetRaw) : 0;

  const store = await readStore();
  let list = store.listings;

  if (admin) {
    const auth = await requireUser(["admin"]);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  } else if (mine) {
    const auth = await requireUser(["seller", "admin"]);
    if (auth.error || !auth.user)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    list = list.filter((l) => l.sellerId === auth.user!.id);
  } else {
    list = list.filter((l) => l.listed && l.status === "approved");
  }

  if (sellerId) list = list.filter((l) => l.sellerId === Number(sellerId));
  if (cat) list = list.filter((l) => l.cat === cat);
  if (type === "account" || type === "service" || type === "tool") {
    list = list.filter((l) => (l.listingType || "account") === type);
  }
  if (q) {
    list = list.filter((l) =>
      [l.title, l.desc, l.teaser, l.niche, l.cat].join(" ").toLowerCase().includes(q)
    );
  }

  const sellers = Object.fromEntries(
    store.users.map((u) => [
      u.id,
      localizeSeller(lite ? publicSellerCard(u) : publicUser(u), locale),
    ])
  );
  const mode =
    sort === "price_asc" || sort === "price_desc" ? sort : "market";
  const ranked = list
    .map((l) => ({
      ...localizeListing(publicListing(l, admin || mine, { lite }), locale),
      seller: sellers[l.sellerId] || null,
    }))
    .sort((a, b) => compareListings(a, b, mode));

  const total = ranked.length;
  const listings =
    limit > 0 ? ranked.slice(offset, offset + limit) : ranked;
  const hasMore = limit > 0 ? offset + listings.length < total : false;

  return NextResponse.json(
    {
      locale,
      listings,
      total,
      offset,
      limit: limit || total,
      hasMore,
    },
    {
      headers: lite
        ? {
            "Cache-Control": "public, s-maxage=20, stale-while-revalidate=60",
          }
        : undefined,
    }
  );
}

export async function POST(req: Request) {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const title = String(body.title || "").trim();
  const price = Number(body.price);
  const privateHandle = String(body.privateHandle || "").trim();
  const handlePublic = !!body.handlePublic;
  if (!title || !price) {
    return NextResponse.json(
      { error: "Title and price are required." },
      { status: 400 }
    );
  }

  const isAdmin = auth.user.role === "admin";
  const sellerBoards = new Set([
    "youtube",
    "instagram",
    "tiktok",
    "facebook",
    "freelance",
    "ai",
  ]);
  const chosenCat = String(body.cat || "").toLowerCase();
  if (!isAdmin && !sellerBoards.has(chosenCat)) {
    return NextResponse.json(
      { error: "Choose what you are listing." },
      { status: 400 }
    );
  }
  let listingId = 0;
  await updateStore((data) => {
    const me = data.users.find((u) => u.id === auth.user!.id);
    if (me && me.role === "buyer") me.role = "seller";
    listingId = nextId(data);
    const cat = (chosenCat || "other") as Category;
    const img =
      String(body.img || "").trim() || listingCoverDataUrl(cat, title);
    const images = Array.isArray(body.images)
      ? body.images.map(String).filter(Boolean).slice(0, 8)
      : [];
    const stock = Math.max(0, Number(body.stock ?? 1));
    const rawType = String(body.listingType || "").toLowerCase();
    const listingType = isFreelanceCategory(cat)
      ? "service"
      : rawType === "service" || rawType === "freelance" || rawType === "gig"
        ? "service"
        : rawType === "tool"
          ? "tool"
          : cat === "other"
            ? "tool"
            : "account";
    const isFreelance =
      isFreelanceCategory(cat) || listingType === "service";
    const deliveryDays = isFreelance
      ? Math.min(60, Math.max(1, Math.floor(Number(body.deliveryDays) || 3)))
      : 0;
    const revisions = isFreelance
      ? Math.min(20, Math.max(0, Math.floor(Number(body.revisions) || 1)))
      : 0;
    data.listings.push({
      id: listingId,
      sellerId: isAdmin && body.sellerId ? Number(body.sellerId) : auth.user!.id,
      title,
      cat,
      niche: String(body.niche || ""),
      followers: isFreelance ? "" : String(body.followers || ""),
      monetized: isFreelance ? false : !!body.monetized,
      teaser: String(body.teaser || body.desc || "").slice(0, 180),
      privateHandle: isFreelance ? "" : privateHandle,
      handlePublic: isFreelance ? false : handlePublic && !!privateHandle,
      price,
      desc: String(body.desc || ""),
      img,
      images,
      stock: isFreelance ? 9999 : stock,
      soldCount: Math.max(0, Math.floor(Number(body.soldCount) || 0)),
      listingType,
      deliveryDays,
      revisions,
      status: "approved",
      listed: isAdmin ? !!body.listed : isFreelance || stock > 0,
      createdAt: new Date().toISOString(),
    });
  });

  const store = await readStore();
  const listing = store.listings.find((l) => l.id === listingId)!;
  return NextResponse.json({
    listing: publicListing(listing, true),
    message: isAdmin ? "Listing created." : "Your listing is live.",
  });
}

/** Seller/admin update stock (or other own-listing fields). */
export async function PATCH(req: Request) {
  const auth = await requireUser(["seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const id = Number(body.id);
  if (!id)
    return NextResponse.json({ error: "Listing id required" }, { status: 400 });

  try {
    await updateStore((data) => {
      const listing = data.listings.find((l) => l.id === id);
      if (!listing) throw new Error("Listing not found");
      const isAdmin = auth.user!.role === "admin";
      if (!isAdmin && listing.sellerId !== auth.user!.id)
        throw new Error("Forbidden");

      if (body.stock != null) {
        const stock = Number(body.stock);
        if (!(stock >= 0) || !Number.isFinite(stock))
          throw new Error("Stock must be 0 or more");
        listing.stock = Math.floor(stock);
        if (listing.stock > 0 && listing.status === "approved")
          listing.listed = true;
      }
      if (typeof body.title === "string" && body.title.trim())
        listing.title = body.title.trim();
      if (body.price != null) {
        const price = Number(body.price);
        if (!(price > 0)) throw new Error("Invalid price");
        listing.price = price;
      }
      if (typeof body.img === "string") listing.img = body.img;
      if (typeof body.handlePublic === "boolean") {
        listing.handlePublic = body.handlePublic;
      }
      if (typeof body.privateHandle === "string") {
        listing.privateHandle = body.privateHandle.trim();
      }
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  const store = await readStore();
  const listing = store.listings.find((l) => l.id === id)!;
  return NextResponse.json({ listing: publicListing(listing, true) });
}
