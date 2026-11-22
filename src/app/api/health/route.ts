import { NextResponse } from "next/server";
import { persistenceMode, readStore } from "@/lib/db";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({
    ok: true,
    persistence: persistenceMode(),
    listings: store.listings.filter((l) => l.listed).length,
    walletsConfigured: store.settings.cryptoWallets.filter((w) => w.address).length,
  });
}
