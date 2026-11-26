import type { LocaleCode } from "@/lib/i18n/locales";
import { LOCALES } from "@/lib/i18n/locales";
import { localizeListing } from "@/lib/i18n/content";
import { keywordsFor } from "@/lib/i18n/keywords";
import { localizedUrl, siteOrigin } from "@/lib/i18n/seo";
import type { Listing } from "@/lib/types";

/** Public crawlable cover URL for Google Images / Open Graph. */
export function listingCoverUrl(listingId: number) {
  return `${siteOrigin()}/api/listings/${listingId}/cover`;
}

export function listingImageAlt(
  locale: LocaleCode,
  listing: Pick<
    Listing,
    "id" | "title" | "cat" | "price" | "teaser" | "desc" | "niche" | "monetized" | "followers"
  > & { listingType?: Listing["listingType"] }
) {
  const pub = localizeListing(
    {
      ...listing,
      niche: listing.niche || "",
      teaser: listing.teaser || "",
      desc: listing.desc || "",
    },
    locale
  );
  const keys = keywordsFor(locale, pub.cat).slice(0, 3);
  const price = Number.isFinite(listing.price) ? `$${listing.price}` : "";
  return [pub.title, price, keys[0], "SocialsFlip escrow"]
    .filter(Boolean)
    .join(" — ")
    .slice(0, 180);
}

export function listingSeoBundle(
  listing: Listing,
  locale: LocaleCode
) {
  const pub = localizeListing(listing, locale);
  const keywords = keywordsFor(locale, pub.cat);
  const description = (pub.teaser || pub.desc || pub.title).slice(0, 160);
  const title = `${pub.title} | SocialsFlip`;
  const url = localizedUrl(`/listing/${listing.id}`, locale);
  const image = listingCoverUrl(listing.id);
  const imageAlt = listingImageAlt(locale, listing);
  return {
    pub,
    keywords,
    description,
    title,
    url,
    image,
    imageAlt,
  };
}

/** Product + ImageObject JSON-LD for one locale listing URL. */
export function listingProductJsonLd(listing: Listing, locale: LocaleCode) {
  const seo = listingSeoBundle(listing, locale);
  const inStock =
    listing.listed &&
    listing.status === "approved" &&
    (listing.listingType === "service" ||
      listing.cat === "freelance" ||
      (listing.stock ?? 0) > 0);

  const product = {
    "@type": "Product" as const,
    "@id": `${seo.url}#product`,
    name: seo.pub.title,
    description: seo.description,
    sku: `sf-listing-${listing.id}`,
    productID: String(listing.id),
    category: seo.pub.cat,
    image: [seo.image],
    brand: {
      "@type": "Brand" as const,
      name: "SocialsFlip",
    },
    keywords: seo.keywords.join(", "),
    inLanguage: locale === "zh" ? "zh-CN" : locale,
    url: seo.url,
    offers: {
      "@type": "Offer" as const,
      url: seo.url,
      priceCurrency: "USD",
      price: String(seo.pub.price),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: {
        "@type": "Organization" as const,
        name: "SocialsFlip",
        url: siteOrigin(),
      },
    },
  };

  const imageObject = {
    "@type": "ImageObject" as const,
    "@id": `${seo.url}#image`,
    contentUrl: seo.image,
    url: seo.image,
    name: seo.imageAlt,
    description: seo.description,
    caption: seo.imageAlt,
    inLanguage: locale === "zh" ? "zh-CN" : locale,
    representativeOfPage: true,
  };

  return {
    "@context": "https://schema.org",
    "@graph": [product, imageObject],
  };
}

/** All-locale Product graph links so crawlers see every language variant. */
export function listingMultilangJsonLd(listing: Listing, locale: LocaleCode) {
  const primary = listingProductJsonLd(listing, locale);
  const variants = LOCALES.map((l) => {
    const seo = listingSeoBundle(listing, l.code);
    return {
      "@type": "Product" as const,
      "@id": `${seo.url}#product`,
      name: seo.pub.title,
      url: seo.url,
      image: seo.image,
      inLanguage: l.code === "zh" ? "zh-CN" : l.code,
      offers: {
        "@type": "Offer" as const,
        priceCurrency: "USD",
        price: String(seo.pub.price),
        url: seo.url,
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      ...(Array.isArray((primary as { "@graph"?: unknown[] })["@graph"])
        ? (primary as { "@graph": unknown[] })["@graph"]
        : [primary]),
      {
        "@type": "ItemList" as const,
        name: "Localized product pages",
        itemListElement: variants.map((v, i) => ({
          "@type": "ListItem" as const,
          position: i + 1,
          item: v,
        })),
      },
    ],
  };
}
