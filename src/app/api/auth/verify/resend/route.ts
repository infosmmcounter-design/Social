import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { updateStore } from "@/lib/db";
import { mailSetup } from "@/lib/mail";
import { newVerifyToken, sendVerifyEmail } from "@/lib/email-verify";

export async function POST(req: Request) {
  const auth = await getCurrentUser();
  if (!auth) {
    return NextResponse.json({ error: "Log in first." }, { status: 401 });
  }
  if (auth.emailVerified !== false) {
    return NextResponse.json({ ok: true, already: true, mailConfigured: mailSetup().configured });
  }

  const issued = newVerifyToken();
  await updateStore((data) => {
    const user = data.users.find((u) => u.id === auth.id);
    if (!user) return;
    user.emailVerifyTokenHash = issued.hash;
    user.emailVerifyExpires = issued.expires;
  });

  const { readStore } = await import("@/lib/db");
  const store = await readStore();
  const user = store.users.find((u) => u.id === auth.id);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }
  const sent = await sendVerifyEmail(user, issued.token, req);
  return NextResponse.json({
    ok: sent.sent,
    mailConfigured: sent.configured,
    error: sent.sent ? undefined : sent.error || (sent.configured ? "Could not send email." : undefined),
  });
}
