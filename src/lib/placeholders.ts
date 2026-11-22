/** Category covers — black + gold yellow marketplace look. */
const PALETTE: Record<string, [string, string]> = {
  youtube: ["#1A1A1A", "#0A0A0A"],
  instagram: ["#222222", "#111111"],
  tiktok: ["#1C1C1C", "#0D0D0D"],
  facebook: ["#2A2A2A", "#121212"],
  x: ["#111111", "#000000"],
  telegram: ["#1F1F1F", "#0A0A0A"],
  discord: ["#242424", "#101010"],
  other: ["#C9971A", "#8A6A10"],
};

export function listingCoverDataUrl(cat: string, title = ""): string {
  const [a, b] = PALETTE[cat] || PALETTE.other;
  const label = (title || cat).slice(0, 28).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${a}"/>
      <stop offset="100%" stop-color="${b}"/>
    </linearGradient>
    <linearGradient id="y" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#F6E08A"/>
      <stop offset="100%" stop-color="#C9971A"/>
    </linearGradient>
  </defs>
  <rect width="640" height="400" fill="url(#g)"/>
  <circle cx="540" cy="70" r="110" fill="rgba(226,185,61,0.16)"/>
  <circle cx="60" cy="340" r="140" fill="rgba(246,224,138,0.08)"/>
  <text x="40" y="200" fill="url(#y)" font-family="system-ui,sans-serif" font-size="28" font-weight="800">${label}</text>
  <text x="40" y="240" fill="rgba(246,224,138,0.75)" font-family="system-ui,sans-serif" font-size="16">SocialsFlip · Escrow marketplace</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function avatarDataUrl(name: string, verified = false): string {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");
  const ring = verified
    ? `<circle cx="64" cy="64" r="58" fill="none" stroke="#1D9BF0" stroke-width="6"/>`
    : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
  <circle cx="64" cy="64" r="64" fill="#111"/>
  ${ring}
  <text x="64" y="74" text-anchor="middle" fill="#F6E08A" font-family="system-ui,sans-serif" font-size="42" font-weight="800">${initials}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
