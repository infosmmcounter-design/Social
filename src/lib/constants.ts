import type { Category } from "./types";

/** Official-style brand marks for each marketplace board (24×24). */
export const CAT_ICONS: Record<Category, string> = {
  youtube:
    '<rect x="0" y="0" width="24" height="24" rx="6" fill="#FF0000"/><path d="M9.6 7.8v8.4l7.2-4.2z" fill="#fff"/>',
  facebook:
    '<rect width="24" height="24" rx="6" fill="#1877F2"/><path d="M13.35 20.2v-6.85h2.3l.34-2.7h-2.64V9.05c0-.78.22-1.31 1.36-1.31H16V5.35A18 18 0 0 0 14.05 5c-2.05 0-3.45 1.22-3.45 3.47v1.93H8.4v2.7h2.2V20.2z" fill="#fff"/>',
  tiktok:
    '<rect width="24" height="24" rx="6" fill="#010101"/><path d="M15.05 5.2c.35 1.85 1.55 3.15 3.35 3.45v2.35c-1.15-.05-2.2-.4-3.15-1.05v4.85a4.55 4.55 0 1 1-4.55-4.55c.25 0 .5.02.75.07v2.45a2.15 2.15 0 1 0 1.5 2.05V5.2z" fill="#25F4EE"/><path d="M14.35 4.5c.35 1.85 1.55 3.15 3.35 3.45v2.35c-1.15-.05-2.2-.4-3.15-1.05v4.85a4.55 4.55 0 1 1-4.55-4.55c.25 0 .5.02.75.07v2.45a2.15 2.15 0 1 0 1.5 2.05V4.5z" fill="#FE2C55"/><path d="M14.7 4.85c.35 1.85 1.55 3.15 3.35 3.45v2.35c-1.15-.05-2.2-.4-3.15-1.05v4.85a4.55 4.55 0 1 1-4.55-4.55c.25 0 .5.02.75.07v2.45a2.15 2.15 0 1 0 1.5 2.05V4.85z" fill="#fff"/>',
  instagram:
    '<defs><linearGradient id="sfIg" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse"><stop stop-color="#FEDA75"/><stop offset=".35" stop-color="#FA7E1E"/><stop offset=".65" stop-color="#D62976"/><stop offset="1" stop-color="#962FBF"/></linearGradient></defs><rect width="24" height="24" rx="6.5" fill="url(#sfIg)"/><rect x="5.2" y="5.2" width="13.6" height="13.6" rx="4.2" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="12" cy="12" r="3.35" fill="none" stroke="#fff" stroke-width="1.7"/><circle cx="16.55" cy="7.55" r="1.15" fill="#fff"/>',
  x: '<rect width="24" height="24" rx="6" fill="#000"/><path d="M5.8 5.8h3.35l2.95 3.95L15.4 5.8H18.3l-4.55 5.2L18.5 18.2h-3.35l-3.2-4.3-3.7 4.3H5.35l4.85-5.55z" fill="#fff"/>',
  ai: '<rect width="24" height="24" rx="6" fill="#4F46E5"/><path d="M11.2 4.6l1.55 4.2 4.2 1.55-4.2 1.55-1.55 4.2-1.55-4.2-4.2-1.55 4.2-1.55z" fill="#fff"/><path d="M17.8 13.6l.75 2 2 .75-2 .75-.75 2-.75-2-2-.75 2-.75z" fill="#C7D2FE"/>',
  other:
    '<rect width="24" height="24" rx="6" fill="#0F766E"/><path d="M7.2 12a4.8 4.8 0 0 1 8.1-3.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M15.6 5.4v3.1h-3.1" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.8 12a4.8 4.8 0 0 1-8.1 3.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><path d="M8.4 18.6v-3.1h3.1" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  freelance:
    '<rect width="24" height="24" rx="6" fill="#B45309"/><path d="M7.2 16.8V8.4c0-.7.55-1.25 1.25-1.25h.7c.4 0 .75.2 1 .55L12 11.2l1.85-3.5c.25-.35.6-.55 1-.55h.7c.7 0 1.25.55 1.25 1.25v8.4h-1.9v-5.4l-1.35 2.45c-.25.45-.85.45-1.1 0L9.1 11.4v5.4H7.2z" fill="#fff"/><circle cx="17.4" cy="16.5" r="1.35" fill="#FDE68A"/>',
};

/** Escrow fee on every deal, including the official store. */
export const ESCROW_FEE_PCT = 5;

export function escrowAmounts(price: number, feePct = ESCROW_FEE_PCT) {
  const pct = Number.isFinite(feePct) && feePct >= 0 ? feePct : ESCROW_FEE_PCT;
  const fee = Math.round(price * pct) / 100;
  const total = Math.round((price + fee) * 100) / 100;
  return { price, fee, total, feePct: pct };
}

export function money(n: number) {
  return "$" + Number(n).toFixed(2);
}

export function stars(n: number) {
  const r = Math.round(n);
  return "★".repeat(r) + "☆".repeat(5 - r);
}

/** Public trust percent from the seller’s average star rating. */
export function trustFromRating(rating: number, reviewCount: number) {
  if (!reviewCount) return { percent: 100, risky: false, label: "New" };
  let percent = 70;
  if (rating >= 4.8) percent = 100;
  else if (rating >= 4.5) percent = 95;
  else if (rating >= 4) percent = 90;
  else if (rating >= 3.5) percent = 85;
  else if (rating >= 3) percent = 80;
  return { percent, risky: percent < 80, label: `${percent}%` };
}
