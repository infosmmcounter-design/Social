import { NextResponse } from "next/server";
import { updateStore, readStore, publicListing } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function PATCH(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const id = Number(body.id);
  const action = String(body.action || "");

  try {
    await updateStore((data) => {
      const listing = data.listings.find((l) => l.id === id);
      if (!listing) throw new Error("Listing not found");

      if (action === "approve") {
        listing.status = "approved";
        listing.listed = true;
      } else if (action === "reject") {
        listing.status = "rejected";
        listing.listed = false;
      } else if (action === "unlist") {
        listing.listed = false;
      } else if (action === "publish") {
        listing.status = "approved";
        listing.listed = true;
      } else if (action === "delete") {
        data.listings = data.listings.filter((l) => l.id !== id);
      } else if (action === "price") {
        const price = Number(body.price);
        if (!(price > 0)) throw new Error("Invalid price");
        listing.price = price;
      } else if (action === "stock") {
        const stock = Number(body.stock);
        if (!(stock >= 0) || !Number.isFinite(stock))
          throw new Error("Invalid stock");
        listing.stock = Math.floor(stock);
        if (listing.stock > 0 && listing.status === "approved")
          listing.listed = true;
      } else {
        throw new Error("Unknown action");
      }
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 }
    );
  }

  const store = await readStore();
  const listing = store.listings.find((l) => l.id === id);
  return NextResponse.json({
    ok: true,
    listing: listing ? publicListing(listing, true) : null,
  });
}
