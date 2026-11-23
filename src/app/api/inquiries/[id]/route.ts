import { NextResponse } from "next/server";
import { updateStore } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/** Hide a chat from the caller's list, or block the other person. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "");
  const guestEmail = String(body.email || "")
    .trim()
    .toLowerCase();
  const user = await getCurrentUser();

  if (action !== "delete" && action !== "block") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }
  if (!user && !guestEmail) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  try {
    await updateStore((data) => {
      const thread = data.inquiries.find((t) => t.id === Number(id));
      if (!thread) throw new Error("Chat not found");
      const isAdmin = user?.role === "admin";
      const isBuyer =
        (!!user &&
          (user.id === thread.buyerId ||
            user.email.toLowerCase() === thread.buyerEmail.toLowerCase())) ||
        (!!guestEmail && guestEmail === thread.buyerEmail.toLowerCase());
      const isSeller =
        !!user &&
        (thread.kind || "seller") === "seller" &&
        user.id === thread.sellerId;
      if (!isAdmin && !isBuyer && !isSeller) throw new Error("Forbidden");

      if (action === "delete") {
        if (user) {
          thread.hiddenFor = thread.hiddenFor || [];
          if (!thread.hiddenFor.includes(user.id)) thread.hiddenFor.push(user.id);
        }
        const email = (user?.email || guestEmail || "").toLowerCase();
        if (email && email === thread.buyerEmail.toLowerCase()) {
          thread.hiddenEmails = thread.hiddenEmails || [];
          if (!thread.hiddenEmails.includes(email)) thread.hiddenEmails.push(email);
        }
        return;
      }

      if (!user) throw new Error("Log in to block someone.");
      const me = data.users.find((u) => u.id === user.id);
      if (!me) throw new Error("Account not found");
      me.blockedUserIds = me.blockedUserIds || [];
      me.blockedEmails = me.blockedEmails || [];
      if (isBuyer && thread.sellerId) {
        if (!me.blockedUserIds.includes(thread.sellerId)) {
          me.blockedUserIds.push(thread.sellerId);
        }
      } else if (isSeller) {
        if (thread.buyerId && !me.blockedUserIds.includes(thread.buyerId)) {
          me.blockedUserIds.push(thread.buyerId);
        } else if (thread.buyerEmail) {
          const email = thread.buyerEmail.toLowerCase();
          if (!me.blockedEmails.includes(email)) me.blockedEmails.push(email);
        }
      }
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true });
}
