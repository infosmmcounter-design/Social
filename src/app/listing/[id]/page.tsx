import type { Metadata } from "next";
import { cookies } from "next/headers";
import { readStore } from "@/lib/db";
import { parseLocaleParam } from "@/lib/i18n/content";
import { hreflangAlternates } from "@/lib/i18n/seo";
import type { LocaleCode } from "@/lib/i18n/locales";
import {
  listingMultilangJsonLd,
  listingSeoBundle,
} from "@/lib/seo/listing-product";
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

  const seo = listingSeoBundle(listing, locale);
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: seo.url,
      languages: hreflangAlternates(`/listing/${listing.id}`).languages,
    },
    openGraph: {
      type: "website",
      title: seo.pub.title,
      description: seo.description,
      url: seo.url,
      siteName: "SocialsFlip",
      locale: locale === "zh" ? "zh_CN" : locale,
      images: [
        {
          url: seo.image,
          alt: seo.imageAlt,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.pub.title,
      description: seo.description,
      images: [seo.image],
    },
    other: {
      "product:price:amount": String(seo.pub.price),
      "product:price:currency": "USD",
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const locale = await currentLocale((await searchParams).lang);
  const store = await readStore();
  const listing = store.listings.find((l) => l.id === Number(id));
  const jsonLd =
    listing && (listing.listed || listing.status === "approved")
      ? listingMultilangJsonLd(listing, locale)
      : null;

  return (
    <>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <ListingDetailPage />
    </>
  );
}
