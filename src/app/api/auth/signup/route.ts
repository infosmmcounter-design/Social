import { NextResponse } from "next/server";
import { updateStore, nextId, publicUser } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { avatarDataUrl } from "@/lib/placeholders";

export async function POST(req: Request) {
  const body = await req.json();
  const email = String(body.email || "")
    .trim()
    .toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: "Name, email and password are required." },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 }
    );
  }

  const passwordHash = await hashPassword(password);
  let userId = 0;

  try {
    await updateStore((data) => {
      if (data.users.some((u) => u.email === email)) {
        throw new Error("Email already registered.");
      }
      userId = nextId(data);
      data.users.push({
        id: userId,
        email,
        passwordHash,
        name,
        role: "buyer",
        country: String(body.country || ""),
        bio: "",
        phone: String(body.phone || ""),
        avatarUrl: avatarDataUrl(name),
        verified: false,
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
  return NextResponse.json({ user: publicUser(user) });
}
