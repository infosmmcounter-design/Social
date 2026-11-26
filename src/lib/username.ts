import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** SF- plus three groups. About 17 characters, hard to guess, easy to write down. */
export function newBackupCode() {
  const bytes = randomBytes(12);
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]);
  const groups = [0, 4, 8].map((i) => chars.slice(i, i + 4).join(""));
  return `SF-${groups.join("-")}`;
}

export function canonicalBackupCode(raw: string) {
  return raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function validBackupCode(raw: string) {
  return /^SF[A-Z2-9]{12}$/.test(canonicalBackupCode(raw));
}

export function cleanUsername(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export function usernameError(name: string): string | null {
  if (!/^[a-z0-9_]{3,20}$/.test(name)) {
    return "Username must be 3–20 letters, numbers, or underscores.";
  }
  return null;
}

export function suggestUsername(name: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 12) || "user";
  const n = 1000 + (randomBytes(2).readUInt16BE(0) % 9000);
  return `${base}${n}`.slice(0, 20);
}
