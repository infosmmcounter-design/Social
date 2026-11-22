import { NextResponse } from "next/server";
import { updateStore, readStore, addSystemMessage } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { MessageRole } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const text = String(body.text || "").trim();
  const asRole = body.asRole as MessageRole | undefined;

  if (!text) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const user = await getCurrentUser();
  const guestEmail = String(body.email || "")
    .trim()
    .toLowerCase();

  try {
    await updateStore((data) => {
      const order = data.orders.find((o) => o.id === Number(id));
      if (!order) throw new Error("Order not found");

      let from: MessageRole | null = null;

      if (user?.role === "admin") {
        from = asRole === "seller" ? "seller" : "admin";
        // Admin may reply as dummy seller
        if (asRole === "seller") {
          const seller = data.users.find((u) => u.id === order.sellerId);
          if (!seller?.dummy && order.sellerId !== user.id) {
            // still allow admin to speak as seller for support on any deal
            from = "seller";
          }
        }
      } else if (
        user &&
        (user.id === order.buyerId ||
          user.email.toLowerCase() === order.buyerEmail.toLowerCase())
      ) {
        from = "buyer";
      } else if (user && user.id === order.sellerId) {
        from = "seller";
      } else if (guestEmail && guestEmail === order.buyerEmail.toLowerCase()) {
        from = "buyer";
      }

      if (!from) throw new Error("Forbidden");

      addSystemMessage(order, text, from);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Send failed" },
      { status: 403 }
    );
  }

  const store = await readStore();
  return NextResponse.json({ order: store.orders.find((o) => o.id === Number(id)) });
}
