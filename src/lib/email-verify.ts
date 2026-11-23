import { createHash, randomBytes, timingSafeEqual } from "crypto";
import type { User } from "./types";
import { appOrigin, sendMail } from "./mail";

const DAY = 24 * 60 * 60 * 1000;

export function newVerifyToken() {
  const token = randomBytes(32).toString("hex");
  return { token, hash: hashToken(token), expires: new Date(Date.now() + DAY).toISOString() };
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function tokenMatches(user: User, token: string) {
  const hash = user.emailVerifyTokenHash || "";
  const given = hashToken(token);
  if (!hash || hash.length !== given.length) return false;
  const a = Buffer.from(hash);
  const b = Buffer.from(given);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  if (!user.emailVerifyExpires) return false;
  return new Date(user.emailVerifyExpires).getTime() > Date.now();
}

export async function sendVerifyEmail(user: User, token: string, req?: Request) {
  const link = `${appOrigin(req)}/auth/verify?token=${encodeURIComponent(token)}`;
  const text = `Confirm your SocialsFlip account.\n\nOpen this link within 24 hours:\n${link}\n\nIf you did not create this account, ignore this email.`;
  const html = `<p>Confirm your SocialsFlip account.</p><p><a href="${link}">Verify email</a></p><p>This link works for 24 hours. If you did not create this account, ignore this email.</p>`;
  return sendMail({
    to: user.email,
    subject: "Verify your SocialsFlip email",
    text,
    html,
  });
}
