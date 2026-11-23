import { NextResponse } from "next/server";
import { readStore } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { buildInbox } from "@/lib/chat-inbox";

/** Conversation list: seller chats, deal rooms, and Escrow pinned last. */
export async function GET(req: Request) {
  const email = new URL(req.url).searchParams.get("email") || "";
  const user = await getCurrentUser();
  if (!user && !email.trim()) {
    return NextResponse.json({ chats: [] });
  }
  const store = await readStore();
  return NextResponse.json({ chats: buildInbox(store, user, email) });
}
