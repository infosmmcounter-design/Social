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
import { DEFAULT_CRYPTO_WALLETS, isFreelanceCategory } from "./types";
import { loadRawStore, saveRawStore, persistenceMode } from "./store-backend";
import { avatarDataUrl, listingCoverDataUrl } from "./placeholders";

function isFreelanceListing(l: Pick<Listing, "cat" | "listingType">): boolean {
  return (
    isFreelanceCategory(l.cat) || (l.listingType || "account") === "service"
  );
}

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
      soldCount: 0,
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
      soldCount: 0,
      listingType: "account",
      deliveryDays: 0,
      revisions: 0,
      status: "approved",
      listed: true,
      createdAt: now,
    },
    // Official board: Freelance Services (same chip row as YT/FB/…)
    {
      id: 12,
      sellerId: 2,
      title: "YouTube Thumbnail Pack (5 designs)",
      cat: "freelance",
      niche: "Thumbnail design",
      followers: "",
      monetized: false,
      teaser: "Click-ready YouTube thumbnails — 5 unique designs, 2 revisions.",
      privateHandle: "",
      price: 49,
      desc: "Freelance Services board: send your video title + niche. You get 5 custom thumbnails (PNG) within the delivery window. Includes 2 free revisions. Escrow-protected.",
      img: listingCoverDataUrl("freelance", "YT Thumbnails"),
      images: [],
      stock: 9999,
      soldCount: 48,
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
      cat: "freelance",
      niche: "Reels editing",
      followers: "",
      monetized: false,
      teaser: "Trendy Reels cut with captions, music sync, and hooks.",
      privateHandle: "",
      price: 35,
      desc: "Freelance Services board: send raw clips. One Reel up to 60s with captions and music sync. 1 revision. Delivered via escrow chat.",
      img: listingCoverDataUrl("freelance", "Reels Edit"),
      images: [],
      stock: 9999,
      soldCount: 126,
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
      cat: "freelance",
      niche: "AI content system",
      followers: "",
      monetized: false,
      teaser: "Custom prompt pack + Google Sheet workflow for weekly social posts.",
      privateHandle: "",
      price: 79,
      desc: "Freelance Services board: reusable prompt pack + Sheet workflow. Includes walkthrough notes. 2 revisions.",
      img: listingCoverDataUrl("freelance", "AI Content System"),
      images: [],
      stock: 9999,
      soldCount: 31,
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
        soldCount: 0,
        listingType: tpl.cat === "other" ? "tool" : "account",
        deliveryDays: 0,
        revisions: 0,
        status: "approved",
        listed: true,
        createdAt: now,
      });
    }
  }

  // Extra gigs on the Freelance Services board from dummy sellers
  const freelanceGigs: {
    sellerIdx: number;
    title: string;
    niche: string;
    price: number;
    days: number;
    revisions: number;
  }[] = [
    {
      sellerIdx: 0,
      title: "Facebook Page Management (7 days)",
      niche: "Page management",
      price: 120,
      days: 7,
      revisions: 1,
    },
    {
      sellerIdx: 1,
      title: "TikTok Growth Strategy Doc",
      niche: "Account growth",
      price: 55,
      days: 3,
      revisions: 2,
    },
    {
      sellerIdx: 2,
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
      cat: "freelance",
      niche: g.niche,
      followers: "",
      monetized: false,
      teaser: `Freelance Services · delivery in ${g.days} days · ${g.revisions} revision(s).`,
      privateHandle: "",
      price: g.price,
      desc: `Listed on the Freelance Services board. Delivered in escrow chat after payment is held. Includes ${g.revisions} revision(s).`,
      img: listingCoverDataUrl("freelance", title),
      images: [],
      stock: 9999,
      soldCount: 12,
      listingType: "service",
      deliveryDays: g.days,
      revisions: g.revisions,
      status: "approved",
      listed: true,
      createdAt: now,
    });
  }

  return {
    fee: 5,
    settings: {
      fee: 5,
      feeRevised: true,
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
  opts?: { revealDummy?: boolean; includeWallet?: boolean }
) {
  return {
    id: u.id,
    email: u.email,
    username: u.username || "",
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
    completedDeals: u.completedDeals || 0,
    walletBalance: opts?.includeWallet ? Number(u.walletBalance || 0) : undefined,
    emailVerified: !!u.emailVerified,
    google: !!u.googleSub,
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
  if (!data.settings.feeRevised) {
    data.settings.fee = 5;
    data.settings.feeRevised = true;
  }
  if (typeof data.settings.fee !== "number" || Number.isNaN(data.settings.fee)) {
    data.settings.fee = 5;
  }
  data.fee = data.settings.fee;
  if (!data.walletDeposits) data.walletDeposits = [];
  if (!data.cryptoPayments) data.cryptoPayments = [];
  if (!data.unmatchedTxs) data.unmatchedTxs = [];
  if (!data.cryptoTxLocks) data.cryptoTxLocks = [];
  for (const u of data.users) {
    if (!u.paymentMethods) u.paymentMethods = [];
    if (!u.avatarUrl) u.avatarUrl = avatarDataUrl(u.name, u.verified);
    if (typeof u.walletBalance !== "number" || Number.isNaN(u.walletBalance)) {
      u.walletBalance = 0;
    }
    if (typeof u.completedDeals !== "number") u.completedDeals = 0;
    if (!u.blockedUserIds) u.blockedUserIds = [];
    if (!u.blockedEmails) u.blockedEmails = [];
  }
  const taken = new Set<string>();
  for (const u of data.users) {
    let name = (u.username || "").trim().toLowerCase();
    if (!/^[a-z0-9_]{3,20}$/.test(name)) {
      const fromEmail = (u.email || "").split("@")[0] || "";
      name = (fromEmail || u.name || "user")
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 16);
      if (name.length < 3) name = `user${u.id}`;
    }
    let pick = name;
    let n = 2;
    while (taken.has(pick)) pick = `${name.slice(0, 16)}${n++}`.slice(0, 20);
    u.username = pick;
    taken.add(pick);
  }
  for (const l of data.listings) {
    if (!l.images) l.images = [];
    if (l.stock === undefined || l.stock === null) l.stock = 1;
    if (l.soldCount === undefined || l.soldCount === null) l.soldCount = 0;
    if (!l.listingType) {
      l.listingType =
        l.cat === "freelance"
          ? "service"
          : l.cat === "other"
            ? "tool"
            : "account";
    }
    // Accept legacy alias
    if ((l.listingType as string) === "freelance") l.listingType = "service";
    if (l.cat === "freelance") l.listingType = "service";
    if (isFreelanceListing(l)) {
      // Gigs are not limited by stock inventory
      if ((l.stock ?? 0) < 100) l.stock = 9999;
    }
    if (l.deliveryDays === undefined || l.deliveryDays === null) {
      l.deliveryDays = l.listingType === "service" ? 3 : 0;
    }
    if (l.revisions === undefined || l.revisions === null) {
      l.revisions = l.listingType === "service" ? 1 : 0;
    }
    if (!l.img) l.img = listingCoverDataUrl(l.cat, l.title);
  }
  // Migrate legacy service gigs that lived under platform cats → Freelance board
  for (const l of data.listings) {
    if (
      l.listingType === "service" &&
      l.cat !== "freelance" &&
      l.cat !== "other"
    ) {
      l.cat = "freelance";
    }
  }
  // One-time: inject demo freelance gigs if Freelance Services board is empty
  if (!data.listings.some((l) => l.cat === "freelance")) {
    const ownerId =
      data.users.find((u) => u.official)?.id ||
      data.users.find((u) => u.role === "seller")?.id ||
      2;
    const nowIso = new Date().toISOString();
    const demos: Omit<Listing, "id">[] = [
      {
        sellerId: ownerId,
        title: "YouTube Thumbnail Pack (5 designs)",
        cat: "freelance",
        niche: "Thumbnail design",
        followers: "",
        monetized: false,
        teaser: "Click-ready YouTube thumbnails — 5 designs, 2 revisions.",
        privateHandle: "",
        price: 49,
        desc: "Freelance Services board — gig delivered via escrow chat.",
        img: listingCoverDataUrl("freelance", "YT Thumbnails"),
        images: [],
        stock: 9999,
        soldCount: 48,
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
        cat: "freelance",
        niche: "Reels editing",
        followers: "",
        monetized: false,
        teaser: "Trendy Reels cut with captions and music sync.",
        privateHandle: "",
        price: 35,
        desc: "Freelance Services board — Reels editing. 1 revision included.",
        img: listingCoverDataUrl("freelance", "Reels Edit"),
        images: [],
        stock: 9999,
        soldCount: 126,
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
        cat: "freelance",
        niche: "AI content system",
        followers: "",
        monetized: false,
        teaser: "Prompt pack + Sheet workflow for weekly posts.",
        privateHandle: "",
        price: 79,
        desc: "Freelance Services board — AI setup gig with 2 revisions.",
        img: listingCoverDataUrl("freelance", "AI Content System"),
        images: [],
        stock: 9999,
        soldCount: 31,
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
    if (o.sellerAcceptedAt === undefined) {
      o.sellerAcceptedAt =
        o.status === "credentials_shared" ||
        o.status === "release_requested" ||
        o.status === "completed" ||
        o.deliveredAt
          ? o.deliveredAt || o.createdAt
          : null;
    }
    if (o.buyerConfirmedAt === undefined) {
      o.buyerConfirmedAt =
        o.status === "completed" || o.status === "release_requested"
          ? o.deliveredAt || o.createdAt
          : null;
    }
    if (o.offerId === undefined) o.offerId = null;
    if (!o.seen) o.seen = {};
    if (!o.qty || o.qty < 1) o.qty = 1;
  }
  if (!data.inquiries) data.inquiries = [];
  for (const t of data.inquiries) {
    if (!t.kind) t.kind = "seller";
    if (!t.hiddenFor) t.hiddenFor = [];
    if (!t.hiddenEmails) t.hiddenEmails = [];
    if (t.orderId === undefined) t.orderId = null;
    if (!t.seen) t.seen = {};
  }
  for (const r of data.reviews) {
    if (!r.about) r.about = "seller";
    if (r.buyerId === undefined) r.buyerId = null;
    if (!r.locale) r.locale = "en";
  }
  // Demo multilingual public buyer→seller reviews (shown in buyer's language)
  if (!data.reviews.some((r) => (r.about || "seller") === "seller")) {
    const sellerId =
      data.users.find((u) => u.official && u.role === "seller")?.id ||
      data.users.find((u) => u.role === "seller")?.id ||
      2;
    const listingId =
      data.listings.find((l) => l.sellerId === sellerId && l.listed)?.id ||
      data.listings[0]?.id ||
      10;
    const demos: {
      stars: number;
      text: string;
      who: string;
      locale: string;
      date: string;
    }[] = [
      {
        stars: 5,
        text: "Smooth escrow and fast delivery. Thumbnail pack looked pro.",
        who: "ja***",
        locale: "en",
        date: "2026-10-12",
      },
      {
        stars: 5,
        text: "거래가 안전했고 작업 속도가 빨랐어요. 추천합니다!",
        who: "민***",
        locale: "ko",
        date: "2026-10-18",
      },
      {
        stars: 4,
        text: "خدمة ممتازة والدفع عبر الضمان أعطاني ثقة. سأشتري مرة أخرى.",
        who: "أح***",
        locale: "ar",
        date: "2026-10-22",
      },
      {
        stars: 5,
        text: "Escrow klar und Lieferung pünktlich. Gerne wieder.",
        who: "ma***",
        locale: "de",
        date: "2026-11-02",
      },
      {
        stars: 5,
        text: "Pago en escrow sin problemas. El gig de Reels quedó perfecto.",
        who: "lu***",
        locale: "es",
        date: "2026-11-08",
      },
    ];
    for (const d of demos) {
      data.reviews.push({
        id: nextId(data),
        orderId: 0,
        listingId,
        sellerId,
        about: "seller",
        buyerId: null,
        stars: d.stars,
        text: d.text,
        who: d.who,
        date: d.date,
        locale: d.locale,
      });
    }
    const seller = data.users.find((u) => u.id === sellerId);
    if (seller) {
      const revs = data.reviews.filter(
        (r) => r.sellerId === sellerId && (r.about || "seller") === "seller"
      );
      seller.reviewCount = revs.length;
      seller.rating = revs.reduce((a, r) => a + r.stars, 0) / revs.length;
    }
  }
  return data;
}

export function matchWalletAsset(coin: string): "USDT_TRC20" | "USDT_BEP20" {
  const c = coin.toUpperCase();
  if (c.includes("BEP") || c.includes("BSC") || c.includes("BNB")) return "USDT_BEP20";
  return "USDT_TRC20";
}

export function publicListing(l: Listing, revealHandle = false) {
  const freelance = isFreelanceListing(l);
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
    stock: freelance ? undefined : l.stock ?? 1,
    soldCount: l.soldCount ?? 0,
    listingType: l.listingType || "account",
    deliveryDays: l.deliveryDays ?? (freelance ? 3 : 0),
    revisions: l.revisions ?? (freelance ? 1 : 0),
    isFreelance: freelance,
    soldOut: freelance ? false : (l.stock ?? 1) <= 0,
    status: l.status,
    listed: l.listed,
    createdAt: l.createdAt,
    privateHandle: revealHandle ? l.privateHandle : null,
    handleHidden: !!l.privateHandle && !revealHandle,
  };
}

export { isFreelanceListing };

export function calcTotals(price: number, _seller: User, feePct: number) {
  const pct = Number.isFinite(feePct) && feePct >= 0 ? feePct : 5;
  const fee = Math.round(price * pct) / 100;
  return { price, fee, total: Math.round((price + fee) * 100) / 100 };
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
  if (order.deliveredAt) return;
  const qty = Math.max(1, Math.floor(order.qty || 1));
  const listing = data.listings.find((l) => l.id === order.listingId);
  if (listing) {
    listing.soldCount = Math.max(0, (listing.soldCount ?? 0) - qty);
  }
  if (!order.stockReserved) {
    addSystemMessage(order, reason);
    return;
  }
  if (listing) {
    listing.stock = (listing.stock ?? 0) + qty;
    if (listing.status === "approved") listing.listed = true;
  }
  if (order.offerId) {
    const offer = data.offers.find((o) => o.id === order.offerId);
    if (offer) {
      offer.stock = (offer.stock ?? 0) + qty;
      if (offer.status === "ordered") offer.status = "open";
    }
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
    title: "Canva Pro Shared Seat (30 days)",
    niche: "Subscriptions",
    followers: "N/A",
    price: 199,
    monetized: false,
  },
  {
    cat: "freelance",
    title: "YouTube Thumbnail Pack (5 designs)",
    niche: "Thumbnail design",
    followers: "",
    price: 49,
    monetized: false,
  },
  {
    cat: "freelance",
    title: "Instagram Reels Editing (up to 60s)",
    niche: "Reels editing",
    followers: "",
    price: 35,
    monetized: false,
  },
];
