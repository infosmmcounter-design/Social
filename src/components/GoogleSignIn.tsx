"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "./AuthProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { useLang } from "./LanguageProvider";
import { GoogleIcon } from "./GoogleIcon";

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (opts: {
        client_id: string;
        callback: (resp: { credential?: string }) => void;
        ux_mode?: "popup" | "redirect";
        auto_select?: boolean;
      }) => void;
      prompt: (cb?: (n: { isNotDisplayed?: boolean; isSkippedMoment?: boolean }) => void) => void;
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
      existing.addEventListener("error", () => reject(new Error("Google script failed")), {
        once: true,
      });
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

export function GoogleSignIn({ nextPath }: { nextPath?: string }) {
  const { setUser } = useAuth();
  const { locale } = useLang();
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    api<{ enabled: boolean; clientId: string }>("/api/auth/google")
      .then((d) => {
        if (!alive) return;
        if (d.enabled && d.clientId) setClientId(d.clientId);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setChecked(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  async function finish(user: AuthUser, isNew: boolean) {
    setUser(user);
    const fallback =
      user.role === "admin"
        ? "/admin"
        : isNew
          ? "/account?welcome=1"
          : user.role === "seller"
            ? "/dashboard/seller"
            : "/dashboard/buyer";
    router.push(withLocalePrefix(nextPath || fallback, locale));
  }

  async function start() {
    setErr("");
    if (!clientId) {
      setErr(
        "Continue with Google is almost ready. Admin must paste the Google Client ID in Admin → Settings."
      );
      return;
    }
    setBusy(true);
    try {
      await loadScript();
      if (!window.google?.accounts?.id) throw new Error("Google sign-in did not load.");
      window.google.accounts.id.initialize({
        client_id: clientId,
        ux_mode: "popup",
        auto_select: false,
        callback: async (resp) => {
          try {
            if (!resp.credential) throw new Error("Google did not finish sign-in.");
            const d = await api<{ user: AuthUser; isNew?: boolean }>("/api/auth/google", {
              method: "POST",
              json: { credential: resp.credential },
            });
            await finish(d.user, !!d.isNew);
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Google sign-in failed");
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.prompt((notification) => {
        if (notification?.isNotDisplayed || notification?.isSkippedMoment) {
          setBusy(false);
          setErr("Google popup was blocked or closed. Tap Continue with Google again.");
        }
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  return (
    <div className="auth-google-slot">
      <button
        className="btn google-btn"
        type="button"
        onClick={start}
        disabled={busy || !checked}
        aria-label="Continue with Google"
      >
        <span className="google-btn-ic" aria-hidden>
          <GoogleIcon size={22} />
        </span>
        <span className="google-btn-label">
          {busy ? "Opening Google…" : !checked ? "Loading…" : "Continue with Google"}
        </span>
      </button>
      {err ? <p className="err auth-google-err">{err}</p> : null}
    </div>
  );
}
