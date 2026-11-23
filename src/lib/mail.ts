import nodemailer from "nodemailer";

export type MailSetup = {
  configured: boolean;
  host: string;
  port: number;
  user: string;
  from: string;
  missing: string[];
};

/** What the site owner must set before verification email can leave the server. */
export function mailSetup(): MailSetup {
  const host = (process.env.SMTP_HOST || "").trim();
  const user = (process.env.SMTP_USER || "").trim();
  const pass = process.env.SMTP_PASS || "";
  const from = (process.env.SMTP_FROM || user).trim();
  const port = Number(process.env.SMTP_PORT || 465);
  const missing: string[] = [];
  if (!host) missing.push("SMTP_HOST");
  if (!user) missing.push("SMTP_USER");
  if (!pass) missing.push("SMTP_PASS");
  if (!from) missing.push("SMTP_FROM");
  if (!process.env.APP_URL) missing.push("APP_URL");
  return {
    configured: missing.filter((k) => k !== "APP_URL").length === 0,
    host,
    port: Number.isFinite(port) ? port : 465,
    user,
    from,
    missing,
  };
}

export function appOrigin(req?: Request): string {
  const fromEnv = (process.env.APP_URL || "").trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (req) {
    const host =
      req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    if (host) return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ sent: boolean; configured: boolean; error?: string }> {
  const setup = mailSetup();
  if (!setup.configured) return { sent: false, configured: false };
  try {
    const transport = nodemailer.createTransport({
      host: setup.host,
      port: setup.port,
      secure: setup.port === 465,
      auth: { user: setup.user, pass: process.env.SMTP_PASS || "" },
    });
    await transport.sendMail({
      from: setup.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return { sent: true, configured: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Mail failed";
    return { sent: false, configured: true, error: message };
  }
}
