import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { newBackupCode } from "@/lib/username";

export async function POST(req: Request) {
  const auth = await getCurrentUser();
  if (!auth) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || "");
  if (!(await verifyPassword(password, auth.passwordHash))) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 400 });
  }
  const backupCode = newBackupCode();
  const backupCodeHash = await hashPassword(
    backupCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase()
  );
  await updateStore((data) => {
    const user = data.users.find((u) => u.id === auth.id);
    if (user) user.backupCodeHash = backupCodeHash;
  });
  return NextResponse.json({ backupCode });
}
