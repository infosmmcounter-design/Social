"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLang } from "@/components/LanguageProvider";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useLang();
  const [post, setPost] = useState<{ title: string; body: string } | null>(null);

  useEffect(() => {
    api<{ post: { title: string; body: string } }>(
      `/api/blog?id=${id}&lang=${encodeURIComponent(locale)}`
    )
      .then((d) => setPost(d.post))
      .catch(() => setPost(null));
  }, [id, locale]);

  if (!post) return <p className="sec mut">{t("common.loading")}</p>;
  return (
    <article className="sec" style={{ maxWidth: 660 }}>
      <Link className="mut sm" href="/blog">
        {t("listing.back")} · {t("blog.title")}
      </Link>
      <h1 style={{ fontSize: "2rem", marginTop: 8 }}>{post.title}</h1>
      <p style={{ whiteSpace: "pre-wrap" }}>{post.body}</p>
    </article>
  );
}
