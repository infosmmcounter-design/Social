import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { readStore, updateStore } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { attachCryptoPayment, paymentView } from "@/lib/crypto/apply";
import { explorerTx } from "@/lib/crypto/constants";
import { scanCryptoPayments } from "@/lib/crypto/monitor";
import type { CryptoAsset } from "@/lib/types";

function canSee(
  order: { buyerId: number | null; buyerEmail: string; sellerId: number },
  user: { id: number; role: string; email: string } | null,
  email: string
) {
  if (user && (user.role === "admin" || user.id === order.buyerId || user.id === order.sellerId)) {
    return true;
  }
  if (user && order.buyerEmail.toLowerCase() === user.email.toLowerCase()) return true;
  if (email && order.buyerEmail.toLowerCase() === email) return true;
  return false;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const email = new URL(req.url).searchParams.get("email")?.trim().toLowerCase() || "";
  const user = await getCurrentUser();
  const before = await readStore();
  const order = before.orders.find((o) => o.id === Number(id));
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!canSee(order, user, email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (order.status === "awaiting_payment" && order.coin !== "Wallet balance") {
    await scanCryptoPayments();
  }
  const store = await readStore();
  const fresh = store.orders.find((o) => o.id === order.id)!;
  const pay = (store.cryptoPayments || []).find((p) => p.id === fresh.payId) ||
    (store.cryptoPayments || []).find(
      (p) => p.orderId === fresh.id && p.status !== "cancelled"
    );
  const view = paymentView(fresh, pay);
  let qrSvg = "";
  if (view.address) {
    qrSvg = await QRCode.toString(view.address, {
      type: "svg",
      margin: 1,
      width: 220,
      color: { dark: "#1a1408", light: "#ffffff" },
    });
  }
  return NextResponse.json({
    ...view,
    serverNow: new Date().toISOString(),
    explorer: view.txHash ? explorerTx(view.network, view.txHash) : null,
    qrSvg,
    lateNote:
      "If the transfer arrives after the timer, it is a late payment. It is not marked paid. Escrow reviews it and can refund it or accept it by hand.",
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const network = String(body.network || "") as CryptoAsset;
  const email = String(body.email || "").trim().toLowerCase();
  if (network !== "USDT_TRC20" && network !== "USDT_BEP20") {
    return NextResponse.json({ error: "Choose USDT TRC20 or USDT BEP20." }, { status: 400 });
  }
  const user = await getCurrentUser();
  try {
    await updateStore((data) => {
      const order = data.orders.find((o) => o.id === Number(id));
      if (!order) throw new Error("Order not found");
      if (!canSee(order, user, email)) throw new Error("Forbidden");
      if (order.status !== "awaiting_payment") throw new Error("This order is no longer waiting for payment.");
      const current = (data.cryptoPayments || []).find((p) => p.id === order.payId);
      if (current?.txHash) throw new Error("A transfer is already linked to this order.");
      attachCryptoPayment(data, order, network);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }
  return NextResponse.json({ ok: true });
}
