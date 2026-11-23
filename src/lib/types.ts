export type Role = "buyer" | "seller" | "admin";

export type ListingStatus = "pending" | "approved" | "draft" | "rejected";

export type DealStatus =
  | "awaiting_payment"
  | "funds_held"
  | "credentials_shared"
  | "completed"
  | "disputed"
  | "cancelled"
  | "refunded";

export type MessageRole = "buyer" | "seller" | "admin";

export type PrivateRequestStatus = "none" | "requested" | "approved" | "denied";

export type PaymentMode = "escrow_crypto";

/** Only USDT on Tron (TRC20) and BNB Smart Chain (BEP20). */
export type CryptoAsset = "USDT_TRC20" | "USDT_BEP20";

export interface CryptoWallet {
  asset: CryptoAsset;
  address: string;
  label: string;
  network: string;
  enabled: boolean;
}

export interface SellerPaymentMethod {
  id: string;
  type: string;
  label: string;
  details: string;
  enabled: boolean;
}

export interface PlatformSettings {
  fee: number;
  cryptoWallets: CryptoWallet[];
  allowDirectPayToSeller: boolean;
  autoDetectCrypto: boolean;
  /** Default payment window for new deals (minutes). */
  paymentWindowMins: number;
  /** When buyer submits proof, auto move to funds_held (manual verify still recommended). */
  autoHoldOnProof: boolean;
  /** Hours seller has to deliver after funds are held (default 24). */
  deliveryWindowHours: number;
  /** Escrow hold guidance for buyers (days until complete — funds not released early). */
  escrowHoldDays: number;
}

export const DEFAULT_CRYPTO_WALLETS: CryptoWallet[] = [
  {
    asset: "USDT_TRC20",
    address: "TLj1Esv4stWJNcimvXZDXkP5W9FZfQVpx7",
    label: "USDT (TRC20)",
    network: "Tron",
    enabled: true,
  },
  {
    asset: "USDT_BEP20",
    address: "0x97ff787aa462141bc27660BFDB8b96728B3e0209",
    label: "USDT (BEP20)",
    network: "BNB Smart Chain",
    enabled: true,
  },
];

export const CRYPTO_COIN_OPTIONS = [
  { value: "USDT (TRC20)", asset: "USDT_TRC20" as CryptoAsset },
  { value: "USDT (BEP20)", asset: "USDT_BEP20" as CryptoAsset },
];

export type Category =
  | "youtube"
  | "facebook"
  | "tiktok"
  | "instagram"
  | "x"
  | "ai"
  | "other"
  | "freelance";

/** Browse board: Fiverr-style gigs live under the Freelance Services category. */
export function isFreelanceCategory(cat: string | undefined | null): boolean {
  return cat === "freelance";
}

export interface User {
  id: number;
  email: string;
  /** Login name. Filled for older accounts from the email. */
  username?: string;
  /** bcrypt hash of the one-time recovery code. The code itself is never stored. */
  backupCodeHash?: string;
  passwordHash: string;
  name: string;
  role: Role;
  country: string;
  bio: string;
  phone: string;
  /** Public avatar (data URL or https). */
  avatarUrl: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  /** Internal flag — never show “dummy” on the public storefront. */
  dummy: boolean;
  official?: boolean;
  joinedAt: string;
  active: boolean;
  paymentMethods: SellerPaymentMethod[];
  /** Personal USDT balance. Credited only after admin approves a deposit. */
  walletBalance?: number;
  /** Completed escrow deals. Moves with each successful close. */
  completedDeals?: number;
  /** User ids this person blocked. */
  blockedUserIds?: number[];
  /** Emails this person blocked (guest buyers). */
  blockedEmails?: string[];
}

export interface WalletDeposit {
  id: number;
  userId: number;
  amount: number;
  note: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface SellerApplication {
  id: number;
  name: string;
  email: string;
  phone: string;
  country: string;
  about: string;
  title: string;
  cat: Category;
  price: number;
  desc: string;
  status: "new" | "approved" | "rejected";
  createdAt: string;
}

export type ListingType = "account" | "service" | "tool";

export interface Listing {
  id: number;
  sellerId: number;
  title: string;
  cat: Category;
  niche: string;
  followers: string;
  monetized: boolean;
  teaser: string;
  privateHandle: string;
  price: number;
  desc: string;
  img: string;
  /** Extra gallery images (data URLs / https). */
  images: string[];
  /**
   * Units available for accounts/tools (0 = sold out).
   * Freelance gigs ignore stock for buyers — use soldCount instead.
   */
  stock: number;
  /**
   * How many times this gig/listing was purchased (orders opened).
   * Shown on Freelance Services as “X sold” / “purchased by customers”.
   */
  soldCount: number;
  /**
   * account = sell social account
   * service = Fiverr-style freelance gig (growth, editing, AI work…)
   * tool = software / subscription
   */
  listingType: ListingType;
  /** Freelance only: delivery time in days (e.g. 1–14). */
  deliveryDays: number;
  /** Freelance only: included revisions (0 = none). */
  revisions: number;
  status: ListingStatus;
  listed: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  from: MessageRole;
  text: string;
  createdAt: string;
}

export interface Order {
  id: number;
  listingId: number;
  /** If opened from a shareable created-deal link. */
  offerId: number | null;
  sellerId: number;
  buyerId: number | null;
  buyerEmail: string;
  buyerName: string;
  title: string;
  /** How many units the buyer reserved in this deal. */
  qty: number;
  det: string;
  coin: string;
  paymentMode: PaymentMode;
  selectedPayMethodId: string | null;
  paymentInstructions: string;
  paymentProof: string;
  /** Buyer clicked “I made the payment”. */
  buyerMarkedPaid: boolean;
  /** ISO deadline for escrow payment window. */
  paymentDueAt: string | null;
  /** 30 or 60 typical. */
  paymentWindowMins: number;
  /** ISO deadline for seller delivery after funds held (usually +24h). */
  deliveryDueAt: string | null;
  /** Hours allowed for delivery (copied from settings at hold time). */
  deliveryWindowHours: number;
  /** Unit of listing stock reserved for this deal (restored if cancelled/refunded pre-delivery). */
  stockReserved: boolean;
  /** When seller shared credentials / delivered. */
  deliveredAt: string | null;
  price: number;
  fee: number;
  total: number;
  status: DealStatus;
  handleRevealed: boolean;
  privateRequestStatus: PrivateRequestStatus;
  msgs: ChatMessage[];
  createdAt: string;
}

export interface PrivateRequest {
  id: number;
  listingId: number;
  buyerEmail: string;
  buyerName: string;
  status: "requested" | "approved" | "denied";
  createdAt: string;
}

/**
 * Pre-deal chat threads:
 * - seller = buyer ↔ named seller ↔ escrow
 * - escrow = buyer ↔ SocialsFlip escrow only (Help & Support)
 */
export interface InquiryThread {
  id: number;
  /** seller = marketplace seller chat; escrow = direct support with escrow */
  kind: "seller" | "escrow";
  /** 0 when kind is escrow (no seller party). */
  sellerId: number;
  listingId: number | null;
  buyerId: number | null;
  buyerEmail: string;
  buyerName: string;
  subject: string;
  status: "open" | "closed";
  msgs: ChatMessage[];
  createdAt: string;
  updatedAt: string;
  /** User ids who removed this chat from their list. */
  hiddenFor?: number[];
  /** Guest emails who removed this chat from their list. */
  hiddenEmails?: string[];
}

export interface Review {
  id: number;
  orderId: number;
  listingId: number;
  sellerId: number;
  /** Who is being reviewed. */
  about: "seller" | "buyer";
  buyerId: number | null;
  stars: number;
  /** Review body as written by the author (kept in their selected language). */
  text: string;
  who: string;
  date: string;
  /**
   * Locale the author selected when posting (e.g. en, ar, ko).
   * Public pages show the original text in this language — not auto-translated.
   */
  locale: string;
}

export interface BlogPost {
  id: number;
  title: string;
  body: string;
  createdAt: string;
}

/**
 * Shareable “created deal” — anyone can draft a deal link for a buyer.
 * Buyer opens the link, sees service/price/desc, pays SocialsFlip escrow.
 */
export interface DealOffer {
  id: number;
  token: string;
  creatorId: number;
  listingId: number;
  title: string;
  cat: Category;
  desc: string;
  price: number;
  stock: number;
  monetized: boolean;
  followers: string;
  niche: string;
  privateHandle: string;
  status: "open" | "ordered" | "closed";
  orderId: number | null;
  createdAt: string;
}

export interface StoreData {
  fee: number;
  settings: PlatformSettings;
  nid: number;
  users: User[];
  applications: SellerApplication[];
  listings: Listing[];
  orders: Order[];
  privateRequests: PrivateRequest[];
  inquiries: InquiryThread[];
  offers: DealOffer[];
  reviews: Review[];
  posts: BlogPost[];
  walletDeposits?: WalletDeposit[];
}

export const CATEGORIES: [Category, string][] = [
  ["youtube", "YouTube"],
  ["facebook", "Facebook"],
  ["tiktok", "TikTok"],
  ["instagram", "Instagram"],
  ["x", "X (Twitter)"],
  ["ai", "AI Tools"],
  ["freelance", "Freelance Services"],
  ["other", "Subscriptions & Other"],
];

/** UI labels for listing kinds. */
export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  account: "Account for sale",
  service: "Freelance gig",
  tool: "Tool / subscription",
};

/**
 * Quick-pick gig ideas when posting under Freelance Services
 * (or legacy service listings).
 */
export const FREELANCE_GIG_IDEAS: string[] = [
  "YouTube thumbnail design",
  "YouTube video editing",
  "Instagram Reels editing",
  "Facebook page management",
  "TikTok growth / clips",
  "AI content system setup",
  "Social media management",
  "Custom freelance gig",
];

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  awaiting_payment: "Awaiting Payment",
  funds_held: "Funds Held in Escrow",
  credentials_shared: "Account Credentials Shared",
  completed: "Completed",
  disputed: "Disputed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export const DEAL_FLOW: DealStatus[] = [
  "awaiting_payment",
  "funds_held",
  "credentials_shared",
  "completed",
];
