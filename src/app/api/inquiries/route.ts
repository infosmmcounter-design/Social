import { NextResponse } from "next/server";
import { readStore, updateStore, nextId, publicUser } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import type { ChatMessage, InquiryThread, MessageRole } from "@/lib/types";

function pushMsg(
  thread: InquiryThread,
  text: string,
  from: MessageRole
) {
  const msg: ChatMessage = {
    id: Date.now() + Math.floor(Math.random() * 1000),
    from,
    text,
    createdAt: new Date().toISOString(),
  };
  thread.msgs.push(msg);
  thread.updatedAt = msg.createdAt;
}

function canAccess(
  thread: InquiryThread,
  user: { id: number; role: string; email: string } | null,
  email?: string
) {
  if (user?.role === "admin") return true;
  if (user && user.id === thread.sellerId) return true;
  if (user && user.id === thread.buyerId) return true;
  if (
    user &&
    user.email.toLowerCase() === thread.buyerEmail.toLowerCase()
  )
    return true;
  if (email && email.toLowerCase() === thread.buyerEmail.toLowerCase())
    return true;
  return false;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const email = (searchParams.get("email") || "").toLowerCase();
  const scope = searchParams.get("scope") || "mine";
  const store = await readStore();
  const user = await getCurrentUser();

  if (id) {
    const thread = store.inquiries.find((t) => t.id === Number(id));
    if (!thread)
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    if (!canAccess(thread, user, email))
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const seller = store.users.find((u) => u.id === thread.sellerId);
    const listing = thread.listingId
      ? store.listings.find((l) => l.id === thread.listingId)
      : null;
    return NextResponse.json({
      inquiry: thread,
      seller: seller
        ? publicUser(seller, false, {
            revealDummy: !!(user && user.role === "admin"),
          })
        : null,
      listing: listing
        ? { id: listing.id, title: listing.title, price: listing.price }
        : null,
    });
  }

  let list = store.inquiries;
  if (scope === "admin") {
    const auth = await requireUser(["admin"]);
    if (auth.error)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
  } else if (scope === "seller") {
    const auth = await requireUser(["seller", "admin"]);
    if (auth.error || !auth.user)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (auth.user.role !== "admin") {
      list = list.filter((t) => t.sellerId === auth.user!.id);
    }
  } else if (email) {
    list = list.filter((t) => t.buyerEmail.toLowerCase() === email);
  } else if (user) {
    list = list.filter(
      (t) =>
        t.buyerId === user.id ||
        t.buyerEmail.toLowerCase() === user.email.toLowerCase() ||
        (user.role === "seller" && t.sellerId === user.id) ||
        user.role === "admin"
    );
  } else {
    return NextResponse.json({ inquiries: [] });
  }

  const sellers = Object.fromEntries(
    store.users.map((u) => [u.id, publicUser(u)])
  );
  return NextResponse.json({
    inquiries: [...list]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      .map((t) => ({
        ...t,
        sellerName: sellers[t.sellerId]?.name || "Seller",
        seller: sellers[t.sellerId] || null,
        lastMsg: t.msgs[t.msgs.length - 1] || null,
      })),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const sellerId = Number(body.sellerId);
  const listingId = body.listingId != null ? Number(body.listingId) : null;
  const buyerEmail = String(body.email || "")
    .trim()
    .toLowerCase();
  const buyerName = String(body.name || "Guest").trim();
  const firstMessage = String(body.message || body.text || "").trim();
  const subject = String(body.subject || "").trim();

  if (!sellerId || !buyerEmail) {
    return NextResponse.json(
      { error: "Seller and your email are required to start chat." },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();
  let inquiryId = 0;

  try {
    await updateStore((data) => {
      const seller = data.users.find(
        (u) =>
          u.id === sellerId &&
          u.active &&
          (u.role === "seller" || u.official)
      );
      if (!seller) throw new Error("Seller not found.");

      let listingTitle = "";
      if (listingId) {
        const listing = data.listings.find(
          (l) =>
            l.id === listingId &&
            l.sellerId === sellerId &&
            l.status === "approved"
        );
        if (!listing) throw new Error("Listing not found for this seller.");
        listingTitle = listing.title;
      }

      const existing = data.inquiries.find(
        (t) =>
          t.status === "open" &&
          t.sellerId === sellerId &&
          (listingId == null || t.listingId === listingId) &&
          (t.buyerEmail.toLowerCase() === buyerEmail ||
            (!!user && t.buyerId === user.id))
      );
      if (existing) {
        inquiryId = existing.id;
        if (firstMessage) pushMsg(existing, firstMessage, "buyer");
        return;
      }

      inquiryId = nextId(data);
      const thread: InquiryThread = {
        id: inquiryId,
        sellerId,
        listingId,
        buyerId: user?.id ?? null,
        buyerEmail,
        buyerName: buyerName || user?.name || "Guest",
        subject:
          subject ||
          (listingTitle
            ? `Question about: ${listingTitle}`
            : `Chat with ${seller.name}`),
        status: "open",
        msgs: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      pushMsg(
        thread,
        `Chat opened with ${seller.name}. Buyer, ${seller.name}, and Escrow can reply here — no deal required yet.`,
        "admin"
      );
      if (firstMessage) pushMsg(thread, firstMessage, "buyer");
      data.inquiries.push(thread);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not start chat" },
      { status: 400 }
    );
  }

  const store = await readStore();
  const inquiry = store.inquiries.find((t) => t.id === inquiryId)!;
  const seller = store.users.find((u) => u.id === inquiry.sellerId);
  return NextResponse.json({
    inquiry,
    seller: seller ? publicUser(seller) : null,
  });
}
