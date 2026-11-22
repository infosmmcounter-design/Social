import { promises as fs } from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import type { StoreData } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "store.json");
const KEY = "sf_store";

function hasDatabase() {
  return !!process.env.DATABASE_URL;
}

async function ensurePgTable() {
  const sql = neon(process.env.DATABASE_URL!);
  await sql`
    CREATE TABLE IF NOT EXISTS sf_kv (
      key text PRIMARY KEY,
      value jsonb NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `;
  return sql;
}

export async function loadRawStore(): Promise<StoreData | null> {
  if (hasDatabase()) {
    const sql = await ensurePgTable();
    const rows = await sql`SELECT value FROM sf_kv WHERE key = ${KEY} LIMIT 1`;
    if (!rows.length) return null;
    return rows[0].value as StoreData;
  }
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreData;
  } catch {
    return null;
  }
}

export async function saveRawStore(data: StoreData): Promise<void> {
  if (hasDatabase()) {
    const sql = await ensurePgTable();
    // neon serializes plain objects into jsonb
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = data as any;
    await sql`
      INSERT INTO sf_kv (key, value, updated_at)
      VALUES (${KEY}, ${value}, now())
      ON CONFLICT (key) DO UPDATE
      SET value = EXCLUDED.value, updated_at = now()
    `;
    return;
  }
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(data, null, 2), "utf8");
}

export function persistenceMode(): "postgres" | "file" {
  return hasDatabase() ? "postgres" : "file";
}
