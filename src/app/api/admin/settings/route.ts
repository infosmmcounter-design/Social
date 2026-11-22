import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { CryptoWallet } from "@/lib/types";

export async function GET() {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const store = await readStore();
  return NextResponse.json({ settings: store.settings, fee: store.fee });
}

export async function POST(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  await updateStore((data) => {
    if (body.fee != null) {
      data.fee = Number(body.fee);
      data.settings.fee = Number(body.fee);
    }
    // Local / direct-to-seller pay is intentionally disabled (crypto-only).
    data.settings.allowDirectPayToSeller = false;
    if (typeof body.autoDetectCrypto === "boolean") {
      data.settings.autoDetectCrypto = body.autoDetectCrypto;
    }
    if (body.paymentWindowMins != null) {
      data.settings.paymentWindowMins = Math.min(
        180,
        Math.max(15, Number(body.paymentWindowMins) || 60)
      );
    }
    if (typeof body.autoHoldOnProof === "boolean") {
      data.settings.autoHoldOnProof = body.autoHoldOnProof;
    }
    if (body.deliveryWindowHours != null) {
      data.settings.deliveryWindowHours = Math.min(
        168,
        Math.max(1, Number(body.deliveryWindowHours) || 24)
      );
    }
    if (body.escrowHoldDays != null) {
      data.settings.escrowHoldDays = Math.min(
        60,
        Math.max(1, Number(body.escrowHoldDays) || 7)
      );
    }
    if (Array.isArray(body.cryptoWallets)) {
      data.settings.cryptoWallets = body.cryptoWallets as CryptoWallet[];
    }
  });

  const store = await readStore();
  return NextResponse.json({ settings: store.settings });
}
