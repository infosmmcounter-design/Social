"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { saveGuestEmail } from "@/lib/guest-email";
import { useLang } from "./LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

/** Start a pre-deal chat with a seller. Logged-in users open it in one click. */
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
  const { locale } = useLang();
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

  if (user?.id === sellerId) {
    return null;
  }

  async function start(nextName: string, nextEmail: string, nextMessage: string) {
    setErr("");
    setBusy(true);
    try {
      const mail = nextEmail.trim().toLowerCase();
      saveGuestEmail(mail);
      const res = await api<{ inquiry: { id: number } }>("/api/inquiries", {
        method: "POST",
        json: {
          sellerId,
          listingId: listingId ?? null,
          name: nextName.trim(),
          email: mail,
          message:
            nextMessage.trim() ||
            `Hi ${sellerName}, I would like to ask about this listing before buying.`,
        },
      });
      router.push(
        withLocalePrefix(
          `/chat/${res.inquiry.id}?email=${encodeURIComponent(mail)}`,
          locale
        )
      );
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not open the chat");
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className={compact ? "btn s" : "btn o"}
        disabled={busy}
        onClick={() => {
          if (user?.email) {
            start(user.name, user.email, "");
            return;
          }
          setOpen(true);
        }}
      >
        {busy ? "Opening…" : "Chat with Seller"}
      </button>
    );
  }

  return (
    <div className="card f" style={{ marginTop: compact ? 0 : 10 }}>
      <h3 style={{ marginTop: 0 }}>Chat with Seller</h3>
      <p className="sm mut">
        Opens a room with {sellerName} and Escrow. You can ask questions without buying.
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
        <button
          className="btn"
          type="button"
          disabled={busy || !email.trim() || !name.trim()}
          onClick={() => start(name, email, message)}
        >
          {busy ? "Opening…" : "Open chat"}
        </button>
        <button className="btn o" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
