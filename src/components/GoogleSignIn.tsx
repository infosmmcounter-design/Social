"use client";

import { useEffect, useRef, useState } from "react";
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
      renderButton?: (
        parent: HTMLElement,
        options: Record<string, string | number>
      ) => void;
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

export function GoogleSignIn({
  nextPath,
  onUnavailable,
}: {
  /** Where to send the user after a successful Google sign-in. */
  nextPath?: string;
  /** Called when Google is not connected on the server. */
  onUnavailable?: () => void;
}) {
  const { setUser } = useAuth();
  const { locale } = useLang();
  const router = useRouter();
  const [clientId, setClientId] = useState("");
  const [checked, setChecked] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const unavailable = useRef(onUnavailable);
  unavailable.current = onUnavailable;

  useEffect(() => {
    let alive = true;
    api<{ enabled: boolean; clientId: string }>("/api/auth/google")
      .then((d) => {
        if (!alive) return;
        if (d.enabled && d.clientId) setClientId(d.clientId);
        else unavailable.current?.();
      })
      .catch(() => {
        if (alive) unavailable.current?.();
      })
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
      setErr("Google is not connected on this site yet. Use any email below instead.");
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
          setErr("Google popup was blocked or closed. Try again, or use any email below.");
        }
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Google sign-in failed");
      setBusy(false);
    }
  }

  if (!checked) {
    return (
      <div className="auth-google-slot">
        <button className="btn google-btn" type="button" disabled>
          <span className="google-btn-ic" aria-hidden>
            <GoogleIcon />
          </span>
          Checking Google…
        </button>
      </div>
    );
  }

  if (!clientId) return null;

  return (
    <div className="auth-google-slot">
      <button
        className="btn google-btn"
        type="button"
        onClick={start}
        disabled={busy}
        aria-label="Continue with Google"
      >
        <span className="google-btn-ic" aria-hidden>
          <GoogleIcon />
        </span>
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>
      {err ? <p className="err">{err}</p> : null}
    </div>
  );
}
