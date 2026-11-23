import { NextResponse } from "next/server";
import { addSystemMessage, calcTotals, updateStore } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { attachCryptoPayment } from "@/lib/crypto/apply";

/** Seller updates the deal price before the buyer pays. Fee and USDT amount follow. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const nextPrice = Math.round(Number(body.price) * 100) / 100;
  if (!Number.isFinite(nextPrice) || nextPrice <= 0) {
    return NextResponse.json({ error: "Enter a price greater than zero." }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in required." }, { status: 401 });

  try {
    await updateStore((data) => {
      const order = data.orders.find((o) => o.id === Number(id));
      if (!order) throw new Error("Order not found");
      const seller = data.users.find((u) => u.id === order.sellerId);
      const allowed = user.role === "admin" || user.id === order.sellerId;
      if (!allowed || !seller) throw new Error("Only the seller can change this price.");
      if (order.status !== "awaiting_payment") {
        throw new Error("The price can change only before payment is held.");
      }
      if (order.payTxHash) throw new Error("A transfer is already linked to this order.");
      const active = (data.cryptoPayments || []).find(
        (p) =>
          p.orderId === order.id &&
          (p.status === "waiting" || p.status === "detected" || p.status === "confirming")
      );
      if (active?.txHash) throw new Error("A transfer is already linked to this order.");

      const before = order.total;
      const totals = calcTotals(nextPrice, seller, data.fee);
      order.price = totals.price;
      order.fee = totals.fee;
      order.total = totals.total;
      order.paymentDueAt = new Date(
        Date.now() + (order.paymentWindowMins || 60) * 60_000
      ).toISOString();

      for (const pay of data.cryptoPayments || []) {
        if (
          pay.orderId === order.id &&
          !pay.txHash &&
          (pay.status === "waiting" || pay.status === "detected" || pay.status === "confirming")
        ) {
          pay.status = "cancelled";
          pay.reason = "Seller updated the price";
        }
      }
      order.payId = null;
      order.payStatus = null;
      order.payExpectedMicro = null;
      order.payReceivedMicro = null;
      attachCryptoPayment(data, order);

      addSystemMessage(
        order,
        `Seller updated the price. Previous total ${before.toFixed(2)} USDT. New price ${totals.price.toFixed(2)} USDT, escrow fee ${totals.fee.toFixed(2)} USDT. Pay ${totals.total.toFixed(2)} USDT.`
      );
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not update price" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
