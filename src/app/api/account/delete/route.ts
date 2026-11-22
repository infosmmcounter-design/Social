import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { updateStore } from "@/lib/db";
import { clearSession, requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  if (auth.user.role === "admin") {
    return NextResponse.json(
      { error: "The admin account cannot be deleted here." },
      { status: 400 }
    );
  }
  const body = await req.json();
  const password = String(body.password || "");
  const ok = await bcrypt.compare(password, auth.user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Password is wrong." }, { status: 400 });
  }
  await updateStore((data) => {
    const u = data.users.find((x) => x.id === auth.user!.id);
    if (u) u.active = false;
  });
  await clearSession();
  return NextResponse.json({ ok: true });
}
