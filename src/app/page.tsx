import { HomeClient } from "./HomeClient";
import { getHomeListings, getHomeSellers } from "@/lib/home-data";

/** Revalidate marketplace feed so homepage stays fresh without a blank Loading state. */
export const revalidate = 60;

export default async function HomePage() {
  const [listings, sellers] = await Promise.all([
    getHomeListings("en"),
    getHomeSellers("en"),
  ]);

  return (
    <HomeClient
      initialListings={listings as never}
      initialSellers={sellers as never}
    />
  );
}
