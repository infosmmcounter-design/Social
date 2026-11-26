import { NextResponse } from "next/server";
import { persistenceMode, readStore } from "@/lib/db";
import { friendlyStoreError } from "@/lib/store-backend";

export async function GET() {
  try {
    const store = await readStore();
    return NextResponse.json({
      ok: true,
      persistence: persistenceMode(),
      listings: store.listings.filter((l) => l.listed).length,
      walletsConfigured: store.settings.cryptoWallets.filter((w) => w.address).length,
      tronGrid: !!process.env.TRONGRID_API_KEY,
      bscRpc: process.env.BSC_RPC_URL ? "custom" : "public",
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        persistence: persistenceMode(),
        error: friendlyStoreError(e),
      },
      { status: 500 }
    );
  }
}
