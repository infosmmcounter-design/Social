"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "./AuthProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { useLang } from "./LanguageProvider";

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (opts: {
        client_id: string;
        callback: (resp: { credential?: string }) => void;
      }) => void;
      prompt: () => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleAccounts;
  }
}

function loadScript() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>("script[data-sf-gsi]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google script failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.dataset.sfGsi = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed"));
    document.head.appendChild(script);
  });
}

export function GoogleSignIn() {
  const { setUser } = useAuth();
  const { locale } = useLang();
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ enabled: boolean; clientId: string }>("/api/auth/google")
      .then((d) => {
        if (d.enabled && d.clientId) setClientId(d.clientId);
      })
      .catch(() => undefined);
  }, []);

  async function start() {
    setErr("");
    if (!clientId) {
      setErr("Google sign-in is not connected yet. Use email and password, or add GOOGLE_CLIENT_ID on the server.");
      return;
    }
    setBusy(true);
    try {
      await loadScript();
      if (!window.google?.accounts?.id) throw new Error("Google sign-in did not load.");
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp) => {
          try {
            if (!resp.credential) throw new Error("Google did not finish sign-in.");
            const d = await api<{ user: AuthUser }>("/api/auth/google", {
              method: "POST",
              json: { credential: resp.credential },
            });
            setUser(d.user);
            const next =
              d.user.role === "admin"
                ? "/admin"
                : d.user.role === "seller"
                  ? "/dashboard/seller"
                  : "/dashboard/buyer";
            router.push(withLocalePrefix(next, locale));
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Google sign-in failed");
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.prompt();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div style={{ marginTop: 12 }}>
      <button className="btn o google-btn" type="button" onClick={start} disabled={busy}>
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      {err ? <p className="err">{err}</p> : null}
    </div>
  );
}
