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
      const isEscrow = (thread.kind || "seller") === "escrow";

      if (user?.role === "admin") {
        // Escrow-only rooms: admin always replies as Escrow.
        // Seller rooms: admin may also reply as the named seller (dummy).
        from =
          isEscrow || asRole !== "seller" ? "admin" : "seller";
      } else if (
        user &&
        (user.id === thread.buyerId ||
          user.email.toLowerCase() === thread.buyerEmail.toLowerCase())
      ) {
        from = "buyer";
      } else if (
        !isEscrow &&
        user &&
        thread.sellerId > 0 &&
        user.id === thread.sellerId
      ) {
        from = "seller";
      } else if (
        guestEmail &&
        guestEmail === thread.buyerEmail.toLowerCase()
      ) {
        from = "buyer";
      }

      if (!from) throw new Error("Forbidden");

      const otherId =
        from === "buyer" ? thread.sellerId : thread.buyerId || 0;
      const other = otherId
        ? data.users.find((u) => u.id === otherId)
        : data.users.find(
            (u) => u.email.toLowerCase() === thread.buyerEmail.toLowerCase()
          );
      const me = user ? data.users.find((u) => u.id === user.id) : null;
      const blocked =
        (me &&
          ((other && (me.blockedUserIds || []).includes(other.id)) ||
            (me.blockedEmails || []).includes(thread.buyerEmail.toLowerCase()) ||
            (other?.blockedUserIds || []).includes(me.id) ||
            (other?.blockedEmails || []).includes(
              (user?.email || guestEmail || "").toLowerCase()
            ))) ||
        false;
      if (blocked && user?.role !== "admin") {
        throw new Error("This chat is blocked.");
      }

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
  const seller =
    (inquiry.kind || "seller") === "escrow" || inquiry.sellerId <= 0
      ? null
      : store.users.find((u) => u.id === inquiry.sellerId);
  return NextResponse.json({
    inquiry: { ...inquiry, kind: inquiry.kind || "seller" },
    seller: seller
      ? publicUser(seller, false, {
          revealDummy: !!(user && user.role === "admin"),
        })
      : null,
  });
}
