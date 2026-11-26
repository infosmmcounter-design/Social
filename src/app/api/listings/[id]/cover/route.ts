import { NextResponse } from "next/server";
import { readStore } from "@/lib/db";
import { listingCoverDataUrl } from "@/lib/placeholders";

function parseDataUrl(dataUrl: string): { mime: string; body: Buffer } | null {
  const m = dataUrl.match(/^data:([^;,]+)?((?:;[^;,=]+=[^;,]+)*)(;base64)?,(.*)$/s);
  if (!m) return null;
  const mime = (m[1] || "application/octet-stream").trim();
  const isBase64 = !!m[3];
  const payload = m[4] || "";
  try {
    if (isBase64) {
      return { mime, body: Buffer.from(payload, "base64") };
    }
    return { mime, body: Buffer.from(decodeURIComponent(payload), "utf8") };
  } catch {
    return null;
  }
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isFinite(listingId)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const store = await readStore();
  const listing = store.listings.find((l) => l.id === listingId);
  if (!listing || (!listing.listed && listing.status !== "approved")) {
    // Still allow cover for approved-but-unlisted owner views via direct id;
    // public feed only links covers for listed cards.
    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  const raw = (listing.img || "").trim() || listingCoverDataUrl(listing.cat, listing.title);

  if (/^https?:\/\//i.test(raw)) {
    return NextResponse.redirect(raw, 302);
  }

  if (raw.startsWith("data:")) {
    const parsed = parseDataUrl(raw);
    if (!parsed) {
      return NextResponse.json({ error: "Bad image" }, { status: 500 });
    }
    const bytes = new Uint8Array(parsed.body);
    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": parsed.mime,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
        "Content-Length": String(bytes.byteLength),
      },
    });
  }

  return NextResponse.json({ error: "No image" }, { status: 404 });
}
