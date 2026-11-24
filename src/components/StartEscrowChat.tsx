"use client";

import { useLang } from "./LanguageProvider";
import { OPEN_ESCROW_EVENT } from "./ChatDock";

/** Opens the live Escrow chat box. No second picker. */
export function StartEscrowChat() {
  const { t } = useLang();
  return (
    <button
      type="button"
      className="btn escrow-cta"
      onClick={() => window.dispatchEvent(new Event(OPEN_ESCROW_EVENT))}
    >
      {t("help.chatEscrow")}
    </button>
  );
}
