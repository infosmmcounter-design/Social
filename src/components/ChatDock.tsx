"use client";

import { usePathname } from "next/navigation";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";
import { ChatCountBadge, useUnreadChats } from "./useUnreadChats";
import { stripLocalePrefix } from "@/lib/i18n/locale-path";

/** Gold button that opens the full Chats page, not a small overlay. */
export function ChatDock() {
  const raw = usePathname() || "/";
  const path = stripLocalePrefix(raw).path;
  const { t } = useLang();
  const unread = useUnreadChats();

  if (
    path.startsWith("/admin") ||
    path.startsWith("/chat") ||
    path.startsWith("/deal/")
  ) {
    return null;
  }

  return (
    <Link href="/chats" className="chat-fab" aria-label={t("chat.fab")}>
      <ChatCountBadge count={unread} />
      <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden>
        <path
          d="M4 12a8 8 0 0 1 16 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect x="2.5" y="11" width="4.2" height="7" rx="1.4" fill="currentColor" />
        <rect x="17.3" y="11" width="4.2" height="7" rx="1.4" fill="currentColor" />
        <path
          d="M19.2 18.2v.8a3 3 0 0 1-3 3h-2.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="12" cy="11.2" r="2" fill="currentColor" />
      </svg>
    </Link>
  );
}
