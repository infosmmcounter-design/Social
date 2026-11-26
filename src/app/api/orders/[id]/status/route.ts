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

function responseOverdue(order: {
  status: DealStatus;
  deliveryDueAt: string | null;
  sellerAcceptedAt?: string | null;
}): boolean {
  if (order.sellerAcceptedAt) return false;
  if (order.status !== "funds_held" && order.status !== "awaiting_payment") return false;
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
  const action = String(body.action || "");
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

      const overdue = responseOverdue(order);

      if (action === "accept") {
        if (!(isSeller || adminAsSeller || isAdmin)) {
          throw new Error("You cannot set this status.");
        }
        if (order.sellerAcceptedAt) throw new Error("The seller already accepted this deal.");
        if (order.status !== "awaiting_payment" && order.status !== "funds_held") {
          throw new Error("This deal can no longer be accepted.");
        }
        order.sellerAcceptedAt = new Date().toISOString();
        addSystemMessage(
          order,
          order.status === "funds_held"
            ? "Seller accepted the deal. The deal has started. Mark it delivered when the work is finished. The buyer is notified then. There is no 24-hour delivery limit."
            : "Seller accepted the deal. It starts when the buyer payment is held in escrow."
        );
        return;
      }

      if (status === "credentials_shared" && !(order.status === "funds_held" && order.sellerAcceptedAt)) {
        throw new Error("The deal starts after payment and the seller accepts. Mark it delivered after that.");
      }

      let allowed = false;
      if (isAdmin && ADMIN_ACTIONS.includes(status)) allowed = true;
      if (
        (isSeller || adminAsSeller) &&
        SELLER_ACTIONS.includes(status) &&
        order.status === "funds_held" &&
        order.sellerAcceptedAt
      ) {
        allowed = true;
      }
      // Buyer may dispute while deal is active
      if (isBuyer && status === "disputed") allowed = true;
      // Buyer tells escrow the service arrived. Escrow still marks the deal complete.
      if (
        isBuyer &&
        status === "release_requested" &&
        order.status === "credentials_shared"
      ) {
        allowed = true;
      }
      if (isAdmin && status === "completed" && order.status !== "release_requested") {
        throw new Error("The buyer must confirm receipt before escrow completes the deal.");
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
        if (!order.deliveryDueAt) {
          order.deliveryDueAt = new Date(Date.now() + hours * 60 * 60_000).toISOString();
        }
      }
      if (status === "release_requested") {
        order.buyerConfirmedAt = new Date().toISOString();
      }

      const labels: Partial<Record<DealStatus, string>> = {
        funds_held: order.sellerAcceptedAt
          ? "Payment confirmed. Funds held in escrow. The seller already accepted, so the deal has started."
          : `Payment confirmed. Funds held in escrow. The seller has ${hours} hours from the order to accept. If there is no response, the buyer can cancel.`,
        credentials_shared:
          "Seller marked this delivered successfully. The buyer is notified and can confirm receipt.",
        release_requested:
          "Buyer confirmed: I have received the service. Escrow, please pay the seller.",
        completed:
          "Escrow marked the deal complete. Payment to the seller is released.",
        disputed: "Dispute opened. Admin escrow moderator will review.",
        cancelled: overdue
          ? "Deal cancelled — the seller did not respond in time. Stock returned."
          : "Deal cancelled.",
        refunded: overdue
          ? "Refund claimed — the seller did not respond in time. Escrow will return funds; stock restored."
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

      if (status === "funds_held" && !order.sellerAcceptedAt) {
        addSystemMessage(
          order,
          `Seller has ${hours} hours to respond and accept. If there is no response, the buyer can cancel this deal.`
        );
      }

      if (status === "credentials_shared") {
        order.deliveredAt = new Date().toISOString();
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
