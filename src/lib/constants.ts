import type { Category } from "./types";

export const CAT_ICONS: Record<Category, string> = {
  youtube:
    '<rect x="1" y="4.5" width="22" height="15" rx="4.5" fill="#FF0000"/><path d="M10 9l5.5 3-5.5 3z" fill="#fff"/>',
  facebook:
    '<circle cx="12" cy="12" r="11" fill="#1877F2"/><path d="M13.2 20v-6.6h2.2l.4-2.6h-2.6V9.2c0-.8.3-1.3 1.4-1.3h1.3V5.6c-.2 0-1-.1-1.9-.1-2 0-3.3 1.2-3.3 3.4v1.9H8.5v2.6h2.2V20z" fill="#fff"/>',
  tiktok:
    '<rect width="24" height="24" rx="6" fill="#000"/><g fill="none" stroke-width="2" stroke-linecap="round"><path d="M13 5v9.2a2.6 2.6 0 1 1-2.6-2.6M13 5c.3 2 1.7 3.3 3.6 3.4" stroke="#25F4EE" transform="translate(-.8 .6)"/><path d="M13 5v9.2a2.6 2.6 0 1 1-2.6-2.6M13 5c.3 2 1.7 3.3 3.6 3.4" stroke="#FE2C55" transform="translate(.8 -.6)"/><path d="M13 5v9.2a2.6 2.6 0 1 1-2.6-2.6M13 5c.3 2 1.7 3.3 3.6 3.4" stroke="#fff"/></g>',
  instagram:
    '<defs><linearGradient id="ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset=".4" stop-color="#FA7E1E"/><stop offset=".7" stop-color="#D62976"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs><rect width="24" height="24" rx="6.5" fill="url(#ig)"/><rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" stroke-width="1.8"/><circle cx="16.3" cy="7.7" r="1" fill="#fff"/>',
  x: '<rect width="24" height="24" rx="6" fill="#000"/><path d="M6.2 6.5h3.1l3.2 4.3 3.7-4.3H18l-4.6 5.3L18.2 17.5h-3.1l-3.4-4.5-3.9 4.5H6l4.9-5.6z" fill="#fff"/>',
  ai: '<rect width="24" height="24" rx="6" fill="#4338ca"/><path d="M11 5l1.7 4.6 4.6 1.7-4.6 1.7L11 17.6l-1.7-4.6-4.6-1.7 4.6-1.7z" fill="#fff"/><path d="M18 14l.8 2.2 2.2.8-2.2.8L18 20l-.8-2.2-2.2-.8 2.2-.8z" fill="#fff"/>',
  other:
    '<rect width="24" height="24" rx="6" fill="#0f766e"/><g fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 12a5.5 5.5 0 0 1 9.4-3.9"/><path d="M16 5v3.4h-3.4"/><path d="M17.5 12a5.5 5.5 0 0 1-9.4 3.9"/><path d="M8 19v-3.4h3.4"/></g>',
};

export function money(n: number) {
  return "$" + Number(n).toFixed(2);
}

export function stars(n: number) {
  const r = Math.round(n);
  return "★".repeat(r) + "☆".repeat(5 - r);
}
