import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await req.json();
  const current = String(body.current || "");
  const next = String(body.next || "");
  if (next.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters." },
      { status: 400 }
    );
  }
  const ok = await bcrypt.compare(current, auth.user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 400 });
  }
  const passwordHash = await bcrypt.hash(next, 10);
  await updateStore((data) => {
    const u = data.users.find((x) => x.id === auth.user!.id);
    if (u) u.passwordHash = passwordHash;
  });
  return NextResponse.json({ ok: true, message: "Password updated." });
}
