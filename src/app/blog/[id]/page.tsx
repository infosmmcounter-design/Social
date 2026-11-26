import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
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
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const locale = await currentLocale((await searchParams).lang);
  const store = await readStore();
  const post = store.posts.find((p) => p.id === Number(id));
  if (!post) return { title: t(locale, "blog.title") };
  const tr = localizePost(post, locale);
  const description = tr.body.slice(0, 160);
  return {
    title: `${tr.title} | SocialsFlip`,
    description,
    alternates: {
      canonical: localizedUrl(`/blog/${post.id}`, locale),
      languages: hreflangAlternates(`/blog/${post.id}`).languages,
    },
    openGraph: { title: tr.title, description },
  };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { id } = await params;
  const locale = await currentLocale((await searchParams).lang);
  const store = await readStore();
  const post = store.posts.find((p) => p.id === Number(id));
  if (!post) notFound();
  const tr = localizePost(post, locale);

  return (
    <article className="sec" style={{ maxWidth: 660 }}>
      <Link className="mut sm" href={withLocalePrefix("/blog", locale)}>
        {t(locale, "listing.back")} · {t(locale, "blog.title")}
      </Link>
      <h1 style={{ fontSize: "2rem", marginTop: 8 }}>{tr.title}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{tr.body}</p>
    </article>
  );
}
