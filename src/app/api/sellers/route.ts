import { NextResponse } from "next/server";
import { readStore, publicUser } from "@/lib/db";
import { localeFromRequest } from "@/lib/i18n/api-locale";
import { localizeSeller } from "@/lib/i18n/content";

/** Public seller directory (no dummy badge). */
export async function GET(req: Request) {
  const locale = localeFromRequest(req);
  const store = await readStore();
  const sellers = store.users
    .filter(
      (u) =>
        u.active &&
        u.role !== "admin" &&
        (u.role === "seller" || u.official)
    )
    .map((u) => {
      const live = store.listings.filter(
        (l) => l.sellerId === u.id && l.listed && l.status === "approved"
      ).length;
      return {
        ...localizeSeller(publicUser(u), locale),
        listingCount: live,
      };
    })
    .filter((s) => s.listingCount > 0 || s.official)
    .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);

  return NextResponse.json({ sellers, locale });
}
