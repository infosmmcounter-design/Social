"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLang } from "@/components/LanguageProvider";

type Post = { id: number; title: string; body: string };

export default function BlogPage() {
  const { t, locale } = useLang();
  const [posts, setPosts] = useState<Post[]>([]);
  useEffect(() => {
    api<{ posts: Post[] }>(`/api/blog?lang=${encodeURIComponent(locale)}`)
      .then((d) => setPosts(d.posts))
      .catch(() => setPosts([]));
  }, [locale]);

  return (
    <section className="sec">
      <h1 style={{ fontSize: "2rem" }}>{t("blog.title")}</h1>
      <div className="grid">
        {posts.map((p) => (
          <Link key={p.id} className="card" href={`/blog/${p.id}`}>
            <h3>{p.title}</h3>
            <p className="mut sm">{p.body.slice(0, 110)}...</p>
          </Link>
        ))}
        {!posts.length ? <p className="mut">No posts yet.</p> : null}
      </div>
    </section>
  );
}
