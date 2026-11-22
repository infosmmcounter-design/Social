import { NextResponse } from "next/server";
import {
  readStore,
  updateStore,
  nextId,
  publicUser,
  publicListing,
} from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { isFreelanceCategory, type Category, type DealOffer } from "@/lib/types";
import { avatarDataUrl, listingCoverDataUrl } from "@/lib/placeholders";
import { localeFromRequest } from "@/lib/i18n/api-locale";
import {
  localizeListing,
  localizeSeller,
  localizeText,
} from "@/lib/i18n/content";

function token() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 6)
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const t = searchParams.get("token") || "";
  const scope = searchParams.get("scope") || "";
  const store = await readStore();
  const user = await getCurrentUser();

  const locale = localeFromRequest(req);

  if (t) {
    const offer = store.offers.find((o) => o.token === t);
    if (!offer)
      return NextResponse.json({ error: "Deal link not found" }, { status: 404 });
    const listing = store.listings.find((l) => l.id === offer.listingId);
    const creator = store.users.find((u) => u.id === offer.creatorId);
    const localizedListing = listing
      ? localizeListing(publicListing(listing, false), locale)
      : null;
    const localizedOffer = {
      ...offer,
      title: localizedListing?.title || localizeText(offer.title, locale),
      desc: localizedListing?.desc || localizeText(offer.desc, locale),
      niche: localizedListing?.niche || localizeText(offer.niche, locale),
    };
    return NextResponse.json({
      locale,
      offer: localizedOffer,
      listing: localizedListing,
      creator: creator ? localizeSeller(publicUser(creator), locale) : null,
      settings: {
        escrowHoldDays: store.settings.escrowHoldDays || 7,
        deliveryWindowHours: store.settings.deliveryWindowHours || 24,
        fee: store.fee,
        wallets: store.settings.cryptoWallets.filter((w) => w.enabled && w.address),
      },
    });
  }

  if (scope === "admin") {
    const auth = await requireUser(["admin"]);
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
  } else if (user) {
    // own offers
  } else {
    return NextResponse.json({ offers: [] });
  }

  let list = store.offers;
  if (scope !== "admin" && user) {
    list = list.filter((o) => o.creatorId === user.id);
  }

  const creators = Object.fromEntries(
    store.users.map((u) => [u.id, publicUser(u)])
  );
  return NextResponse.json({
    offers: [...list]
      .sort((a, b) => b.id - a.id)
      .map((o) => ({
        ...o,
        creator: creators[o.creatorId] || null,
        sharePath: `/offer/${o.token}`,
      })),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const title = String(body.title || "").trim();
  const price = Number(body.price);
  const desc = String(body.desc || "").trim();
  const cat = (body.cat || "other") as Category;
  const creatorName = String(body.name || "").trim();
  const creatorEmail = String(body.email || "")
    .trim()
    .toLowerCase();
  const privateHandle = String(body.privateHandle || "").trim();
  const stock = Math.max(1, Number(body.stock) || 1);
  const monetized = !!body.monetized;
  const followers = String(body.followers || "");
  const niche = String(body.niche || "");

  if (!title || !(price > 0) || !desc) {
    return NextResponse.json(
      { error: "Title, price and description are required." },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();
  if (!user && (!creatorName || !creatorEmail)) {
    return NextResponse.json(
      { error: "Your name and email are required to create a deal link." },
      { status: 400 }
    );
  }

  const generatedPass =
    Math.random().toString(36).slice(2, 8) +
    Math.random().toString(36).slice(2, 6);
  const passwordHash = await bcrypt.hash(
    String(body.password || generatedPass),
    10
  );
  let createdGuestSeller = false;
  let guestTempPassword: string | null = null;
  let offerId = 0;
  let offerToken = "";

  try {
    await updateStore((data) => {
      const emailForCreator = creatorEmail || user?.email || "";
      const outside =
        !user ||
        (!!emailForCreator && emailForCreator !== user.email.toLowerCase());
      let creatorId = user?.id ?? 0;
      if (!outside && user) {
        creatorId = user.id;
        const u = data.users.find((x) => x.id === user.id);
        if (u && u.role === "buyer") u.role = "seller";
      } else {
        const existing = data.users.find((u) => u.email === creatorEmail);
        if (!existing) {
          createdGuestSeller = true;
          guestTempPassword = String(body.password || generatedPass);
          creatorId = nextId(data);
          data.users.push({
            id: creatorId,
            email: creatorEmail,
            passwordHash,
            name: creatorName,
            role: "seller",
            country: String(body.country || ""),
            bio: String(body.bio || `${creatorName} — deal creator on SocialsFlip`),
            phone: "",
            avatarUrl: avatarDataUrl(creatorName),
            verified: false,
            rating: 0,
            reviewCount: 0,
            dummy: false,
            joinedAt: new Date().toISOString(),
            active: true,
            paymentMethods: [],
          });
        } else {
          if (existing.role === "buyer") existing.role = "seller";
          creatorId = existing.id;
        }
      }

      const listingId = nextId(data);
      data.listings.push({
        id: listingId,
        sellerId: creatorId,
        title,
        cat,
        niche,
        followers,
        monetized,
        teaser: desc.slice(0, 180),
        privateHandle,
        price,
        desc,
        img: listingCoverDataUrl(cat, title),
        images: [],
        stock: isFreelanceCategory(cat) ? 9999 : stock,
        soldCount: 0,
        listingType: isFreelanceCategory(cat)
          ? "service"
          : cat === "other"
            ? "tool"
            : "account",
        deliveryDays: isFreelanceCategory(cat) ? 3 : 0,
        revisions: isFreelanceCategory(cat) ? 1 : 0,
        // Offer-only: approved but not in public browse grid unless desired
        status: "approved",
        listed: false,
        createdAt: new Date().toISOString(),
      });

      offerId = nextId(data);
      offerToken = token();
      const offer: DealOffer = {
        id: offerId,
        token: offerToken,
        creatorId,
        listingId,
        title,
        cat,
        desc,
        price,
        stock,
        monetized,
        followers,
        niche,
        privateHandle,
        status: "open",
        orderId: null,
        createdAt: new Date().toISOString(),
      };
      data.offers.push(offer);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  const store = await readStore();
  const offer = store.offers.find((o) => o.id === offerId)!;
  return NextResponse.json({
    offer,
    sharePath: `/offer/${offer.token}`,
    tempPassword: createdGuestSeller ? guestTempPassword : null,
    message: createdGuestSeller
      ? "Deal link created for an outside creator. Save the temp password. Admin manages this deal under Created deals. The buyer can pay without an account."
      : "Deal link created. Copy and send to your buyer. They pay SocialsFlip escrow — not you directly. Admin can open every created deal.",
  });
}
