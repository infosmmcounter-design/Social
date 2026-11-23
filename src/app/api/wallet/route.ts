import { NextResponse } from "next/server";
import { nextId, readStore, updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { takenMicros } from "@/lib/crypto/apply";
import { assignExpectedMicro } from "@/lib/crypto/match";
import { microToUsd, usdToMicro } from "@/lib/crypto/money";
import { scanCryptoPayments } from "@/lib/crypto/monitor";
import type { CryptoAsset } from "@/lib/types";

export async function GET() {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  let store = await readStore();
  const waiting = (store.walletDeposits || []).some(
    (d) => d.userId === auth.user!.id && d.status === "pending" && d.expectedMicro
  );
  if (waiting) {
    try {
      await scanCryptoPayments();
      store = await readStore();
    } catch {
      /* show the last saved balance if a chain read fails */
    }
  }
  const me = store.users.find((u) => u.id === auth.user!.id);
  const deposits = (store.walletDeposits || [])
    .filter((d) => d.userId === auth.user!.id)
    .sort((a, b) => b.id - a.id);
  return NextResponse.json({
    balance: Number(me?.walletBalance || 0),
    deposits,
    wallets: (store.settings.cryptoWallets || []).filter(
      (w) => w.enabled && w.address
    ),
  });
}

/** Ask admin to credit the personal wallet after a USDT transfer. */
export async function POST(req: Request) {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await req.json();
  const amount = Number(body.amount);
  const network = String(body.network || "") as CryptoAsset;
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
    return NextResponse.json({ error: "Enter a valid USDT amount." }, { status: 400 });
  }
  if (network !== "USDT_TRC20" && network !== "USDT_BEP20") {
    return NextResponse.json({ error: "Choose USDT TRC20 or USDT BEP20." }, { status: 400 });
  }
  let created: {
    id: number;
    expected: string;
    address: string;
    network: CryptoAsset;
    expiresAt: string;
  } | null = null;
  try {
    await updateStore((data) => {
      const wallet = data.settings.cryptoWallets.find(
        (w) => w.enabled && w.asset === network && w.address
      );
      if (!wallet) throw new Error("That escrow wallet is not ready yet.");
      if (!data.walletDeposits) data.walletDeposits = [];
      const micro = assignExpectedMicro(usdToMicro(amount), takenMicros(data));
      const now = Date.now();
      const expiresAt = new Date(now + 60 * 60_000).toISOString();
      const id = nextId(data);
      data.walletDeposits.push({
        id,
        userId: auth.user!.id,
        amount,
        note: "Waiting for the exact USDT transfer",
        status: "pending",
        createdAt: new Date(now).toISOString(),
        network,
        address: wallet.address,
        expectedMicro: micro.toString(),
        txHash: null,
        expiresAt,
        confirmations: 0,
      });
      created = {
        id,
        expected: microToUsd(micro),
        address: wallet.address,
        network,
        expiresAt,
      };
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({
    ok: true,
    deposit: created,
    message: "Send the exact amount. The balance updates on its own after the network confirms.",
  });
}
