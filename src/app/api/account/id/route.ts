import { NextResponse } from "next/server";
import { publicUser, updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const MAX_CHARS = 2_800_000;

/** Store an ID photo and schedule the verified badge after 5 minutes. */
export async function POST(req: Request) {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json().catch(() => ({}));
  const image = String(body.image || "").trim();
  if (!image.startsWith("data:image/")) {
    return NextResponse.json(
      { error: "Upload a photo of your ID card." },
      { status: 400 }
    );
  }
  if (image.length > MAX_CHARS) {
    return NextResponse.json(
      { error: "That photo is too large. Use an image under about 2MB." },
      { status: 400 }
    );
  }

  const waitMin = 5;
  const verifyAt = new Date(Date.now() + waitMin * 60 * 1000).toISOString();

  await updateStore((data) => {
    const me = data.users.find((u) => u.id === auth.user!.id);
    if (!me) throw new Error("Not found");
    if (me.verified) return;
    me.idDocument = image;
    me.idSubmittedAt = new Date().toISOString();
    me.idVerifyAt = verifyAt;
  });

  const { readStore } = await import("@/lib/db");
  const store = await readStore();
  const me = store.users.find((u) => u.id === auth.user.id);
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    user: publicUser(me, false, { includeWallet: true }),
    message: "ID submitted. Your profile verification is in progress.",
  });
}
