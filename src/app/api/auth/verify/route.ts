import { NextResponse } from "next/server";
import { readStore, updateStore, publicUser } from "@/lib/db";
import { getCurrentUser, verifyPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }
  if (user.emailVerified) {
    return NextResponse.json({
      user: publicUser(user, false, { includeWallet: true }),
      already: true,
    });
  }
  const body = await req.json().catch(() => ({}));
  const code = String(body.code || "").trim();
  if (!/^\d{6}$/.test(code) || !user.verifyCodeHash) {
    return NextResponse.json(
      { error: "Enter the 6-digit code from signup. You can also skip and keep using the account." },
      { status: 400 }
    );
  }
  const ok = await verifyPassword(code, user.verifyCodeHash);
  if (!ok) {
    return NextResponse.json({ error: "That code does not match." }, { status: 400 });
  }
  await updateStore((data) => {
    const row = data.users.find((u) => u.id === user.id);
    if (!row) throw new Error("Account not found");
    row.emailVerified = true;
    row.verifyCodeHash = "";
  });
  const store = await readStore();
  const fresh = store.users.find((u) => u.id === user.id)!;
  return NextResponse.json({
    user: publicUser(fresh, false, { includeWallet: true }),
  });
}
