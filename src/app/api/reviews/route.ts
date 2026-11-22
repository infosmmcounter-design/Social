import { NextResponse } from "next/server";
import { updateStore, nextId, readStore } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { isLocale, DEFAULT_LOCALE } from "@/lib/i18n/locales";

export async function GET() {
  const store = await readStore();
  return NextResponse.json({ reviews: store.reviews });
}

export async function POST(req: Request) {
  const body = await req.json();
  const orderId = Number(body.orderId);
  const stars = Number(body.stars);
  const text = String(body.text || "").trim();
  const about = body.about === "buyer" ? "buyer" : "seller";
  const rawLocale = String(body.locale || "").toLowerCase();
  const locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;
  const user = await getCurrentUser();

  if (!orderId || !stars || !text)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    await updateStore((data) => {
      const order = data.orders.find((o) => o.id === orderId);
      if (!order || order.status !== "completed")
        throw new Error("Only completed deals can be reviewed");

      if (about === "seller") {
        const guestEmail = String(body.email || "")
          .trim()
          .toLowerCase();
        const actorEmail = (
          user?.email ||
          guestEmail ||
          ""
        ).toLowerCase();
        if (!actorEmail) throw new Error("Login or checkout email required");
        if (
          order.buyerEmail.toLowerCase() !== actorEmail &&
          user?.role !== "admin"
        )
          throw new Error("Only the buyer can review the seller");
        const email = actorEmail;
        if (
          data.reviews.some(
            (r) => r.orderId === orderId && (r.about || "seller") === "seller"
          )
        )
          throw new Error("Seller already reviewed for this deal");
        // Public review stays in the buyer's selected language (not auto-translated)
        data.reviews.push({
          id: nextId(data),
          orderId,
          listingId: order.listingId,
          sellerId: order.sellerId,
          about: "seller",
          buyerId: order.buyerId,
          stars,
          text,
          who: email.slice(0, 2) + "***",
          date: new Date().toISOString().slice(0, 10),
          locale,
        });
        const seller = data.users.find((u) => u.id === order.sellerId);
        if (seller) {
          const revs = data.reviews.filter(
            (r) => r.sellerId === seller.id && (r.about || "seller") === "seller"
          );
          seller.reviewCount = revs.length;
          seller.rating = revs.reduce((a, r) => a + r.stars, 0) / revs.length;
        }
      } else {
        // Seller (or admin acting for dummy seller) reviews the buyer
        if (!user) throw new Error("Login required to review the buyer");
        const canSellerReview =
          user.id === order.sellerId || user.role === "admin";
        if (!canSellerReview)
          throw new Error("Only the seller can review the buyer");
        if (
          data.reviews.some(
            (r) => r.orderId === orderId && r.about === "buyer"
          )
        )
          throw new Error("Buyer already reviewed for this deal");
        data.reviews.push({
          id: nextId(data),
          orderId,
          listingId: order.listingId,
          sellerId: order.sellerId,
          about: "buyer",
          buyerId: order.buyerId,
          stars,
          text,
          who: user.name || "Seller",
          date: new Date().toISOString().slice(0, 10),
          locale,
        });
        if (order.buyerId) {
          const buyer = data.users.find((u) => u.id === order.buyerId);
          if (buyer) {
            const revs = data.reviews.filter(
              (r) => r.about === "buyer" && r.buyerId === buyer.id
            );
            buyer.reviewCount = revs.length;
            buyer.rating =
              revs.reduce((a, r) => a + r.stars, 0) / Math.max(1, revs.length);
          }
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

export async function DELETE(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json();
  await updateStore((data) => {
    const id = Number(body.id);
    const removed = data.reviews.find((r) => r.id === id);
    data.reviews = data.reviews.filter((r) => r.id !== id);
    if (removed) {
      if ((removed.about || "seller") === "seller") {
        const seller = data.users.find((u) => u.id === removed.sellerId);
        if (seller) {
          const revs = data.reviews.filter(
            (r) =>
              r.sellerId === seller.id && (r.about || "seller") === "seller"
          );
          seller.reviewCount = revs.length;
          seller.rating = revs.length
            ? revs.reduce((a, r) => a + r.stars, 0) / revs.length
            : 0;
        }
      } else if (removed.buyerId) {
        const buyer = data.users.find((u) => u.id === removed.buyerId);
        if (buyer) {
          const revs = data.reviews.filter(
            (r) => r.about === "buyer" && r.buyerId === buyer.id
          );
          buyer.reviewCount = revs.length;
          buyer.rating = revs.length
            ? revs.reduce((a, r) => a + r.stars, 0) / revs.length
            : 0;
        }
      }
    }
  });
  return NextResponse.json({ ok: true });
}
