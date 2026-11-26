"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { useLang } from "./LanguageProvider";
import { saveGuestEmail } from "@/lib/guest-email";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

/** Opens Escrow chat on its own page. Guests fill name and email there. */
export function StartEscrowChat() {
  const { t, locale } = useLang();
  const { user } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function open() {
    if (!user?.email) {
      router.push(withLocalePrefix("/chats?start=escrow", locale));
      return;
    }
    setBusy(true);
    try {
      saveGuestEmail(user.email);
      const res = await api<{ inquiry: { id: number } }>("/api/inquiries", {
        method: "POST",
        json: {
          kind: "escrow",
          name: user.name || "Guest",
          email: user.email,
          message: "",
          subject: "Chat with Escrow",
        },
      });
      router.push(withLocalePrefix(`/chat/${res.inquiry.id}`, locale));
    } catch {
      router.push(withLocalePrefix("/chats?start=escrow", locale));
    }
  }

  return (
    <button
      type="button"
      className="btn escrow-cta"
      disabled={busy}
      onClick={open}
    >
      {busy ? "…" : t("help.chatEscrow")}
    </button>
  );
}
