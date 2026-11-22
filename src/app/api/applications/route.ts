import { NextResponse } from "next/server";
import { updateStore, nextId, readStore, publicUser } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { Category, User } from "@/lib/types";
import bcrypt from "bcryptjs";
import { avatarDataUrl, listingCoverDataUrl } from "@/lib/placeholders";

export async function GET() {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const store = await readStore();
  return NextResponse.json({
    applications: [...store.applications].sort((a, b) => b.id - a.id),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const title = String(body.title || "").trim();
  const price = Number(body.price);

  if (!name || !email || !title || !price) {
    return NextResponse.json(
      { error: "Name, email, first listing title and price are required." },
      { status: 400 }
    );
  }

  let appId = 0;
  await updateStore((data) => {
    appId = nextId(data);
    data.applications.push({
      id: appId,
      name,
      email,
      phone: String(body.phone || ""),
      country: String(body.country || ""),
      about: String(body.about || ""),
      title,
      cat: (body.cat || "other") as Category,
      price,
      desc: String(body.desc || ""),
      status: "new",
      createdAt: new Date().toISOString(),
    });
  });

  return NextResponse.json({
    ok: true,
    id: appId,
    message: "Application received. Admin will review and approve at their discretion.",
  });
}

export async function PATCH(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const id = Number(body.id);
  const approve = !!body.approve;

  let sellerId = 0;
  const tempPass = "seller" + Math.floor(1000 + Math.random() * 9000);
  const passwordHash = await bcrypt.hash(tempPass, 10);
  let createdNewUser = false;

  try {
    await updateStore((data) => {
      const app = data.applications.find((a) => a.id === id);
      if (!app || app.status !== "new") throw new Error("Application not found");
      app.status = approve ? "approved" : "rejected";
      if (!approve) return;

      let user: User | undefined = data.users.find((u) => u.email === app.email);
      if (!user) {
        sellerId = nextId(data);
        createdNewUser = true;
        user = {
          id: sellerId,
          email: app.email,
          passwordHash,
          name: app.name,
          role: "seller",
          country: app.country,
          bio: app.about,
          phone: app.phone,
          avatarUrl: avatarDataUrl(app.name),
          verified: false,
          rating: 0,
          reviewCount: 0,
          dummy: false,
          joinedAt: new Date().toISOString(),
          active: true,
          paymentMethods: [],
        };
        data.users.push(user);
      } else {
        user.role = "seller";
        user.bio = app.about || user.bio;
        user.country = app.country || user.country;
        sellerId = user.id;
      }

      // Pending so admin can review/publish from Listings tab
      data.listings.push({
        id: nextId(data),
        sellerId: user.id,
        title: app.title,
        cat: app.cat,
        niche: "",
        followers: "",
        monetized: false,
        teaser: app.desc.slice(0, 180),
        privateHandle: "",
        price: app.price,
        desc: app.desc,
        img: listingCoverDataUrl(app.cat, app.title),
        images: [],
        stock: 1,
        listingType: app.cat === "other" ? "service" : "account",
        deliveryDays: app.cat === "other" ? 3 : 0,
        revisions: app.cat === "other" ? 1 : 0,
        status: "pending",
        listed: false,
        createdAt: new Date().toISOString(),
      });
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  const store = await readStore();
  const seller = store.users.find((u) => u.id === sellerId);
  return NextResponse.json({
    ok: true,
    seller: seller ? publicUser(seller) : null,
    tempPassword: approve && createdNewUser ? tempPass : null,
    message: approve
      ? createdNewUser
        ? "Seller approved. New login created — share the temporary password."
        : "Existing account promoted to seller. Listing awaits approval in Listings."
      : "Application rejected.",
  });
}
