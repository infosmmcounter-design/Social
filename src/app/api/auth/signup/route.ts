import { NextResponse } from "next/server";
import { updateStore, nextId, publicUser } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { avatarDataUrl } from "@/lib/placeholders";
import { cleanUsername, newBackupCode, usernameError } from "@/lib/username";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  const username = cleanUsername(String(body.username || ""));

  if (!name || !password || !username) {
    return NextResponse.json(
      { error: "Name, username and password are required." },
      { status: 400 }
    );
  }
  const nameErr = usernameError(username);
  if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email, or leave it blank." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  const backupCode = newBackupCode();
  const backupCodeHash = await hashPassword(backupCode.replace(/[^A-Za-z0-9]/g, "").toUpperCase());
  const verifyCode = email ? String(100000 + Math.floor(Math.random() * 900000)) : "";
  const verifyCodeHash = verifyCode ? await hashPassword(verifyCode) : "";
  let userId = 0;

  try {
    await updateStore((data) => {
      if (email && data.users.some((u) => u.email === email)) {
        throw new Error("Email already registered.");
      }
      if (data.users.some((u) => (u.username || "").toLowerCase() === username)) {
        throw new Error("That username is taken.");
      }
      userId = nextId(data);
      data.users.push({
        id: userId,
        email,
        username,
        backupCodeHash,
        passwordHash,
        name,
        role: "seller",
        country: String(body.country || ""),
        bio: "",
        phone: String(body.phone || ""),
        avatarUrl: avatarDataUrl(name),
        verified: false,
        emailVerified: false,
        verifyCodeHash,
        rating: 0,
        reviewCount: 0,
        dummy: false,
        joinedAt: new Date().toISOString(),
        active: true,
        paymentMethods: [],
      });
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Signup failed" },
      { status: 400 }
    );
  }

  const { readStore } = await import("@/lib/db");
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId)!;
  await createSession(user.id, user.role);
  return NextResponse.json({
    user: publicUser(user, false, { includeWallet: true }),
    backupCode,
    verifyCode: verifyCode || undefined,
  });
}
