import { NextResponse } from "next/server";
import { publicUser, updateStore } from "@/lib/db";
import { createSession, hashPassword, verifyPassword } from "@/lib/auth";
import { canonicalBackupCode, validBackupCode } from "@/lib/username";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const login = String(body.login || body.username || "")
    .trim()
    .toLowerCase();
  const code = canonicalBackupCode(String(body.backupCode || ""));
  const password = String(body.password || "");

  if (!login || !validBackupCode(code)) {
    return NextResponse.json(
      { error: "Username and backup code are required." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  let userId = 0;
  let matched = false;
  const passwordHash = await hashPassword(password);
  await updateStore(async (data) => {
    const user = data.users.find(
      (u) =>
        u.active &&
        (u.email === login || (u.username || "").toLowerCase() === login)
    );
    if (!user?.backupCodeHash) return;
    if (!(await verifyPassword(code, user.backupCodeHash))) return;
    user.passwordHash = passwordHash;
    userId = user.id;
    matched = true;
  });

  if (!matched) {
    return NextResponse.json(
      { error: "That username and backup code do not match." },
      { status: 400 }
    );
  }

  const { readStore } = await import("@/lib/db");
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId)!;
  await createSession(user.id, user.role);
  return NextResponse.json({
    user: publicUser(user, false, { includeWallet: true }),
  });
}
