import { NextResponse } from "next/server";
import { readStore, updateStore, nextId, publicUser } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { avatarDataUrl } from "@/lib/placeholders";
import { suggestUsername } from "@/lib/username";

function clientId() {
  return (process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "").trim();
}

export async function GET() {
  const id = clientId();
  return NextResponse.json({ enabled: !!id, clientId: id });
}

type GoogleInfo = {
  aud?: string;
  sub?: string;
  email?: string;
  email_verified?: string | boolean;
  name?: string;
  picture?: string;
  error_description?: string;
};

export async function POST(req: Request) {
  const id = clientId();
  if (!id) {
    return NextResponse.json(
      { error: "Google sign-in is not connected. Add GOOGLE_CLIENT_ID on the server, or use email." },
      { status: 503 }
    );
  }
  const body = await req.json().catch(() => ({}));
  const credential = String(body.credential || "").trim();
  if (!credential) {
    return NextResponse.json({ error: "Google did not return a sign-in token." }, { status: 400 });
  }

  const infoRes = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
  );
  const info = (await infoRes.json().catch(() => ({}))) as GoogleInfo;
  if (!infoRes.ok || !info.sub || !info.email) {
    return NextResponse.json(
      { error: info.error_description || "Google could not verify that sign-in." },
      { status: 401 }
    );
  }
  if (info.aud !== id) {
    return NextResponse.json({ error: "This Google sign-in is for a different app." }, { status: 401 });
  }
  const verified = info.email_verified === true || info.email_verified === "true";
  if (!verified) {
    return NextResponse.json(
      { error: "Google has not verified this email yet. Finish that in your Google account, then try again." },
      { status: 400 }
    );
  }

  const email = info.email.trim().toLowerCase();
  const name = String(info.name || email.split("@")[0] || "Google user").trim();
  const picture = String(info.picture || "");
  const passwordHash = await hashPassword(`google:${info.sub}`);
  let userId = 0;
  let isNew = false;

  try {
    await updateStore((data) => {
      const bySub = data.users.find((u) => u.googleSub === info.sub && u.active);
      const byEmail = data.users.find((u) => u.email === email && u.active);
      const existing = bySub || byEmail;
      if (existing) {
        existing.googleSub = info.sub;
        existing.emailVerified = true;
        if (!existing.email) existing.email = email;
        if (!existing.name?.trim()) existing.name = name;
        if (!existing.username) {
          const taken = new Set(data.users.map((u) => (u.username || "").toLowerCase()));
          let username = suggestUsername(name || email);
          while (taken.has(username)) username = suggestUsername(name || email);
          existing.username = username;
        }
        if (picture.startsWith("https://") && !existing.avatarUrl.startsWith("data:")) {
          existing.avatarUrl = picture;
        }
        userId = existing.id;
        return;
      }
      const taken = new Set(data.users.map((u) => (u.username || "").toLowerCase()));
      let username = suggestUsername(name || email);
      while (taken.has(username)) username = suggestUsername(name || email);
      userId = nextId(data);
      isNew = true;
      data.users.push({
        id: userId,
        email,
        username,
        passwordHash,
        name,
        role: "seller",
        country: "",
        bio: "",
        phone: "",
        avatarUrl: picture.startsWith("https://") ? picture : avatarDataUrl(name),
        verified: false,
        emailVerified: true,
        googleSub: info.sub,
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
      { error: e instanceof Error ? e.message : "Google sign-in failed" },
      { status: 400 }
    );
  }

  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    return NextResponse.json({ error: "Account was not created." }, { status: 500 });
  }
  await createSession(user.id, user.role);
  return NextResponse.json({
    user: publicUser(user, false, { includeWallet: true }),
    isNew,
  });
}
