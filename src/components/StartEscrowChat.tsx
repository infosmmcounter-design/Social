"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { useLang } from "./LanguageProvider";

/** Buyer → Escrow only support chat (from Help & Support). */
export function StartEscrowChat({
  compact,
  autoOpen,
}: {
  compact?: boolean;
  autoOpen?: boolean;
}) {
  const { user } = useAuth();
  const { t } = useLang();
  const router = useRouter();
  const [open, setOpen] = useState(!!autoOpen);
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
          kind: "escrow",
          name,
          email,
          message:
            message.trim() ||
            "Hi Escrow — I need help with a SocialsFlip deal / payment.",
          subject: "Help & Support — Chat with Escrow",
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
        className={compact ? "btn s" : "btn escrow-cta"}
        onClick={() => setOpen(true)}
      >
        {t("help.chatEscrow")}
      </button>
    );
  }

  return (
    <div className="card f escrow-chat-card" style={{ marginTop: compact ? 0 : 10 }}>
      <h3 style={{ marginTop: 0 }}>{t("help.chatEscrow")}</h3>
      <p className="sm mut">{t("help.chatEscrowSub")}</p>
      <label>{t("listing.yourName")}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <label>{t("listing.yourEmail")}</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <label>{t("help.firstMessage")}</label>
      <textarea
        rows={3}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("help.messagePlaceholder")}
      />
      {err ? <p className="err">{err}</p> : null}
      <div className="row" style={{ marginTop: 10 }}>
        <button className="btn" type="button" disabled={busy} onClick={start}>
          {busy ? "…" : t("help.startEscrowChat")}
        </button>
        <button className="btn o" type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </div>
    </div>
  );
}
