import { NextResponse } from "next/server";
import { publicUser, updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Buyer or seller updates their own profile. Role stays the same. */
export async function POST(req: Request) {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await req.json();
  const name = String(body.name || "").trim();
  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  let updated = auth.user;
  await updateStore((data) => {
    const u = data.users.find((x) => x.id === auth.user!.id);
    if (!u) return;
    u.name = name;
    u.bio = String(body.bio || "").slice(0, 500);
    u.country = String(body.country || "").slice(0, 80);
    u.phone = String(body.phone || "").slice(0, 40);
    updated = u;
  });
  return NextResponse.json({
    user: publicUser(updated, false, { includeWallet: true }),
  });
}
