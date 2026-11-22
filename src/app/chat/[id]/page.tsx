"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { VerifiedTick } from "@/components/VerifiedTick";
import { money } from "@/lib/constants";

type Msg = { id: number; from: string; text: string; createdAt: string };

function ChatInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const emailQ = search.get("email") || "";
  const { user } = useAuth();
  const [inquiry, setInquiry] = useState<{
    id: number;
    kind?: "seller" | "escrow";
    subject: string;
    buyerName: string;
    buyerEmail: string;
    sellerId: number;
    listingId: number | null;
    status: string;
    msgs: Msg[];
  } | null>(null);
  const [seller, setSeller] = useState<{
    id: number;
    name: string;
    verified?: boolean;
    official?: boolean;
    dummy?: boolean;
    avatarUrl?: string;
  } | null>(null);
  const [listing, setListing] = useState<{
    id: number;
    title: string;
    price: number;
  } | null>(null);
  const [text, setText] = useState("");
  const [asRole, setAsRole] = useState<"admin" | "seller">("admin");
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const q = emailQ ? `&email=${encodeURIComponent(emailQ)}` : "";
    const d = await api<{
      inquiry: NonNullable<typeof inquiry>;
      seller: NonNullable<typeof seller> | null;
      listing: NonNullable<typeof listing> | null;
    }>(`/api/inquiries?id=${id}${q}`);
    setInquiry(d.inquiry);
    setSeller(d.seller);
    setListing(d.listing);
  }, [id, emailQ]);

  useEffect(() => {
    load().catch((e) => setErr(e instanceof Error ? e.message : "Failed"));
  }, [load]);

  useEffect(() => {
    const t = setInterval(() => load().catch(() => undefined), 8000);
    return () => clearInterval(t);
  }, [load]);

  const isEscrow = (inquiry?.kind || "seller") === "escrow";
  const sellerName = isEscrow ? "SocialsFlip Escrow" : seller?.name || "Seller";
  const isBuyerParty =
    !!inquiry &&
    ((user &&
      user.email.toLowerCase() === inquiry.buyerEmail.toLowerCase()) ||
      (!!emailQ &&
        emailQ.toLowerCase() === inquiry.buyerEmail.toLowerCase()));
  const isSellerParty =
    !isEscrow && !!user && !!inquiry && user.id === inquiry.sellerId;
  const isAdmin = user?.role === "admin";
  const canSend = isBuyerParty || isSellerParty || isAdmin;

  async function send() {
    if (!text.trim()) return;
    setErr("");
    try {
      await api(`/api/inquiries/${id}/messages`, {
        method: "POST",
        json: {
          text,
          asRole: isAdmin ? (isEscrow ? "admin" : asRole) : undefined,
          email: emailQ || inquiry?.buyerEmail,
        },
      });
      setText("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    }
  }

  function roleLabel(from: string) {
    if (from === "seller") return sellerName;
    if (from === "admin") return "Escrow";
    if (from === "buyer") return inquiry?.buyerName || "Buyer";
    return from;
  }

  if (!inquiry) {
    return <p className="sec mut">{err || "Loading chat…"}</p>;
  }

  return (
    <section className="sec" style={{ maxWidth: 720 }}>
      <Link className="mut sm" href="/chats">
        ← All chats
      </Link>
      <div
        className="row"
        style={{ marginTop: 10, gap: 12, alignItems: "center" }}
      >
        {seller?.avatarUrl && !isEscrow ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={seller.avatarUrl}
            alt=""
            style={{ width: 48, height: 48, borderRadius: "50%" }}
          />
        ) : isEscrow ? (
          <span
            className="pill g"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
            }}
          >
            SF
          </span>
        ) : null}
        <div>
          <h1 style={{ fontSize: "1.5rem", margin: 0 }}>
            {isEscrow ? "Chat with Escrow" : `Chat with ${sellerName}`}
            {seller?.verified && !isEscrow ? <VerifiedTick size={18} /> : null}
          </h1>
          <p className="sm mut" style={{ margin: 0 }}>
            {inquiry.subject}
            {isAdmin && seller?.dummy ? " · (dummy — reply as seller)" : ""}
          </p>
        </div>
      </div>

      {listing ? (
        <div className="note sm" style={{ marginTop: 12 }}>
          About listing:{" "}
          <Link href={`/listing/${listing.id}`} style={{ color: "var(--a)" }}>
            {listing.title}
          </Link>{" "}
          · {money(listing.price)}
          <div style={{ marginTop: 8 }}>
            <Link className="btn s" href={`/listing/${listing.id}`}>
              Start escrow deal
            </Link>
          </div>
        </div>
      ) : null}

      <p className="sm mut">
        {isEscrow ? (
          <>
            Direct support: <b>{inquiry.buyerName}</b> (buyer) · <b>Escrow</b>{" "}
            (SocialsFlip admin). No seller in this room.
          </>
        ) : (
          <>
            3-way room: <b>{inquiry.buyerName}</b> (buyer) · <b>{sellerName}</b>{" "}
            (seller) · <b>Escrow</b> (admin). No payment required to chat.
          </>
        )}
      </p>

      {err ? <p className="err">{err}</p> : null}

      <div className="chat" role="log" style={{ marginTop: 12 }}>
        {inquiry.msgs.map((m) => (
          <div key={m.id} className={`m ${m.from}`}>
            <small>
              {roleLabel(m.from)} · {new Date(m.createdAt).toLocaleString()}
            </small>
            {m.text}
          </div>
        ))}
      </div>

      {canSend ? (
        <div className="row" style={{ marginTop: 8, flexWrap: "nowrap" }}>
          {isAdmin && !isEscrow ? (
            <select
              value={asRole}
              onChange={(e) =>
                setAsRole(e.target.value as "admin" | "seller")
              }
              style={{ width: "auto", minWidth: 160 }}
              aria-label="Reply as"
            >
              <option value="admin">As Escrow</option>
              <option value="seller">As {sellerName}</option>
            </select>
          ) : null}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              isEscrow
                ? isBuyerParty
                  ? "Message Escrow…"
                  : "Reply as Escrow…"
                : isBuyerParty
                  ? `Message ${sellerName}`
                  : isSellerParty
                    ? `Reply to ${inquiry.buyerName}`
                    : "Message…"
            }
            aria-label="Message"
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />
          <button className="btn" onClick={send}>
            Send
          </button>
        </div>
      ) : (
        <p className="mut sm" style={{ marginTop: 10 }}>
          Open this chat with the buyer email used to start it, or log in.
        </p>
      )}

      {!listing && seller && !isEscrow ? (
        <p className="sm" style={{ marginTop: 16 }}>
          Ready to buy? Browse{" "}
          <Link href={`/seller/${seller.id}`} style={{ color: "var(--a)" }}>
            {sellerName}&apos;s listings
          </Link>
          .
        </p>
      ) : null}
      {isEscrow ? (
        <p className="sm mut" style={{ marginTop: 16 }}>
          Need a seller chat instead? Open a listing and tap Chat with seller, or
          go to <Link href="/help">Help & Support</Link>.
        </p>
      ) : null}
    </section>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<p className="sec mut">Loading…</p>}>
      <ChatInner />
    </Suspense>
  );
}
