import type { Metadata } from "next";
import { cookies } from "next/headers";
import { readStore } from "@/lib/db";
import { localizeListing, parseLocaleParam } from "@/lib/i18n/content";
import { hreflangAlternates, localizedUrl } from "@/lib/i18n/seo";
import type { LocaleCode } from "@/lib/i18n/locales";
import ListingDetailPage from "./view";

async function currentLocale(lang?: string): Promise<LocaleCode> {
  if (lang) return parseLocaleParam(lang);
  const jar = await cookies();
  return parseLocaleParam(jar.get("sf_locale")?.value);
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await currentLocale((await searchParams).lang);
  const store = await readStore();
  const listing = store.listings.find((l) => l.id === Number(id));
  if (!listing) return { title: "SocialsFlip" };
  const pub = localizeListing(listing, locale);
  const description = (pub.teaser || pub.desc || pub.title).slice(0, 160);
  const title = `${pub.title} | SocialsFlip`;
  return {
    title,
    description,
    alternates: {
      canonical: localizedUrl(`/listing/${listing.id}`, locale),
      languages: hreflangAlternates(`/listing/${listing.id}`).languages,
    },
    openGraph: { title: pub.title, description },
  };
}

export default function Page() {
  return <ListingDetailPage />;
}
