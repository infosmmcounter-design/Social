import { NextResponse } from "next/server";
import {
  readStore,
  updateStore,
  nextId,
  calcTotals,
  addSystemMessage,
  publicUser,
  matchWalletAsset,
} from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get("email") || "").toLowerCase();
  const id = searchParams.get("id");
  const scope = searchParams.get("scope") || "mine";

  const store = await readStore();
  const user = await getCurrentUser();

  if (id) {
    const order = store.orders.find((o) => o.id === Number(id));
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    const canView =
      (user &&
        (user.role === "admin" ||
          user.id === order.buyerId ||
          user.id === order.sellerId ||
          order.buyerEmail.toLowerCase() === user.email.toLowerCase())) ||
      (email && order.buyerEmail.toLowerCase() === email);
    if (!canView)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const listing = store.listings.find((l) => l.id === order.listingId);
    const seller = store.users.find((u) => u.id === order.sellerId);
    const revealDummy = !!(user && user.role === "admin");
    return NextResponse.json({
      order: {
        ...order,
        privateHandle:
          order.handleRevealed && listing ? listing.privateHandle : null,
      },
      seller: seller ? publicUser(seller, true, { revealDummy }) : null,
      listing,
      wallets: store.settings.cryptoWallets.filter((w) => w.enabled && w.address),
      settings: {
        paymentWindowMins: store.settings.paymentWindowMins,
        autoHoldOnProof: store.settings.autoHoldOnProof,
      },
    });
  }

  let orders = store.orders;
  if (scope === "admin") {
    const auth = await requireUser(["admin"]);
    if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  } else if (scope === "seller") {
    const auth = await requireUser(["seller", "admin"]);
    if (auth.error || !auth.user)
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    if (auth.user.role !== "admin") {
      orders = orders.filter((o) => o.sellerId === auth.user!.id);
    }
  } else if (email) {
    orders = orders.filter((o) => o.buyerEmail.toLowerCase() === email);
  } else if (user) {
    orders = orders.filter(
      (o) =>
        o.buyerId === user.id ||
        o.buyerEmail.toLowerCase() === user.email.toLowerCase() ||
        (user.role === "seller" && o.sellerId === user.id) ||
        user.role === "admin"
    );
  } else {
    return NextResponse.json({ orders: [] });
  }

  return NextResponse.json({
    orders: [...orders].sort((a, b) => b.id - a.id),
  });
}

export async function POST(req: Request) {
  const body = await req.json();
  const listingId = Number(body.listingId);
  const offerToken = String(body.offerToken || "").trim();
  const buyerEmail = String(body.email || "")
    .trim()
    .toLowerCase();
  const buyerName = String(body.name || "Guest Buyer").trim();
  const det = String(body.det || "").trim();
  const coin = String(body.coin || "USDT (TRC20)");

  if ((!listingId && !offerToken) || !buyerEmail || !det) {
    return NextResponse.json(
      { error: "Email, transfer details and listing/deal link are required." },
      { status: 400 }
    );
  }

  if (!/USDT\s*\((TRC20|BEP20)\)/i.test(coin)) {
    return NextResponse.json(
      { error: "Only USDT TRC20 or USDT BEP20 is accepted." },
      { status: 400 }
    );
  }

  const user = await getCurrentUser();
  let orderId = 0;

  try {
    await updateStore((data) => {
      const offer =
        offerToken
          ? data.offers.find((o) => o.token === offerToken)
          : undefined;
      const lid = listingId || offer?.listingId;
      const listing = data.listings.find(
        (l) =>
          l.id === lid &&
          l.status === "approved" &&
          (l.listed || !!offer)
      );
      if (!listing) throw new Error("Listing / deal not available.");
      if ((listing.stock ?? 1) <= 0) throw new Error("This deal is sold out.");
      if (offer && offer.status !== "open")
        throw new Error("This deal link was already used or closed.");
      const seller = data.users.find((u) => u.id === listing.sellerId);
      if (!seller) throw new Error("Deal creator / seller not found.");

      const totals = calcTotals(listing.price, seller, data.fee);
      const asset = matchWalletAsset(coin);
      const wallet = data.settings.cryptoWallets.find(
        (w) => w.enabled && w.asset === asset
      );

      const windowMins = data.settings.paymentWindowMins || 60;
      const holdDays = data.settings.escrowHoldDays || 7;
      const now = Date.now();
      const paymentDueAt = new Date(now + windowMins * 60_000).toISOString();

      const paymentInstructions = wallet?.address
        ? `Send exactly ${totals.total.toFixed(2)} USDT via ${coin} to SocialsFlip ESCROW wallet (${wallet.network}): ${wallet.address}. Do NOT pay the seller directly. Wrong network = lost funds. Pay within ${windowMins} minutes.`
        : `Pay ${totals.total.toFixed(2)} USDT via ${coin} to SocialsFlip escrow within ${windowMins} minutes. Wallet address appears once admin configures it.`;

      orderId = nextId(data);
      const order = {
        id: orderId,
        listingId: listing.id,
        offerId: offer?.id ?? null,
        sellerId: listing.sellerId,
        buyerId: user?.id ?? null,
        buyerEmail,
        buyerName: buyerName || user?.name || "Guest Buyer",
        title: listing.title,
        det,
        coin,
        paymentMode: "escrow_crypto" as const,
        selectedPayMethodId: null,
        paymentInstructions,
        paymentProof: "",
        buyerMarkedPaid: false,
        paymentDueAt,
        paymentWindowMins: windowMins,
        deliveryDueAt: null,
        deliveryWindowHours: data.settings.deliveryWindowHours || 24,
        stockReserved: true,
        deliveredAt: null,
        price: totals.price,
        fee: totals.fee,
        total: totals.total,
        status: "awaiting_payment" as const,
        handleRevealed: false,
        privateRequestStatus: "none" as const,
        msgs: [],
        createdAt: new Date().toISOString(),
      };

      listing.stock = Math.max(0, (listing.stock ?? 1) - 1);
      if (offer) {
        offer.stock = Math.max(0, (offer.stock ?? 1) - 1);
        offer.orderId = orderId;
        // Keep link open while stock remains; close after last unit
        offer.status = offer.stock <= 0 || listing.stock <= 0 ? "ordered" : "open";
      }

      addSystemMessage(
        order,
        `Escrow deal #${orderId} opened${offer ? " from a created-deal link" : ""}. Parties: Buyer + Deal creator (${seller.name}) + Admin/Escrow. Pay ONLY SocialsFlip escrow — creator is paid by us after delivery, never directly by buyer.`
      );
      addSystemMessage(
        order,
        `💰 Escrow hold: funds stay held until the deal is completed (typically up to ${holdDays} days, or until you confirm delivery). Seller/creator cannot take payment outside escrow.`
      );
      addSystemMessage(order, paymentInstructions);
      addSystemMessage(
        order,
        `Stock reserved. Available stock now: ${listing.stock}. After funds are held, creator has ${data.settings.deliveryWindowHours || 24}h to deliver.`
      );

      data.orders.push(order);
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not create order" },
      { status: 400 }
    );
  }

  const store = await readStore();
  return NextResponse.json({ order: store.orders.find((o) => o.id === orderId) });
}
