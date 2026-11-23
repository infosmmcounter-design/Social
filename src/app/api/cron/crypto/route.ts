import { NextResponse } from "next/server";
import { scanCryptoPayments } from "@/lib/crypto/monitor";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await scanCryptoPayments({ force: true, lookbackMs: 30 * 60 * 60 * 1000 });
  return NextResponse.json({ ok: true });
}
