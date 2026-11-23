import { NextResponse } from "next/server";
import { readStore, publicUser } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { friendlyStoreError } from "@/lib/store-backend";

export async function POST(req: Request) {
  const body = await req.json();
  const login = String(body.email || body.login || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");

  try {
    const store = await readStore();
    const user = store.users.find(
      (u) =>
        u.active &&
        (u.email === login || (u.username || "").toLowerCase() === login)
    );
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid username or password." }, { status: 401 });
    }

    await createSession(user.id, user.role);
    return NextResponse.json({
      user: publicUser(user, false, { includeWallet: true }),
    });
  } catch (e) {
    return NextResponse.json({ error: friendlyStoreError(e) }, { status: 500 });
  }
}
