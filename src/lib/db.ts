import bcrypt from "bcryptjs";
import type {
  Category,
  StoreData,
  User,
  Listing,
  Order,
  ChatMessage,
  DealStatus,
} from "./types";
import { DEFAULT_CRYPTO_WALLETS } from "./types";
import { loadRawStore, saveRawStore, persistenceMode } from "./store-backend";
import { avatarDataUrl, listingCoverDataUrl } from "./placeholders";

let writeQueue: Promise<unknown> = Promise.resolve();

async function ensureStore(): Promise<StoreData> {
  const existing = await loadRawStore();
  if (existing) return existing;
  const seed = await createSeed();
  await saveRawStore(seed);
  return seed;
}

export { persistenceMode };

async function createSeed(): Promise<StoreData> {
  const adminHash = await bcrypt.hash("admin123", 10);
  const buyerHash = await bcrypt.hash("buyer123", 10);
  const sellerHash = await bcrypt.hash("seller123", 10);
  const now = new Date().toISOString();

  const users: User[] = [
    {
      id: 1,
      email: "admin@socialsflip.com",
      passwordHash: adminHash,
      name: "SocialsFlip Admin",
      role: "admin",
      country: "",
      bio: "Escrow moderator",
      phone: "",
      avatarUrl: avatarDataUrl("SocialsFlip Admin", true),
      verified: true,
      rating: 5,
      reviewCount: 0,
      dummy: false,
      official: true,
      joinedAt: now,
      active: true,
      paymentMethods: [],
    },
    {
      id: 2,
      email: "store@socialsflip.com",
      passwordHash: sellerHash,
      name: "SocialsFlip",
      role: "seller",
      country: "",
      bio: "Official SocialsFlip store. Items sold by SocialsFlip are sold and delivered directly by us.",
      phone: "",
      avatarUrl: avatarDataUrl("SocialsFlip", true),
      verified: true,
      rating: 5,
      reviewCount: 12,
      dummy: false,
      official: true,
      joinedAt: now,
      active: true,
      paymentMethods: [],
    },
    {
      id: 3,
      email: "buyer@demo.com",
      passwordHash: buyerHash,
      name: "Demo Buyer",
      role: "buyer",
      country: "Pakistan",
      bio: "",
      phone: "",
      avatarUrl: avatarDataUrl("Demo Buyer"),
      verified: false,
      rating: 0,
      reviewCount: 0,
      dummy: false,
      joinedAt: now,
      active: true,
      paymentMethods: [],
    },
  ];

  const listings: Listing[] = [
    {
      id: 10,
      sellerId: 2,
      title: "YouTube Gaming Channel — 85K Subs",
      cat: "youtube",
      niche: "Gaming",
      followers: "85,000",
      monetized: true,
      teaser: "Monetized gaming channel with steady RPM and clean history.",
      privateHandle: "https://youtube.com/@sf-gaming-demo",
      price: 2499,
      desc: "Established gaming channel with consistent views. Full ownership transfer via YouTube Brand Account.",
      img: listingCoverDataUrl("youtube", "YouTube Gaming 85K"),
      images: [],
      stock: 1,
      listingType: "account",
      deliveryDays: 0,
      revisions: 0,
      status: "approved",
      listed: true,
      createdAt: now,
    },
    {
      id: 11,
      sellerId: 2,
      title: "Instagram Fashion Page — 42K Followers",
      cat: "instagram",
      niche: "Fashion",
      followers: "42,000",
      monetized: false,
      teaser: "Aesthetic fashion page with high engagement from US & EU.",
      privateHandle: "@sf_fashion_demo",
      price: 899,
      desc: "Clean aesthetic feed, ready for brand deals after transfer.",
      img: listingCoverDataUrl("instagram", "IG Fashion 42K"),
      images: [],
      stock: 1,
      listingType: "account",
      deliveryDays: 0,
      revisions: 0,
      status: "approved",
      listed: true,
      createdAt: now,
    },
    // Official freelance / Fiverr-style gigs
    {
      id: 12,
      sellerId: 2,
      title: "YouTube Thumbnail Pack (5 designs)",
      cat: "youtube",
      niche: "Thumbnail design",
      followers: "",
      monetized: false,
      teaser: "Click-ready YouTube thumbnails — 5 unique designs, 2 revisions.",
      privateHandle: "",
      price: 49,
      desc: "Fiverr-style freelance gig: send your video title + niche. You get 5 custom thumbnails (PNG) within the delivery window. Includes 2 free revisions. Escrow-protected.",
      img: listingCoverDataUrl("youtube", "YT Thumbnails"),
      images: [],
      stock: 50,
      listingType: "service",
      deliveryDays: 2,
      revisions: 2,
      status: "approved",
      listed: true,
      createdAt: now,
    },
    {
      id: 13,
      sellerId: 2,
      title: "Instagram Reels Editing (up to 60s)",
      cat: "instagram",
      niche: "Reels editing",
      followers: "",
      monetized: false,
      teaser: "Trendy Reels cut with captions, music sync, and hooks.",
      privateHandle: "",
      price: 35,
      desc: "Send raw clips. We edit one Reel up to 60s with captions, transitions, and music sync. 1 revision included. Delivered via escrow chat.",
      img: listingCoverDataUrl("instagram", "Reels Edit"),
      images: [],
      stock: 99,
      listingType: "service",
      deliveryDays: 3,
      revisions: 1,
      status: "approved",
      listed: true,
      createdAt: now,
    },
    {
      id: 14,
      sellerId: 2,
      title: "AI Content System Setup (ChatGPT + Sheets)",
      cat: "ai",
      niche: "AI content system",
      followers: "",
      monetized: false,
      teaser: "Custom prompt pack + Google Sheet workflow for weekly social posts.",
      privateHandle: "",
      price: 79,
      desc: "Freelance AI gig: we build a reusable prompt pack and simple Sheet workflow so you can generate platform posts faster. Includes a 20-min walkthrough notes file. 2 revisions.",
      img: listingCoverDataUrl("ai", "AI Content System"),
      images: [],
      stock: 30,
      listingType: "service",
      deliveryDays: 5,
      revisions: 2,
      status: "approved",
      listed: true,
      createdAt: now,
    },
  ];

  // Pre-seed marketplace with realistic dummy sellers + listings.
  let nid = 100;
  const seedSellers = [
    ["Ayesha Media", "Pakistan"],
    ["Omar Growth Lab", "UAE"],
    ["Nova Social Co", "USA"],
    ["PixelReach Studio", "UK"],
  ] as const;
  const seedTemplates: {
    cat: Category;
    title: string;
    niche: string;
    followers: string;
    price: number;
    monetized: boolean;
  }[] = [
    {
      cat: "youtube",
      title: "YouTube Tech Reviews — Mid Size",
      niche: "Tech",
      followers: "28,500",
      price: 1299,
      monetized: true,
    },
    {
      cat: "tiktok",
      title: "TikTok Viral Clips Account",
      niche: "Entertainment",
      followers: "190,000",
      price: 2100,
      monetized: true,
    },
    {
      cat: "x",
      title: "X News & Trends Account",
      niche: "News",
      followers: "44,000",
      price: 480,
      monetized: false,
    },
  ];

  const dummyHash = await bcrypt.hash("dummy123", 10);
  for (let i = 0; i < seedSellers.length; i++) {
    const sid = nid++;
    const [name, country] = seedSellers[i];
    users.push({
      id: sid,
      email: `dummy.seller.${sid}@socialsflip.local`,
      passwordHash: dummyHash,
      name,
      role: "seller",
      country,
      bio: `${name} sells curated social accounts on SocialsFlip.`,
      phone: "",
      avatarUrl: avatarDataUrl(name, true),
      verified: true,
      rating: Number((4 + Math.random()).toFixed(1)),
      reviewCount: 5 + i * 3,
      dummy: true,
      joinedAt: new Date(Date.now() - (60 + i * 40) * 86400000).toISOString(),
      active: true,
      paymentMethods: [],
    });
    for (let j = 0; j < 2; j++) {
      const tpl = seedTemplates[(i + j) % seedTemplates.length];
      const lid = nid++;
      const title = `${tpl.title} · ${name.split(" ")[0]}`;
      listings.push({
        id: lid,
        sellerId: sid,
        title,
        cat: tpl.cat,
        niche: tpl.niche,
        followers: tpl.followers,
        monetized: tpl.monetized,
        teaser: `${tpl.niche} listing ready for escrow transfer.`,
        privateHandle: `@demo_${tpl.cat}_${lid}`,
        price: tpl.price + i * 50,
        desc: `Demo listing for ${tpl.cat}. Private handle hidden until escrow starts.`,
        img: listingCoverDataUrl(tpl.cat, title),
        images: [],
        stock: 1 + (j % 3),
        listingType: tpl.cat === "other" ? "service" : "account",
        deliveryDays: 0,
        revisions: 0,
        status: "approved",
        listed: true,
        createdAt: now,
      });
    }
  }

  // Extra freelance gigs from dummy sellers (Fiverr-style)
  const freelanceGigs: {
    sellerIdx: number;
    cat: Category;
    title: string;
    niche: string;
    price: number;
    days: number;
    revisions: number;
  }[] = [
    {
      sellerIdx: 0,
      cat: "facebook",
      title: "Facebook Page Management (7 days)",
      niche: "Page management",
      price: 120,
      days: 7,
      revisions: 1,
    },
    {
      sellerIdx: 1,
      cat: "tiktok",
      title: "TikTok Growth Strategy Doc",
      niche: "Account growth",
      price: 55,
      days: 3,
      revisions: 2,
    },
    {
      sellerIdx: 2,
      cat: "youtube",
      title: "YouTube SEO + Title Pack",
      niche: "Channel growth & SEO",
      price: 65,
      days: 4,
      revisions: 2,
    },
  ];
  for (const g of freelanceGigs) {
    const seller = users.find(
      (u) => u.dummy && u.name === seedSellers[g.sellerIdx][0]
    );
    if (!seller) continue;
    const lid = nid++;
    const title = `${g.title} · ${seller.name.split(" ")[0]}`;
    listings.push({
      id: lid,
      sellerId: seller.id,
      title,
      cat: g.cat,
      niche: g.niche,
      followers: "",
      monetized: false,
      teaser: `Freelance gig · delivery in ${g.days} days · ${g.revisions} revision(s).`,
      privateHandle: "",
      price: g.price,
      desc: `Fiverr-style freelance service on ${g.cat}. Work is delivered in the escrow chat after payment is held. Includes ${g.revisions} revision(s).`,
      img: listingCoverDataUrl(g.cat, title),
      images: [],
      stock: 25,
      listingType: "service",
      deliveryDays: g.days,
      revisions: g.revisions,
      status: "approved",
      listed: true,
      createdAt: now,
    });
  }

  return {
    fee: 10,
    settings: {
      fee: 10,
      allowDirectPayToSeller: false,
      autoDetectCrypto: false,
      paymentWindowMins: 60,
      autoHoldOnProof: false,
      deliveryWindowHours: 24,
      escrowHoldDays: 7,
      cryptoWallets: DEFAULT_CRYPTO_WALLETS.map((w) => ({ ...w })),
    },
    nid,
    users,
    applications: [],
    listings,
    orders: [],
    privateRequests: [],
    inquiries: [],
    offers: [],
    reviews: [],
    posts: [
      {
        id: 1,
        title: "How SocialsFlip escrow protects buyers",
        body: "Every marketplace order is held in escrow until you confirm delivery. Our admin moderators sit in the deal chat with you and the seller.",
        createdAt: now,
      },
      {
        id: 2,
        title: "USDT TRC20 vs BEP20 — pay on the right network",
        body: "SocialsFlip escrow accepts USDT on Tron (TRC20) and BNB Smart Chain (BEP20) only. Always match the network shown at checkout. Sending on the wrong network can permanently lose funds.",
        createdAt: now,
      },
    ],
  };
}

export async function readStore(): Promise<StoreData> {
  return normalizeStore(await ensureStore());
}

export async function updateStore(
  mutator: (data: StoreData) => void | Promise<void>
): Promise<StoreData> {
  const run = writeQueue.then(async () => {
    const data = normalizeStore(await ensureStore());
    await mutator(data);
    normalizeStore(data);
    await saveRawStore(data);
    return data;
  });
  writeQueue = run.catch(() => undefined);
  return run;
}

export function nextId(data: StoreData): number {
  const id = data.nid++;
  return id;
}

export function publicUser(
  u: User,
  includePayMethods = false,
  opts?: { revealDummy?: boolean }
) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    country: u.country,
    bio: u.bio,
    phone: u.phone,
    avatarUrl: u.avatarUrl || avatarDataUrl(u.name, u.verified),
    verified: u.verified,
    rating: u.rating,
    reviewCount: u.reviewCount,
    // Never expose dummy badge on public storefront.
    dummy: opts?.revealDummy ? !!u.dummy : false,
    official: !!u.official,
    joinedAt: u.joinedAt,
    active: u.active,
    paymentMethods: includePayMethods
      ? (u.paymentMethods || []).filter((m) => m.enabled)
      : undefined,
  };
}

/** Migrate older store files so new fields always exist. */
export function normalizeStore(data: StoreData): StoreData {
  if (!data.settings) {
    data.settings = {
      fee: data.fee ?? 10,
      allowDirectPayToSeller: false,
      autoDetectCrypto: false,
      paymentWindowMins: 60,
      autoHoldOnProof: false,
      deliveryWindowHours: 24,
      escrowHoldDays: 7,
      cryptoWallets: DEFAULT_CRYPTO_WALLETS.map((w) => ({ ...w })),
    };
  }
  if (!data.settings.paymentWindowMins) data.settings.paymentWindowMins = 60;
  if (data.settings.autoHoldOnProof === undefined)
    data.settings.autoHoldOnProof = false;
  if (!data.settings.deliveryWindowHours)
    data.settings.deliveryWindowHours = 24;
  if (!data.settings.escrowHoldDays) data.settings.escrowHoldDays = 7;
  if (!data.offers) data.offers = [];
  data.settings.allowDirectPayToSeller = false;
  // Keep only TRC20 + BEP20 USDT. Prefer saved address; else platform defaults.
  const prev = data.settings.cryptoWallets || [];
  data.settings.cryptoWallets = DEFAULT_CRYPTO_WALLETS.map((def) => {
    const old =
      prev.find((w) => w.asset === def.asset) ||
      (def.asset === "USDT_BEP20"
        ? prev.find((w) => String(w.asset).includes("BEP") || String(w.asset).includes("BSC"))
        : undefined);
    return {
      ...def,
      address: (old?.address || def.address || "").trim(),
      enabled: old?.enabled ?? true,
    };
  });
  data.fee = data.settings.fee ?? data.fee ?? 10;
  for (const u of data.users) {
    if (!u.paymentMethods) u.paymentMethods = [];
    if (!u.avatarUrl) u.avatarUrl = avatarDataUrl(u.name, u.verified);
  }
  for (const l of data.listings) {
    if (!l.images) l.images = [];
    if (l.stock === undefined || l.stock === null) l.stock = 1;
    if (!l.listingType) l.listingType = l.cat === "other" ? "service" : "account";
    // Accept legacy alias
    if ((l.listingType as string) === "freelance") l.listingType = "service";
    if (l.deliveryDays === undefined || l.deliveryDays === null) {
      l.deliveryDays = l.listingType === "service" ? 3 : 0;
    }
    if (l.revisions === undefined || l.revisions === null) {
      l.revisions = l.listingType === "service" ? 1 : 0;
    }
    if (!l.img) l.img = listingCoverDataUrl(l.cat, l.title);
  }
  // One-time: inject demo freelance gigs if store has none yet
  if (!data.listings.some((l) => l.listingType === "service")) {
    const ownerId =
      data.users.find((u) => u.official)?.id ||
      data.users.find((u) => u.role === "seller")?.id ||
      2;
    const nowIso = new Date().toISOString();
    const demos: Omit<Listing, "id">[] = [
      {
        sellerId: ownerId,
        title: "YouTube Thumbnail Pack (5 designs)",
        cat: "youtube",
        niche: "Thumbnail design",
        followers: "",
        monetized: false,
        teaser: "Click-ready YouTube thumbnails — 5 designs, 2 revisions.",
        privateHandle: "",
        price: 49,
        desc: "Fiverr-style freelance gig delivered via escrow chat.",
        img: listingCoverDataUrl("youtube", "YT Thumbnails"),
        images: [],
        stock: 50,
        listingType: "service",
        deliveryDays: 2,
        revisions: 2,
        status: "approved",
        listed: true,
        createdAt: nowIso,
      },
      {
        sellerId: ownerId,
        title: "Instagram Reels Editing (up to 60s)",
        cat: "instagram",
        niche: "Reels editing",
        followers: "",
        monetized: false,
        teaser: "Trendy Reels cut with captions and music sync.",
        privateHandle: "",
        price: 35,
        desc: "Freelance Reels editing gig. 1 revision included.",
        img: listingCoverDataUrl("instagram", "Reels Edit"),
        images: [],
        stock: 99,
        listingType: "service",
        deliveryDays: 3,
        revisions: 1,
        status: "approved",
        listed: true,
        createdAt: nowIso,
      },
      {
        sellerId: ownerId,
        title: "AI Content System Setup",
        cat: "ai",
        niche: "AI content system",
        followers: "",
        monetized: false,
        teaser: "Prompt pack + Sheet workflow for weekly posts.",
        privateHandle: "",
        price: 79,
        desc: "Freelance AI setup gig with 2 revisions.",
        img: listingCoverDataUrl("ai", "AI Content System"),
        images: [],
        stock: 30,
        listingType: "service",
        deliveryDays: 5,
        revisions: 2,
        status: "approved",
        listed: true,
        createdAt: nowIso,
      },
    ];
    for (const d of demos) {
      data.listings.push({ ...d, id: nextId(data) });
    }
  }
  for (const o of data.orders) {
    o.paymentMode = "escrow_crypto";
    if (o.selectedPayMethodId === undefined) o.selectedPayMethodId = null;
    if (!o.paymentInstructions) o.paymentInstructions = "";
    if (!o.paymentProof) o.paymentProof = "";
    if (o.buyerMarkedPaid === undefined) o.buyerMarkedPaid = !!o.paymentProof;
    if (o.paymentWindowMins === undefined) o.paymentWindowMins = data.settings.paymentWindowMins || 60;
    if (o.paymentDueAt === undefined) {
      o.paymentDueAt = o.createdAt
        ? new Date(
            new Date(o.createdAt).getTime() + o.paymentWindowMins * 60_000
          ).toISOString()
        : null;
    }
    if (o.deliveryWindowHours === undefined)
      o.deliveryWindowHours = data.settings.deliveryWindowHours || 24;
    if (o.deliveryDueAt === undefined) o.deliveryDueAt = null;
    if (o.stockReserved === undefined) o.stockReserved = true;
    if (o.deliveredAt === undefined) o.deliveredAt = null;
    if (o.offerId === undefined) o.offerId = null;
  }
  if (!data.inquiries) data.inquiries = [];
  for (const r of data.reviews) {
    if (!r.about) r.about = "seller";
    if (r.buyerId === undefined) r.buyerId = null;
  }
  return data;
}

export function matchWalletAsset(coin: string): "USDT_TRC20" | "USDT_BEP20" {
  const c = coin.toUpperCase();
  if (c.includes("BEP") || c.includes("BSC") || c.includes("BNB")) return "USDT_BEP20";
  return "USDT_TRC20";
}

export function publicListing(l: Listing, revealHandle = false) {
  return {
    id: l.id,
    sellerId: l.sellerId,
    title: l.title,
    cat: l.cat,
    niche: l.niche,
    followers: l.followers,
    monetized: l.monetized,
    teaser: l.teaser,
    price: l.price,
    desc: l.desc,
    img: l.img || listingCoverDataUrl(l.cat, l.title),
    images: l.images || [],
    stock: l.stock ?? 1,
    listingType: l.listingType || "account",
    deliveryDays: l.deliveryDays ?? (l.listingType === "service" ? 3 : 0),
    revisions: l.revisions ?? (l.listingType === "service" ? 1 : 0),
    isFreelance: (l.listingType || "account") === "service",
    soldOut: (l.stock ?? 1) <= 0,
    status: l.status,
    listed: l.listed,
    createdAt: l.createdAt,
    privateHandle: revealHandle ? l.privateHandle : null,
    handleHidden: !!l.privateHandle && !revealHandle,
  };
}

export function calcTotals(price: number, seller: User, feePct: number) {
  const fee = seller.official ? 0 : Math.round(price * feePct) / 100;
  return { price, fee, total: price + fee };
}

export function addSystemMessage(
  order: Order,
  text: string,
  from: ChatMessage["from"] = "admin"
) {
  order.msgs.push({
    id: Date.now() + Math.floor(Math.random() * 1000),
    from,
    text,
    createdAt: new Date().toISOString(),
  });
}

export function setDealStatus(order: Order, status: DealStatus, note?: string) {
  order.status = status;
  // Only reveal private handle once seller shares credentials / delivery starts
  if (status === "credentials_shared") {
    order.handleRevealed = true;
  }
  if (note) addSystemMessage(order, note);
}

/** Put reserved stock back when a deal dies before delivery. */
export function restoreOrderStock(
  data: StoreData,
  order: Order,
  reason: string
) {
  if (!order.stockReserved) return;
  if (order.deliveredAt) return;
  const listing = data.listings.find((l) => l.id === order.listingId);
  if (listing) {
    listing.stock = (listing.stock ?? 0) + 1;
    if (listing.status === "approved") listing.listed = true;
  }
  order.stockReserved = false;
  addSystemMessage(order, reason);
}

export const DUMMY_NAMES = [
  "Ayesha Media",
  "Omar Growth Lab",
  "Nova Social Co",
  "PixelReach Studio",
  "BluePeak Creators",
  "Lumen Digital",
  "Crafted Audience",
  "Summit Socials",
  "Orbit Content Hub",
  "Vera Brand Pages",
];

export const DUMMY_LISTING_TEMPLATES: {
  cat: Category;
  title: string;
  niche: string;
  followers: string;
  price: number;
  monetized: boolean;
}[] = [
  {
    cat: "youtube",
    title: "YouTube Tech Reviews — Mid Size",
    niche: "Tech",
    followers: "28,500",
    price: 1299,
    monetized: true,
  },
  {
    cat: "instagram",
    title: "Instagram Lifestyle Page",
    niche: "Lifestyle",
    followers: "61,200",
    price: 750,
    monetized: false,
  },
  {
    cat: "tiktok",
    title: "TikTok Viral Clips Account",
    niche: "Entertainment",
    followers: "190,000",
    price: 2100,
    monetized: true,
  },
  {
    cat: "x",
    title: "X News & Trends Account",
    niche: "News",
    followers: "44,000",
    price: 480,
    monetized: false,
  },
  {
    cat: "other",
    title: "Social Growth Service Pack",
    niche: "Services",
    followers: "N/A",
    price: 199,
    monetized: false,
  },
];
