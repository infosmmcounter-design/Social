import { NextResponse } from "next/server";
import { publicUser, updateStore } from "@/lib/db";
import { tokenMatches } from "@/lib/email-verify";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token || "").trim();
  if (!token || token.length < 20) {
    return NextResponse.json({ error: "Invalid verification link." }, { status: 400 });
  }

  let ok = false;
  let userId = 0;
  await updateStore((data) => {
    const user = data.users.find((u) => tokenMatches(u, token));
    if (!user) return;
    user.emailVerified = true;
    user.emailVerifyTokenHash = "";
    user.emailVerifyExpires = "";
    userId = user.id;
    ok = true;
  });

  if (!ok) {
    return NextResponse.json(
      { error: "This verification link is invalid or expired." },
      { status: 400 }
    );
  }

  const { readStore } = await import("@/lib/db");
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  return NextResponse.json({
    ok: true,
    user: user ? publicUser(user, false, { includeWallet: true }) : null,
  });
}
