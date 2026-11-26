import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { readStore } from "@/lib/db";
import { localizePost } from "@/lib/i18n/blog";
import { parseLocaleParam } from "@/lib/i18n/content";
import { t } from "@/lib/i18n/messages";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { hreflangAlternates, localizedUrl } from "@/lib/i18n/seo";
import type { LocaleCode } from "@/lib/i18n/locales";

async function currentLocale(lang?: string): Promise<LocaleCode> {
  if (lang) return parseLocaleParam(lang);
  const jar = await cookies();
  return parseLocaleParam(jar.get("sf_locale")?.value);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const locale = await currentLocale((await searchParams).lang);
  const title = `${t(locale, "blog.title")} | SocialsFlip`;
  return {
    title,
    description: title,
    alternates: {
      canonical: localizedUrl("/blog", locale),
      languages: hreflangAlternates("/blog").languages,
    },
  };
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>;
}) {
  const locale = await currentLocale((await searchParams).lang);
  const store = await readStore();
  const posts = [...store.posts]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((p) => localizePost(p, locale));

  return (
    <section className="sec">
      <h1 style={{ fontSize: "2rem" }}>{t(locale, "blog.title")}</h1>
      <div className="grid">
        {posts.map((p) => (
          <Link key={p.id} className="card" href={withLocalePrefix(`/blog/${p.id}`, locale)}>
            <h3>{p.title}</h3>
            <p className="mut sm">{p.body.slice(0, 110)}...</p>
          </Link>
        ))}
        {!posts.length ? <p className="mut">No posts yet.</p> : null}
      </div>
    </section>
  );
}
