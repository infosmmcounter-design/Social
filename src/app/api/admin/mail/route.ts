import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { mailSetup, sendMail } from "@/lib/mail";

export async function GET() {
  const auth = await getCurrentUser();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }
  const setup = mailSetup();
  return NextResponse.json({
    configured: setup.configured,
    host: setup.host,
    port: setup.port,
    user: setup.user,
    from: setup.from,
    missing: setup.missing,
  });
}

export async function POST() {
  const auth = await getCurrentUser();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
  }
  const result = await sendMail({
    to: auth.email,
    subject: "SocialsFlip mailbox test",
    text: "This is a test from SocialsFlip. If you can read it, signup verification email can send.",
    html: "<p>This is a test from SocialsFlip. If you can read it, signup verification email can send.</p>",
  });
  return NextResponse.json(
    {
      ...result,
      error: result.sent
        ? undefined
        : result.error ||
          "Mailbox is not connected. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.",
    },
    { status: result.sent ? 200 : 400 }
  );
}
