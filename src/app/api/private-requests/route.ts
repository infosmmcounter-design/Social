import { NextResponse } from "next/server";
import { updateStore, nextId, readStore } from "@/lib/db";
import { getCurrentUser, requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser(["admin", "seller"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const store = await readStore();
  let reqs = store.privateRequests;
  if (auth.user.role === "seller") {
    const myListingIds = new Set(
      store.listings.filter((l) => l.sellerId === auth.user!.id).map((l) => l.id)
    );
    reqs = reqs.filter((r) => myListingIds.has(r.listingId));
  }
  const enriched = [...reqs]
    .sort((a, b) => b.id - a.id)
    .map((r) => {
      const listing = store.listings.find((l) => l.id === r.listingId);
      return {
        ...r,
        listingTitle: listing?.title || `#${r.listingId}`,
      };
    });
  return NextResponse.json({ requests: enriched });
}

export async function POST(req: Request) {
  const body = await req.json();
  const listingId = Number(body.listingId);
  const user = await getCurrentUser();
  const buyerEmail = String(body.email || user?.email || "")
    .trim()
    .toLowerCase();
  const buyerName = String(body.name || user?.name || "Buyer").trim();

  if (!listingId || !buyerEmail) {
    return NextResponse.json({ error: "Listing and email required" }, { status: 400 });
  }

  let requestId = 0;
  try {
    await updateStore((data) => {
      const listing = data.listings.find((l) => l.id === listingId && l.listed);
      if (!listing) throw new Error("Listing not found");
      const exists = data.privateRequests.find(
        (r) =>
          r.listingId === listingId &&
          r.buyerEmail === buyerEmail &&
          r.status === "requested"
      );
      if (exists) throw new Error("Request already pending");
      requestId = nextId(data);
      data.privateRequests.push({
        id: requestId,
        listingId,
        buyerEmail,
        buyerName,
        status: "requested",
        createdAt: new Date().toISOString(),
      });
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  return NextResponse.json({ ok: true, id: requestId });
}

export async function PATCH(req: Request) {
  const auth = await requireUser(["admin", "seller"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const id = Number(body.id);
  const approve = !!body.approve;

  try {
    await updateStore((data) => {
      const r = data.privateRequests.find((x) => x.id === id);
      if (!r) throw new Error("Request not found");
      const listing = data.listings.find((l) => l.id === r.listingId);
      if (!listing) throw new Error("Listing missing");
      if (
        auth.user!.role === "seller" &&
        listing.sellerId !== auth.user!.id &&
        !auth.user!.dummy
      ) {
        // sellers only their listings; admin always ok; admin also for dummy
        throw new Error("Forbidden");
      }
      if (auth.user!.role === "seller" && listing.sellerId !== auth.user!.id) {
        throw new Error("Forbidden");
      }
      r.status = approve ? "approved" : "denied";
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  const store = await readStore();
  return NextResponse.json({
    request: store.privateRequests.find((r) => r.id === id),
  });
}
