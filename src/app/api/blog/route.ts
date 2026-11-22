import { NextResponse } from "next/server";
import { readStore, updateStore, nextId } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { isLocale, type LocaleCode } from "@/lib/i18n/locales";
import { localizePost } from "@/lib/i18n/blog";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const langRaw = searchParams.get("lang") || "en";
  const locale: LocaleCode = isLocale(langRaw) ? langRaw : "en";
  const store = await readStore();
  if (id) {
    const post = store.posts.find((p) => p.id === Number(id));
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ post: localizePost(post, locale), locale });
  }
  return NextResponse.json({
    posts: store.posts.map((p) => localizePost(p, locale)),
    locale,
  });
}

export async function POST(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json();
  const title = String(body.title || "").trim();
  const postBody = String(body.body || "").trim();
  if (!title || !postBody)
    return NextResponse.json(
      { error: "Title and body required" },
      { status: 400 }
    );

  let id = 0;
  await updateStore((data) => {
    id = nextId(data);
    data.posts.unshift({
      id,
      title,
      body: postBody,
      createdAt: new Date().toISOString(),
    });
  });
  return NextResponse.json({ id });
}

export async function DELETE(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json();
  await updateStore((data) => {
    data.posts = data.posts.filter((p) => p.id !== Number(body.id));
  });
  return NextResponse.json({ ok: true });
}
