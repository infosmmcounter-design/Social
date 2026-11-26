"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthProvider";

export const CHATS_REFRESH_EVENT = "sf-chats-refresh";

export function useUnreadChats() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setCount(0);
      return;
    }
    let stop = false;
    async function load() {
      try {
        const d = await api<{ chats: { unread?: number }[] }>("/api/chats");
        if (stop) return;
        const n = (d.chats || []).reduce((sum, row) => sum + (row.unread || 0), 0);
        setCount(n);
      } catch {
        if (!stop) setCount(0);
      }
    }
    load();
    const timer = window.setInterval(load, 12000);
    window.addEventListener(CHATS_REFRESH_EVENT, load);
    return () => {
      stop = true;
      window.clearInterval(timer);
      window.removeEventListener(CHATS_REFRESH_EVENT, load);
    };
  }, [user]);

  return count;
}

export function ChatCountBadge({ count }: { count: number }) {
  if (!count) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span className="msg-badge" aria-label={`${label} unread`}>
      {label}
    </span>
  );
}
