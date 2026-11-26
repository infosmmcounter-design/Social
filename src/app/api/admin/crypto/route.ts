import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { acceptReviewedPayment } from "@/lib/crypto/apply";
import { explorerTx, networkLabel } from "@/lib/crypto/constants";
import { microToUsd } from "@/lib/crypto/money";
import { scanCryptoPayments } from "@/lib/crypto/monitor";

export async function GET() {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await scanCryptoPayments();
  const store = await readStore();
  const payments = [...(store.cryptoPayments || [])].reverse().map((p) => ({
    ...p,
    expected: microToUsd(BigInt(p.expectedMicro || "0")),
    received: p.receivedMicro ? microToUsd(BigInt(p.receivedMicro)) : null,
    networkLabel: networkLabel(p.network),
    explorer: p.txHash ? explorerTx(p.network, p.txHash) : null,
    orderStatus: store.orders.find((o) => o.id === p.orderId)?.status || null,
  }));
  const unmatched = [...(store.unmatchedTxs || [])].map((u) => ({
    ...u,
    amount: microToUsd(BigInt(u.amountMicro || "0")),
    networkLabel: networkLabel(u.network),
    explorer: explorerTx(u.network, u.txHash),
  }));
  return NextResponse.json({ payments, unmatched });
}

export async function POST(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => ({}));
  const orderId = Number(body.orderId);
  const txHash = String(body.txHash || "").trim();
  if (!orderId || !txHash) {
    return NextResponse.json({ error: "Order and transaction hash are required." }, { status: 400 });
  }
  try {
    await updateStore(async (data) => {
      await acceptReviewedPayment(data, orderId, txHash);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
