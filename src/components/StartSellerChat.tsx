"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";

/** Start a pre-deal 3-way chat with a named seller (no order needed). */
export function StartSellerChat({
  sellerId,
  sellerName,
  listingId,
  compact,
}: {
  sellerId: number;
  sellerName: string;
  listingId?: number;
  compact?: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  async function start() {
    setErr("");
    setBusy(true);
    try {
      const res = await api<{ inquiry: { id: number } }>("/api/inquiries", {
        method: "POST",
        json: {
          sellerId,
          listingId: listingId ?? null,
          name,
          email,
          message:
            message.trim() ||
            `Hi ${sellerName}, I’d like to ask about your listing before buying.`,
        },
      });
      router.push(
        `/chat/${res.inquiry.id}?email=${encodeURIComponent(email.trim())}`
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className={compact ? "btn s" : "btn o"}
        onClick={() => setOpen(true)}
      >
        Chat with {sellerName}
      </button>
    );
  }

  return (
    <div className="card f" style={{ marginTop: compact ? 0 : 10 }}>
      <h3 style={{ marginTop: 0 }}>Chat with {sellerName}</h3>
      <p className="sm mut">
        Opens a 3-way room with {sellerName} and Escrow — no deal / payment yet.
      </p>
      <label>Your name</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <label>Your email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <label>First message</label>
      <textarea
        rows={2}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={`Hi ${sellerName}…`}
      />
      {err ? <p className="err">{err}</p> : null}
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn" type="button" disabled={busy} onClick={start}>
          {busy ? "Opening…" : `Start chat with ${sellerName}`}
        </button>
        <button className="btn o" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
