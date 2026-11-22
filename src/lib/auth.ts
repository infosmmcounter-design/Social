import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { readStore, publicUser } from "./db";
import type { Role, User } from "./types";

const SESSION_COOKIE = "sf_session";

export type SessionUser = ReturnType<typeof publicUser>;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: number, role: Role) {
  const jar = await cookies();
  const value = Buffer.from(JSON.stringify({ userId, role, t: Date.now() })).toString(
    "base64url"
  );
  jar.set(SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<{ userId: number; role: Role } | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as {
      userId: number;
      role: Role;
    };
    if (!parsed?.userId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();
  if (!session) return null;
  const store = await readStore();
  const user = store.users.find((u) => u.id === session.userId && u.active);
  return user || null;
}

export async function requireUser(roles?: Role[]) {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized", status: 401 as const, user: null };
  if (roles && !roles.includes(user.role)) {
    return { error: "Forbidden", status: 403 as const, user: null };
  }
  return { error: null, status: 200 as const, user };
}
