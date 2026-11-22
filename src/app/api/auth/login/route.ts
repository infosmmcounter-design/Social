import { NextResponse } from "next/server";
import { readStore, publicUser } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { friendlyStoreError } from "@/lib/store-backend";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");

  try {
    const store = await readStore();
    const user = store.users.find((u) => u.email === email && u.active);
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession(user.id, user.role);
    return NextResponse.json({
      user: publicUser(user, false, { includeWallet: true }),
    });
  } catch (e) {
    return NextResponse.json({ error: friendlyStoreError(e) }, { status: 500 });
  }
}
