import { NextResponse } from "next/server";
import { readStore, updateStore, publicUser, nextId } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { avatarDataUrl } from "@/lib/placeholders";

export async function GET() {
  const auth = await requireUser(["admin"]);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const store = await readStore();
  // Real sellers only — exclude admin accounts even if official=true
  const sellers = store.users.filter(
    (u) => u.role === "seller" && u.active
  );
  return NextResponse.json({
    sellers: sellers.map((s) => ({
      ...publicUser(s, true, { revealDummy: true }),
      listingCount: store.listings.filter((l) => l.sellerId === s.id).length,
    })),
  });
}

/** Create a complete seller from admin (real or dummy). */
export async function POST(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const name = String(body.name || "").trim();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const country = String(body.country || "").trim();
  const bio = String(body.bio || "").trim();
  const phone = String(body.phone || "").trim();
  const password = String(body.password || "").trim() || "seller123";
  const verified = body.verified !== false;
  const dummy = !!body.dummy;
  const avatarUrl = String(body.avatarUrl || "").trim();

  if (!name || !email) {
    return NextResponse.json(
      { error: "Seller name and email are required." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  let sellerId = 0;

  try {
    await updateStore((data) => {
      if (data.users.some((u) => u.email === email)) {
        throw new Error("Email already registered.");
      }
      sellerId = nextId(data);
      data.users.push({
        id: sellerId,
        email,
        passwordHash,
        name,
        role: "seller",
        country,
        bio:
          bio ||
          `${name} sells social accounts and services on SocialsFlip.`,
        phone,
        avatarUrl: avatarUrl || avatarDataUrl(name, verified),
        verified,
        rating: 0,
        reviewCount: 0,
        dummy,
        joinedAt: new Date().toISOString(),
        active: true,
        paymentMethods: [],
      });
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  const store = await readStore();
  const seller = store.users.find((u) => u.id === sellerId)!;
  return NextResponse.json({
    ok: true,
    seller: publicUser(seller, true, { revealDummy: true }),
    tempPassword: password,
    message: dummy
      ? "Dummy seller created. Admin can reply as this seller in chats."
      : "Real seller created. They can log in with the email/password you set.",
  });
}

export async function PATCH(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json();
  const id = Number(body.id);
  try {
    await updateStore((data) => {
      const s = data.users.find((u) => u.id === id && u.role === "seller");
      if (!s) throw new Error("Seller not found");
      if (typeof body.verified === "boolean") s.verified = body.verified;
      if (typeof body.dummy === "boolean") s.dummy = body.dummy;
      if (typeof body.avatarUrl === "string") s.avatarUrl = body.avatarUrl;
      if (typeof body.bio === "string") s.bio = body.bio;
      if (typeof body.country === "string") s.country = body.country;
      if (typeof body.name === "string" && body.name.trim())
        s.name = body.name.trim();
      if (typeof body.phone === "string") s.phone = body.phone;
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json();
  const id = Number(body.id);

  try {
    await updateStore((data) => {
      const s = data.users.find((u) => u.id === id);
      if (!s || s.official || s.role !== "seller")
        throw new Error("Cannot remove this seller");
      s.active = false;
      data.listings = data.listings.filter((l) => l.sellerId !== id);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
