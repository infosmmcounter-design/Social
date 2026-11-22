import { NextResponse } from "next/server";
import { updateStore, readStore, publicUser } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import type { SellerPaymentMethod } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sellerId = Number(searchParams.get("sellerId"));
  const store = await readStore();
  const seller = store.users.find((u) => u.id === sellerId);
  if (!seller) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    paymentMethods: (seller.paymentMethods || []).filter((m) => m.enabled),
  });
}

export async function POST(req: Request) {
  const auth = await requireUser(["seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = await req.json();
  const targetId =
    auth.user.role === "admin" && body.sellerId
      ? Number(body.sellerId)
      : auth.user.id;

  const method: SellerPaymentMethod = {
    id: String(body.id || `pm-${Date.now()}`),
    type: body.type || "other",
    label: String(body.label || "").trim(),
    details: String(body.details || "").trim(),
    enabled: body.enabled !== false,
  };
  if (!method.label || !method.details) {
    return NextResponse.json({ error: "Label and details required" }, { status: 400 });
  }

  await updateStore((data) => {
    const user = data.users.find((u) => u.id === targetId);
    if (!user) throw new Error("Seller not found");
    if (!user.paymentMethods) user.paymentMethods = [];
    const idx = user.paymentMethods.findIndex((m) => m.id === method.id);
    if (idx >= 0) user.paymentMethods[idx] = method;
    else user.paymentMethods.push(method);
  });

  const store = await readStore();
  return NextResponse.json({
    user: publicUser(store.users.find((u) => u.id === targetId)!, true),
  });
}

export async function DELETE(req: Request) {
  const auth = await requireUser(["seller", "admin"]);
  if (auth.error || !auth.user)
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json();
  const methodId = String(body.id || "");
  const targetId =
    auth.user.role === "admin" && body.sellerId
      ? Number(body.sellerId)
      : auth.user.id;

  await updateStore((data) => {
    const user = data.users.find((u) => u.id === targetId);
    if (!user) throw new Error("Seller not found");
    user.paymentMethods = (user.paymentMethods || []).filter((m) => m.id !== methodId);
  });

  return NextResponse.json({ ok: true });
}
