import { NextResponse } from "next/server";
import {
  updateStore,
  readStore,
  addSystemMessage,
  setDealStatus,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const proof = String(body.txHash || body.proof || "").trim();
  const guestEmail = String(body.email || "")
    .trim()
    .toLowerCase();
  const markPaidOnly = !!body.markPaidOnly;

  if (!proof && !markPaidOnly) {
    return NextResponse.json(
      { error: "Transaction hash / payment proof is required." },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();

  try {
    await updateStore((data) => {
      const order = data.orders.find((o) => o.id === Number(id));
      if (!order) throw new Error("Order not found");
      if (order.status !== "awaiting_payment" && order.status !== "funds_held") {
        throw new Error("Payment can only be submitted while awaiting payment.");
      }
      const allowed =
        (user &&
          (user.role === "admin" ||
            user.id === order.buyerId ||
            user.email.toLowerCase() === order.buyerEmail.toLowerCase())) ||
        (guestEmail && guestEmail === order.buyerEmail.toLowerCase());
      if (!allowed) throw new Error("Forbidden");

      order.buyerMarkedPaid = true;
      if (proof) order.paymentProof = proof;

      addSystemMessage(
        order,
        proof
          ? `Buyer marked payment done and submitted TX / proof: ${proof}. Seller has been notified. Admin please verify on-chain then confirm funds held.`
          : `Buyer clicked “I have made the payment”. Waiting for TX hash / admin confirmation. Seller notified.`,
        "buyer"
      );

      if (data.settings.autoHoldOnProof && proof && order.status === "awaiting_payment") {
        const hours = data.settings.deliveryWindowHours || 24;
        order.deliveryWindowHours = hours;
        order.deliveryDueAt = new Date(
          Date.now() + hours * 60 * 60 * 1000
        ).toISOString();
        setDealStatus(
          order,
          "funds_held",
          `Auto-hold enabled: funds marked held after buyer proof. Seller has ${hours}h to deliver. Admin can still dispute if TX fails.`
        );
        addSystemMessage(
          order,
          `⏰ Delivery SLA: seller has ${hours} hours to deliver / share credentials.`
        );
      }
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 403 }
    );
  }

  const store = await readStore();
  return NextResponse.json({ order: store.orders.find((o) => o.id === Number(id)) });
}
