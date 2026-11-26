import { NextResponse } from "next/server";
import { publicUser, updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";

/** Any signed-in member can sell. No application and no admin approval. */
export async function POST() {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  await updateStore((data) => {
    const me = data.users.find((u) => u.id === auth.user!.id);
    if (!me) throw new Error("Not found");
    if (me.role === "buyer") me.role = "seller";
  });

  const { readStore } = await import("@/lib/db");
  const store = await readStore();
  const me = store.users.find((u) => u.id === auth.user.id);
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    user: publicUser(me, false, { includeWallet: true }),
  });
}
