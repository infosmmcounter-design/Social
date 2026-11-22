import { NextResponse } from "next/server";
import { updateStore } from "@/lib/db";
import { requireUser, hashPassword, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const current = String(body.current || "");
  const next = String(body.next || "");
  if (next.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters." },
      { status: 400 }
    );
  }
  if (!(await verifyPassword(current, auth.user.passwordHash))) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 400 });
  }

  const passwordHash = await hashPassword(next);
  await updateStore((data) => {
    const u = data.users.find((x) => x.id === auth.user!.id);
    if (u) u.passwordHash = passwordHash;
  });

  return NextResponse.json({ ok: true });
}
