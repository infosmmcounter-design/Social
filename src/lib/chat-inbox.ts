import type { InquiryThread, Order, StoreData } from "./types";

export type InboxSource = "inquiry" | "deal";

export type InboxRow = {
  source: InboxSource;
  id: number;
  kind: "seller" | "escrow" | "deal";
  title: string;
  subject: string;
  preview: string;
  updatedAt: string;
  unread: number;
  sellerName: string;
  buyerName: string;
  buyerEmail: string;
};

type Viewer = { id: number; role: string; email: string } | null;

export function seenKey(user: Viewer, email?: string) {
  if (user) return `u:${user.id}`;
  const mail = (email || "").trim().toLowerCase();
  return mail ? `e:${mail}` : "";
}

function viewerSide(
  user: Viewer,
  email: string,
  buyerId: number | null,
  buyerEmail: string,
  sellerId: number
): "buyer" | "seller" | "admin" | "" {
  if (user?.role === "admin") return "admin";
  if (user && user.id === sellerId) return "seller";
  if (
    (user && (user.id === buyerId || user.email.toLowerCase() === buyerEmail.toLowerCase())) ||
    (email && email === buyerEmail.toLowerCase())
  ) {
    return "buyer";
  }
  return "";
}

function unreadCount(
  msgs: { from: string; createdAt: string }[],
  seen: Record<string, string> | undefined,
  key: string,
  side: "buyer" | "seller" | "admin" | ""
) {
  if (!key || !side) return 0;
  const since = seen?.[key] ? new Date(seen[key]).getTime() : 0;
  return msgs.filter((m) => {
    if (new Date(m.createdAt).getTime() <= since) return false;
    if (side === "admin") return m.from !== "admin";
    return m.from !== side;
  }).length;
}

function hidden(thread: InquiryThread, user: Viewer, email: string) {
  if (user?.role === "admin") return false;
  if (user && (thread.hiddenFor || []).includes(user.id)) return true;
  if (email && (thread.hiddenEmails || []).includes(email)) return true;
  return false;
}

function canSeeInquiry(thread: InquiryThread, user: Viewer, email: string) {
  if (hidden(thread, user, email)) return false;
  if (user?.role === "admin") return true;
  const kind = thread.kind || "seller";
  if (user && user.id === thread.buyerId) return true;
  if (user && user.email.toLowerCase() === thread.buyerEmail.toLowerCase()) return true;
  if (email && thread.buyerEmail.toLowerCase() === email) return true;
  if (user && kind === "seller" && user.id === thread.sellerId) return true;
  return false;
}

function canSeeOrder(order: Order, user: Viewer, email: string) {
  if (user?.role === "admin") return true;
  if (user && (user.id === order.buyerId || user.email.toLowerCase() === order.buyerEmail.toLowerCase()))
    return true;
  if (email && order.buyerEmail.toLowerCase() === email) return true;
  if (user && user.id === order.sellerId) return true;
  return false;
}

export function buildInbox(store: StoreData, user: Viewer, email = ""): InboxRow[] {
  const mail = email.trim().toLowerCase();
  const key = seenKey(user, mail);
  const names = new Map(store.users.map((u) => [u.id, u.name]));
  const rows: InboxRow[] = [];

  for (const thread of store.inquiries || []) {
    if (!canSeeInquiry(thread, user, mail)) continue;
    const kind = thread.kind || "seller";
    const sellerName =
      kind === "escrow" ? "SocialsFlip Escrow" : names.get(thread.sellerId) || "Seller";
    const side = viewerSide(user, mail, thread.buyerId, thread.buyerEmail, thread.sellerId);
    const last = thread.msgs[thread.msgs.length - 1];
    rows.push({
      source: "inquiry",
      id: thread.id,
      kind: kind === "escrow" ? "escrow" : "seller",
      title: side === "seller" ? thread.buyerName || "Buyer" : sellerName,
      subject: thread.subject,
      preview: last?.text || thread.subject,
      updatedAt: last?.createdAt || thread.updatedAt || thread.createdAt,
      unread: unreadCount(thread.msgs, thread.seen, key, side),
      sellerName,
      buyerName: thread.buyerName,
      buyerEmail: thread.buyerEmail,
    });
  }

  for (const order of store.orders || []) {
    if (!canSeeOrder(order, user, mail)) continue;
    const sellerName = names.get(order.sellerId) || "Seller";
    const side = viewerSide(user, mail, order.buyerId, order.buyerEmail, order.sellerId);
    const last = order.msgs[order.msgs.length - 1];
    rows.push({
      source: "deal",
      id: order.id,
      kind: "deal",
      title: side === "seller" ? order.buyerName || "Buyer" : sellerName,
      subject: `Deal #${order.id} · ${order.title}`,
      preview: last?.text || order.title,
      updatedAt: last?.createdAt || order.createdAt,
      unread: unreadCount(order.msgs, order.seen, key, side),
      sellerName,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
    });
  }

  const escrow = rows
    .filter((r) => r.kind === "escrow" && r.id > 0)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const rest = rows
    .filter((r) => r.kind !== "escrow")
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return [...rest, ...escrow];
}
