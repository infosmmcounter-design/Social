import { NextResponse } from "next/server";
import { updateStore } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { seenKey } from "@/lib/chat-inbox";

/** Remember that this person opened a seller chat or a deal room. */
export async function POST(req: Request) {
  const body = await req.json();
  const source = body.source === "deal" ? "deal" : "inquiry";
  const id = Number(body.id);
  const email = String(body.email || "").trim().toLowerCase();
  const user = await getCurrentUser();
  const key = seenKey(user, email);
  if (!key || !id) return NextResponse.json({ ok: true });

  await updateStore((data) => {
    const now = new Date().toISOString();
    if (source === "deal") {
      const order = data.orders.find((o) => o.id === id);
      if (!order) return;
      const allowed =
        user?.role === "admin" ||
        user?.id === order.buyerId ||
        user?.id === order.sellerId ||
        (user && user.email.toLowerCase() === order.buyerEmail.toLowerCase()) ||
        email === order.buyerEmail.toLowerCase();
      if (!allowed) return;
      if (!order.seen) order.seen = {};
      order.seen[key] = now;
      return;
    }
    const thread = data.inquiries.find((t) => t.id === id);
    if (!thread) return;
    const kind = thread.kind || "seller";
    const allowed =
      user?.role === "admin" ||
      user?.id === thread.buyerId ||
      (user && user.email.toLowerCase() === thread.buyerEmail.toLowerCase()) ||
      email === thread.buyerEmail.toLowerCase() ||
      (user && kind === "seller" && user.id === thread.sellerId);
    if (!allowed) return;
    if (!thread.seen) thread.seen = {};
    thread.seen[key] = now;
  });

  return NextResponse.json({ ok: true });
}
