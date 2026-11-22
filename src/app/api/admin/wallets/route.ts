import { NextResponse } from "next/server";
import { readStore, updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser(["admin"]);
  if (auth.error) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const store = await readStore();
  const users = store.users
    .filter((u) => u.role !== "admin")
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      country: u.country,
      verified: u.verified,
      active: u.active,
      walletBalance: Number(u.walletBalance || 0),
      joinedAt: u.joinedAt,
    }))
    .sort((a, b) => b.id - a.id);
  const deposits = [...(store.walletDeposits || [])].sort((a, b) => b.id - a.id);
  return NextResponse.json({ users, deposits });
}

export async function POST(req: Request) {
  const auth = await requireUser(["admin"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await req.json();
  const action = String(body.action || "");
  const userId = Number(body.userId);
  const amount = Number(body.amount);

  await updateStore((data) => {
    if (!data.walletDeposits) data.walletDeposits = [];
    if (action === "approve" || action === "reject") {
      const dep = data.walletDeposits.find((d) => d.id === Number(body.depositId));
      if (!dep || dep.status !== "pending") return;
      dep.status = action === "approve" ? "approved" : "rejected";
      if (action === "approve") {
        const u = data.users.find((x) => x.id === dep.userId);
        if (u) u.walletBalance = Number(u.walletBalance || 0) + dep.amount;
      }
      return;
    }
    const u = data.users.find((x) => x.id === userId);
    if (!u || u.role === "admin") return;
    if (action === "set" && Number.isFinite(amount) && amount >= 0) {
      u.walletBalance = Math.round(amount * 100) / 100;
    }
    if (action === "credit" && Number.isFinite(amount) && amount !== 0) {
      u.walletBalance = Math.round((Number(u.walletBalance || 0) + amount) * 100) / 100;
    }
    if (action === "verify") u.verified = true;
    if (action === "unverify") u.verified = false;
    if (action === "profile") {
      if (body.name) u.name = String(body.name).trim().slice(0, 80);
      if (body.country !== undefined) u.country = String(body.country).slice(0, 80);
      if (body.bio !== undefined) u.bio = String(body.bio).slice(0, 500);
    }
  });

  return NextResponse.json({ ok: true });
}
