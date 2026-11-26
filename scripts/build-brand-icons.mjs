import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const mark = readFileSync(new URL("../public/brand/mark.svg", import.meta.url));

async function png(size, file, pad = 0) {
  const inner = size - pad * 2;
  const rendered = await sharp(mark).resize(inner, inner).png().toBuffer();
  const out = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: rendered, left: pad, top: pad }])
    .png()
    .toBuffer();
  writeFileSync(file, out);
  return out;
}

const sizes = {
  "public/brand/favicon-16x16.png": 16,
  "public/brand/favicon-32x32.png": 32,
  "public/brand/favicon-48x48.png": 48,
  "public/brand/mstile-150x150.png": 150,
  "public/brand/apple-touch-icon.png": 180,
  "public/brand/android-chrome-192x192.png": 192,
  "public/brand/android-chrome-512x512.png": 512,
  "public/brand/logo.png": 512,
};

const pngs = {};
for (const [file, size] of Object.entries(sizes)) {
  pngs[size] = await png(size, file);
}

const maskable = await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 255, g: 253, b: 248, alpha: 1 },
  },
})
  .composite([{ input: await sharp(mark).resize(360, 360).png().toBuffer(), gravity: "centre" }])
  .png()
  .toBuffer();
writeFileSync("public/brand/logo-maskable.png", maskable);

const ogMark = await sharp(mark).resize(360, 360).png().toBuffer();
const ogCard = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#fffdf8"/>
  <rect x="24" y="24" width="1152" height="582" rx="36" fill="none" stroke="#e6c35c" stroke-width="3"/>
  <text x="500" y="280" font-family="Arial, Helvetica, sans-serif" font-size="86" font-weight="700" fill="#17140F">Socials<tspan fill="#C9962A">Flip</tspan></text>
  <text x="500" y="360" font-family="Arial, Helvetica, sans-serif" font-size="32" fill="#5c5346">Escrow marketplace for social accounts</text>
</svg>`);
const og = await sharp(ogCard)
  .composite([{ input: ogMark, left: 90, top: 135 }])
  .png()
  .toBuffer();
writeFileSync("public/brand/og.png", og);

function ico(images) {
  const count = images.length;
  let offset = 6 + 16 * count;
  const entries = [];
  for (const img of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 0);
    entry.writeUInt8(img.size >= 256 ? 0 : img.size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(img.png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += img.png.length;
  }
  const dir = Buffer.alloc(6);
  dir.writeUInt16LE(0, 0);
  dir.writeUInt16LE(1, 2);
  dir.writeUInt16LE(count, 4);
  return Buffer.concat([dir, ...entries, ...images.map((img) => img.png)]);
}

const favicon = ico([
  { size: 16, png: pngs[16] },
  { size: 32, png: pngs[32] },
  { size: 48, png: pngs[48] },
]);
writeFileSync("public/favicon.ico", favicon);
writeFileSync("src/app/favicon.ico", favicon);
console.log("brand icons written");
