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
  try {
  await updateStore((data) => {
    const u = data.users.find((x) => x.id === auth.user!.id);
    if (!u) return;
    u.name = name;
    u.bio = String(body.bio || "").slice(0, 500);
    u.country = String(body.country || "").slice(0, 80);
    u.phone = String(body.phone || "").slice(0, 40);
    if (body.avatarUrl != null) {
      const av = String(body.avatarUrl);
      const photo = av.startsWith("data:image/jpeg") || av.startsWith("data:image/png") || av.startsWith("data:image/webp");
      const icon = av.startsWith("data:image/svg+xml");
      if (photo && av.length < 180_000) u.avatarUrl = av;
      else if (icon && av.length < 8_000) u.avatarUrl = av;
      else if (av) throw new Error("Use a smaller photo, or pick an icon.");
    }
    updated = u;
  });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({
    user: publicUser(updated, false, { includeWallet: true }),
  });
}
