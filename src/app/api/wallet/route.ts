import { NextResponse } from "next/server";
import { nextId, readStore, updateStore } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const store = await readStore();
  const me = store.users.find((u) => u.id === auth.user!.id);
  const deposits = (store.walletDeposits || [])
    .filter((d) => d.userId === auth.user!.id)
    .sort((a, b) => b.id - a.id);
  return NextResponse.json({
    balance: Number(me?.walletBalance || 0),
    deposits,
  });
}

/** Ask admin to credit the personal wallet after a USDT transfer. */
export async function POST(req: Request) {
  const auth = await requireUser(["buyer", "seller", "admin"]);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const body = await req.json();
  const amount = Number(body.amount);
  const note = String(body.note || "").trim().slice(0, 300);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 100000) {
    return NextResponse.json({ error: "Enter a valid USDT amount." }, { status: 400 });
  }
  if (note.length < 4) {
    return NextResponse.json(
      { error: "Add the transaction hash or a short note so admin can match the payment." },
      { status: 400 }
    );
  }
  let depositId = 0;
  await updateStore((data) => {
    if (!data.walletDeposits) data.walletDeposits = [];
    depositId = nextId(data);
    data.walletDeposits.push({
      id: depositId,
      userId: auth.user!.id,
      amount,
      note,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
  });
  return NextResponse.json({
    ok: true,
    depositId,
    message: "Deposit sent to admin. Your balance updates after it is approved.",
  });
}
