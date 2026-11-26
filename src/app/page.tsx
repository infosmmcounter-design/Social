import { HomeClient } from "./HomeClient";
import {
  getHomeListings,
  getHomeSellers,
  getTrustStats,
} from "@/lib/home-data";

/** Revalidate marketplace feed so homepage stays fresh without a blank Loading state. */
export const revalidate = 60;

export default async function HomePage() {
  const [listings, sellers, trust] = await Promise.all([
    getHomeListings("en"),
    getHomeSellers("en"),
    getTrustStats(),
  ]);

  return (
    <HomeClient
      initialListings={listings as never}
      initialSellers={sellers as never}
      trust={trust}
    />
  );
}
