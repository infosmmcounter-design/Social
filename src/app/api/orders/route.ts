import { NextResponse } from "next/server";
import {
  readStore,
  updateStore,
  nextId,
  calcTotals,
  addSystemMessage,
  publicUser,
  matchWalletAsset,
  isFreelanceListing,
} from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { attachCryptoPayment } from "@/lib/crypto/apply";

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
  const qty = Math.max(1, Math.floor(Number(body.qty) || 1));
  const payWith = String(body.payWith || "");
  const coin =
    payWith === "wallet" ? "Wallet balance" : String(body.coin || "USDT (TRC20)");

  if ((!listingId && !offerToken) || !buyerEmail) {
    return NextResponse.json(
      { error: "Email and a listing or deal link are required." },
      { status: 400 }
    );
  }

  if (payWith !== "wallet" && !/USDT\s*\((TRC20|BEP20)\)/i.test(coin)) {
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
      const freelance = isFreelanceListing(listing);
      const available = freelance
        ? Number.POSITIVE_INFINITY
        : Math.max(
            0,
            Math.min(
              listing.stock ?? 1,
              offer ? offer.stock ?? listing.stock ?? 1 : listing.stock ?? 1
            )
          );
      if (!freelance && available <= 0)
        throw new Error("This deal is sold out.");
      if (!freelance && qty > available) {
        throw new Error(
          `You are selecting more than the available stock (${available}).`
        );
      }
      if (offer && offer.status !== "open")
        throw new Error("This deal link was already used or closed.");
      const seller = data.users.find((u) => u.id === listing.sellerId);
      if (!seller) throw new Error("Deal creator / seller not found.");
      if (!det) {
        throw new Error(
          freelance
            ? "Add the details the seller needs for this service."
            : "Add the email or info needed to transfer the account."
        );
      }

      const linePrice =
        Math.round(listing.price * qty * 100) / 100;
      const totals = calcTotals(linePrice, seller, data.fee);
      const useWallet = payWith === "wallet";
      if (useWallet) {
        if (!user) throw new Error("Log in to pay with wallet balance.");
        const bal = Number(user && data.users.find((u) => u.id === user.id)?.walletBalance || 0);
        if (bal < totals.total) {
          throw new Error("Not enough wallet balance. Deposit USDT first.");
        }
      }
      const asset = matchWalletAsset(coin);
      const wallet = data.settings.cryptoWallets.find(
        (w) => w.enabled && w.asset === asset
      );

      const windowMins = data.settings.paymentWindowMins || 60;
      const holdDays = data.settings.escrowHoldDays || 7;
      const now = Date.now();
      const paymentDueAt = new Date(now + windowMins * 60_000).toISOString();

      const paymentInstructions = useWallet
        ? `Paid ${totals.total.toFixed(2)} USDT from the buyer wallet. Funds are held in escrow.`
        : wallet?.address
        ? `Send the exact USDT amount shown at checkout via ${coin} to SocialsFlip ESCROW wallet (${wallet.network}): ${wallet.address}. Do NOT pay the seller directly. Wrong network = lost funds. Pay within ${windowMins} minutes.`
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
        qty,
        det,
        coin,
        paymentMode: "escrow_crypto" as const,
        selectedPayMethodId: null,
        paymentInstructions,
        paymentProof: "",
        buyerMarkedPaid: false,
        paymentDueAt,
        paymentWindowMins: windowMins,
        deliveryDueAt: new Date(
          now + (data.settings.deliveryWindowHours || 24) * 60 * 60_000
        ).toISOString(),
        deliveryWindowHours: data.settings.deliveryWindowHours || 24,
        sellerAcceptedAt: null,
        buyerConfirmedAt: null,
        stockReserved: !freelance,
        deliveredAt: null,
        price: totals.price,
        fee: totals.fee,
        total: totals.total,
        status: (useWallet ? "funds_held" : "awaiting_payment") as
          | "awaiting_payment"
          | "funds_held",
        handleRevealed: false,
        privateRequestStatus: "none" as const,
        msgs: [],
        createdAt: new Date().toISOString(),
      };
      if (!useWallet) attachCryptoPayment(data, order);

      if (useWallet && user) {
        const payer = data.users.find((u) => u.id === user.id);
        if (!payer) throw new Error("Log in to pay with wallet balance.");
        payer.walletBalance =
          Math.round((Number(payer.walletBalance || 0) - totals.total) * 100) / 100;
        order.buyerMarkedPaid = true;
        order.paymentProof = "Paid from wallet balance";
      }

      listing.soldCount = (listing.soldCount ?? 0) + qty;
      if (!freelance) {
        listing.stock = Math.max(0, (listing.stock ?? 1) - qty);
      }
      if (offer) {
        if (!freelance) {
          offer.stock = Math.max(0, (offer.stock ?? 1) - qty);
          offer.status =
            offer.stock <= 0 || listing.stock <= 0 ? "ordered" : "open";
        } else {
          // Freelance gigs stay open for more customers
          offer.status = "open";
        }
        offer.orderId = orderId;
      }

      addSystemMessage(
        order,
        `Escrow deal #${orderId} opened${offer ? " from a created-deal link" : ""}. Parties: Buyer + Deal creator (${seller.name}) + Admin/Escrow. Pay ONLY SocialsFlip escrow — creator is paid by us after delivery, never directly by buyer.`
      );
      addSystemMessage(
        order,
        `💰 Escrow hold: funds stay held until the deal is completed (typically up to ${holdDays} days, or until you confirm delivery). Seller/creator cannot take payment outside escrow.`
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
