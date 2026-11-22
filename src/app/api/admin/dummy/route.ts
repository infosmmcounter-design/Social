import { NextResponse } from "next/server";
import {
  updateStore,
  nextId,
  readStore,
  publicUser,
  DUMMY_NAMES,
  DUMMY_LISTING_TEMPLATES,
} from "@/lib/db";
import { requireUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import type { Category } from "@/lib/types";
import { avatarDataUrl, listingCoverDataUrl } from "@/lib/placeholders";

export async function POST(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const count = Math.min(Math.max(Number(body.count) || 1, 1), 50);
  const listingsPerSeller = Math.min(Math.max(Number(body.listingsPerSeller) || 3, 1), 10);
  const customName = String(body.name || "").trim();
  const verified = body.verified !== false;
  const autoListings = body.autoListings !== false;

  const passwordHash = await bcrypt.hash("dummy123", 10);
  const createdIds: number[] = [];

  await updateStore((data) => {
    for (let i = 0; i < count; i++) {
      const sid = nextId(data);
      const name =
        customName && count === 1
          ? customName
          : DUMMY_NAMES[(data.users.length + i) % DUMMY_NAMES.length] +
            (count > 1 ? ` ${sid}` : "");
      const rating = Number((3.5 + Math.random() * 1.5).toFixed(1));
      const joined = new Date(
        Date.now() - Math.floor(Math.random() * 400) * 86400000
      ).toISOString();

      data.users.push({
        id: sid,
        email: `dummy.seller.${sid}@socialsflip.local`,
        passwordHash,
        name,
        role: "seller",
        country: ["Pakistan", "UAE", "USA", "UK", "India"][i % 5],
        bio: `${name} sells curated social accounts and services on SocialsFlip.`,
        phone: "",
        avatarUrl: avatarDataUrl(name, verified),
        verified,
        rating,
        reviewCount: Math.floor(Math.random() * 40),
        dummy: true,
        joinedAt: joined,
        active: true,
        paymentMethods: [],
      });
      createdIds.push(sid);

      if (autoListings) {
        for (let j = 0; j < listingsPerSeller; j++) {
          const tpl =
            DUMMY_LISTING_TEMPLATES[(i + j) % DUMMY_LISTING_TEMPLATES.length];
          const lid = nextId(data);
          const title = `${tpl.title} #${lid}`;
          const isFreelance = tpl.cat === "freelance";
          const isTool = tpl.cat === "other" || tpl.cat === "ai";
          data.listings.push({
            id: lid,
            sellerId: sid,
            title,
            cat: tpl.cat as Category,
            niche: tpl.niche,
            followers: isFreelance ? "" : tpl.followers,
            monetized: isFreelance ? false : tpl.monetized,
            teaser: isFreelance
              ? `${tpl.niche} freelance gig — escrow delivery.`
              : `${tpl.niche} account/service ready for escrow transfer.`,
            privateHandle: isFreelance ? "" : `@dummy_${tpl.cat}_${lid}`,
            price: tpl.price + Math.floor(Math.random() * 200),
            desc: isFreelance
              ? `Freelance Services board gig for ${tpl.niche}. Delivered in escrow chat.`
              : `Realistic demo listing for ${tpl.cat}. Private handle hidden until escrow deal or approved request.`,
            img: listingCoverDataUrl(tpl.cat, title),
            images: [],
            stock: isFreelance ? 9999 : 1,
            soldCount: isFreelance ? 5 + Math.floor(Math.random() * 80) : 0,
            listingType: isFreelance ? "service" : isTool ? "tool" : "account",
            deliveryDays: isFreelance ? 2 + Math.floor(Math.random() * 5) : 0,
            revisions: isFreelance ? 1 + Math.floor(Math.random() * 2) : 0,
            status: "approved",
            listed: true,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  });

  const store = await readStore();
  return NextResponse.json({
    ok: true,
    created: createdIds.map((id) =>
      publicUser(store.users.find((u) => u.id === id)!, true, { revealDummy: true })
    ),
    message: `${createdIds.length} dummy seller(s) created. Admin can reply as these sellers in deal chats.`,
  });
}

export async function DELETE(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => ({}));
  const id = Number(body.id);

  await updateStore((data) => {
    if (id) {
      const u = data.users.find((x) => x.id === id && x.dummy);
      if (!u) throw new Error("Dummy seller not found");
      u.active = false;
      data.listings = data.listings.filter((l) => l.sellerId !== id);
    } else {
      const dummyIds = new Set(
        data.users.filter((u) => u.dummy).map((u) => u.id)
      );
      data.users = data.users.filter((u) => !u.dummy);
      data.listings = data.listings.filter((l) => !dummyIds.has(l.sellerId));
    }
  });

  return NextResponse.json({ ok: true });
}
