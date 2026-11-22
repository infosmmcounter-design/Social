import { NextResponse } from "next/server";
import {
  updateStore,
  readStore,
  setDealStatus,
  addSystemMessage,
  restoreOrderStock,
} from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import type { DealStatus } from "@/lib/types";
import { DEAL_STATUS_LABEL } from "@/lib/types";

const SELLER_ACTIONS: DealStatus[] = ["credentials_shared"];
const ADMIN_ACTIONS: DealStatus[] = [
  "funds_held",
  "credentials_shared",
  "completed",
  "disputed",
  "cancelled",
  "refunded",
];

function deliveryOverdue(order: {
  status: DealStatus;
  deliveryDueAt: string | null;
  deliveredAt: string | null;
}): boolean {
  if (order.deliveredAt) return false;
  if (order.status !== "funds_held") return false;
  if (!order.deliveryDueAt) return false;
  return Date.now() > new Date(order.deliveryDueAt).getTime();
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const status = body.status as DealStatus;
  const note = String(body.note || "").trim();
  const guestEmail = String(body.email || "")
    .trim()
    .toLowerCase();

  const user = await getCurrentUser();

  try {
    await updateStore((data) => {
      const order = data.orders.find((o) => o.id === Number(id));
      if (!order) throw new Error("Order not found");

      const isAdmin = user?.role === "admin";
      const isBuyer =
        (!!user &&
          (order.buyerId === user.id ||
            order.buyerEmail.toLowerCase() === user.email.toLowerCase())) ||
        (!!guestEmail && guestEmail === order.buyerEmail.toLowerCase());
      const isSeller = !!user && order.sellerId === user.id;
      const seller = data.users.find((u) => u.id === order.sellerId);
      const adminAsSeller = !!isAdmin && !!seller?.dummy;

      const overdue = deliveryOverdue(order);

      let allowed = false;
      if (isAdmin && ADMIN_ACTIONS.includes(status)) allowed = true;
      if ((isSeller || adminAsSeller) && SELLER_ACTIONS.includes(status))
        allowed = true;
      // Buyer may dispute while deal is active
      if (isBuyer && status === "disputed") allowed = true;
      // Buyer confirms receipt only after credentials / delivery shared
      if (
        isBuyer &&
        status === "completed" &&
        order.status === "credentials_shared"
      ) {
        allowed = true;
      }
      if (
        isBuyer &&
        overdue &&
        (status === "refunded" || status === "cancelled")
      ) {
        allowed = true;
      }
      if (
        isBuyer &&
        status === "cancelled" &&
        order.status === "awaiting_payment"
      ) {
        allowed = true;
      }

      if (!allowed) throw new Error("You cannot set this status.");

      const hours =
        order.deliveryWindowHours ||
        data.settings.deliveryWindowHours ||
        24;

      if (status === "funds_held" && order.status === "awaiting_payment") {
        order.deliveryWindowHours = hours;
        order.deliveryDueAt = new Date(
          Date.now() + hours * 60 * 60_000
        ).toISOString();
      }

      const labels: Partial<Record<DealStatus, string>> = {
        funds_held: `Payment confirmed. Funds held in escrow. Seller must deliver within ${hours} hours.`,
        credentials_shared:
          "Seller shared account credentials. Private handle is now visible in this deal room.",
        completed:
          "Buyer confirmed delivery. Funds released to seller. Deal completed.",
        disputed: "Dispute opened. Admin escrow moderator will review.",
        cancelled: overdue
          ? "Deal cancelled — seller missed the delivery window. Stock returned."
          : "Deal cancelled.",
        refunded: overdue
          ? "Refund claimed — seller did not deliver in time. Escrow will return funds; stock restored."
          : "Buyer refunded. Escrow closed.",
      };

      const previous = order.status;
      setDealStatus(
        order,
        status,
        note ||
          labels[status] ||
          `Status updated to ${DEAL_STATUS_LABEL[status]}.`
      );

      if (status === "completed" && previous !== "completed") {
        const sellerUser = data.users.find((u) => u.id === order.sellerId);
        if (sellerUser) {
          sellerUser.completedDeals = (sellerUser.completedDeals || 0) + 1;
        }
      }

      if (status === "funds_held") {
        addSystemMessage(
          order,
          `⏰ Delivery SLA: seller has ${hours} hours to deliver / share credentials. Buyer sees a countdown. After the deadline, buyer can cancel or claim a refund.`
        );
      }

      if (status === "credentials_shared") {
        order.deliveredAt = new Date().toISOString();
        order.deliveryDueAt = null;
        const listing = data.listings.find((l) => l.id === order.listingId);
        if (listing) {
          order.handleRevealed = true;
          if (listing.privateHandle?.trim()) {
            addSystemMessage(
              order,
              `Private account handle/URL revealed: ${listing.privateHandle}`
            );
          } else {
            addSystemMessage(
              order,
              "Credentials stage opened. Seller can share the private handle/URL in this chat."
            );
          }
        }
      }

      if (status === "cancelled" || status === "refunded") {
        restoreOrderStock(
          data,
          order,
          "Stock unit returned to listing (deal ended before delivery)."
        );
      }
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 }
    );
  }

  const store = await readStore();
  return NextResponse.json({
    order: store.orders.find((o) => o.id === Number(id)),
  });
}
