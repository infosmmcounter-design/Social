import { NextResponse } from "next/server";
import { updateStore, readStore, publicUser } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { ChatMessage, MessageRole } from "@/lib/types";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const text = String(body.text || "").trim();
  const asRole = body.asRole as MessageRole | undefined;
  const guestEmail = String(body.email || "")
    .trim()
    .toLowerCase();

  if (!text)
    return NextResponse.json({ error: "Message required" }, { status: 400 });

  const user = await getCurrentUser();

  try {
    await updateStore((data) => {
      const thread = data.inquiries.find((t) => t.id === Number(id));
      if (!thread) throw new Error("Chat not found");
      if (thread.status === "closed") throw new Error("This chat is closed");

      let from: MessageRole | null = null;

      if (user?.role === "admin") {
        // Admin can reply as Escrow or as the named seller (esp. dummy sellers).
        from = asRole === "seller" ? "seller" : "admin";
      } else if (
        user &&
        (user.id === thread.buyerId ||
          user.email.toLowerCase() === thread.buyerEmail.toLowerCase())
      ) {
        from = "buyer";
      } else if (user && user.id === thread.sellerId) {
        from = "seller";
      } else if (
        guestEmail &&
        guestEmail === thread.buyerEmail.toLowerCase()
      ) {
        from = "buyer";
      }

      if (!from) throw new Error("Forbidden");

      const msg: ChatMessage = {
        id: Date.now() + Math.floor(Math.random() * 1000),
        from,
        text,
        createdAt: new Date().toISOString(),
      };
      thread.msgs.push(msg);
      thread.updatedAt = msg.createdAt;
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Send failed" },
      { status: 403 }
    );
  }

  const store = await readStore();
  const inquiry = store.inquiries.find((t) => t.id === Number(id))!;
  const seller = store.users.find((u) => u.id === inquiry.sellerId);
  return NextResponse.json({
    inquiry,
    seller: seller
      ? publicUser(seller, false, {
          revealDummy: !!(user && user.role === "admin"),
        })
      : null,
  });
}
