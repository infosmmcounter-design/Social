import { NextResponse } from "next/server";
import { updateStore, readStore, publicUser } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Seller edits own public profile (bio, country, avatar). */
export async function GET() {
  const auth = await requireUser(["seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const store = await readStore();
  const me = store.users.find((u) => u.id === auth.user!.id);
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ seller: publicUser(me, true, { revealDummy: true }) });
}

export async function PATCH(req: Request) {
  const auth = await requireUser(["seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  await updateStore((data) => {
    const me = data.users.find((u) => u.id === auth.user!.id);
    if (!me) throw new Error("Not found");
    if (typeof body.name === "string" && body.name.trim()) {
      me.name = body.name.trim().slice(0, 80);
    }
    if (typeof body.bio === "string") me.bio = body.bio.trim().slice(0, 800);
    if (typeof body.country === "string")
      me.country = body.country.trim().slice(0, 80);
    if (typeof body.phone === "string") me.phone = body.phone.trim().slice(0, 40);
    if (typeof body.avatarUrl === "string") {
      const av = body.avatarUrl.trim();
      // Allow https URLs or data URLs (local image pick).
      if (
        !av ||
        av.startsWith("https://") ||
        av.startsWith("http://") ||
        av.startsWith("data:image/")
      ) {
        me.avatarUrl = av;
      }
    }
  });

  const store = await readStore();
  const me = store.users.find((u) => u.id === auth.user!.id)!;
  return NextResponse.json({ seller: publicUser(me, true, { revealDummy: true }) });
}
