"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "./AuthProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { useLang } from "./LanguageProvider";
import { GoogleIcon } from "./GoogleIcon";

type GsiNotification = {
  isNotDisplayed?: () => boolean;
  isSkippedMoment?: () => boolean;
  isDismissedMoment?: () => boolean;
  getNotDisplayedReason?: () => string;
  getSkippedReason?: () => string;
};

type GoogleAccounts = {
  accounts: {
    id: {
      initialize: (opts: {
        client_id: string;
        callback: (resp: { credential?: string }) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        use_fedcm_for_prompt?: boolean;
        context?: "signin" | "signup" | "use";
      }) => void;
      renderButton: (
        parent: HTMLElement,
        options: {
          type?: string;
          theme?: string;
          size?: string;
          text?: string;
          shape?: string;
          logo_alignment?: string;
          width?: number | string;
        }
      ) => void;
      prompt: (cb?: (notification: GsiNotification) => void) => void;
      cancel: () => void;
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
  const hostRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState("");
  const [checked, setChecked] = useState(false);
  const [ready, setReady] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const nextPathRef = useRef(nextPath);
  nextPathRef.current = nextPath;

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

  useEffect(() => {
    if (!clientId || !hostRef.current) return;
    let cancelled = false;

    async function mountButton() {
      setErr("");
      setReady(false);
      try {
        await loadScript();
        if (cancelled || !hostRef.current || !window.google?.accounts?.id) {
          throw new Error("Google sign-in did not load.");
        }

        const finish = async (user: AuthUser, isNew: boolean) => {
          setUser(user);
          const fallback =
            user.role === "admin"
              ? "/admin"
              : isNew
                ? "/account?welcome=1"
                : user.role === "seller"
                  ? "/dashboard/seller"
                  : "/dashboard/buyer";
          router.push(withLocalePrefix(nextPathRef.current || fallback, locale));
        };

        window.google.accounts.id.initialize({
          client_id: clientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: true,
          context: "signin",
          callback: async (resp) => {
            setBusy(true);
            setErr("");
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

        const width = Math.max(
          240,
          Math.min(400, Math.floor(hostRef.current.clientWidth || 320))
        );
        hostRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(hostRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width,
        });
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) {
          setErr(e instanceof Error ? e.message : "Google sign-in failed");
        }
      }
    }

    mountButton();
    return () => {
      cancelled = true;
      try {
        window.google?.accounts?.id?.cancel();
      } catch {
        /* ignore */
      }
    };
  }, [clientId, locale, router, setUser]);

  if (!checked) {
    return (
      <div className="auth-google-slot">
        <div className="google-btn-frame google-btn-frame-loading">
          <span className="google-btn-ic" aria-hidden>
            <GoogleIcon size={22} />
          </span>
          <span>Loading Google…</span>
        </div>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="auth-google-slot">
        <div className="google-btn-frame google-btn-frame-loading">
          <span className="google-btn-ic" aria-hidden>
            <GoogleIcon size={22} />
          </span>
          <span>Continue with Google</span>
        </div>
        <p className="err auth-google-err">
          Admin must paste the Google Client ID in Admin → Settings.
        </p>
      </div>
    );
  }

  return (
    <div className="auth-google-slot">
      <div className="google-btn-frame">
        {!ready ? (
          <div className="google-btn-frame-loading" aria-hidden>
            <span className="google-btn-ic">
              <GoogleIcon size={22} />
            </span>
            <span>Continue with Google</span>
          </div>
        ) : null}
        <div
          ref={hostRef}
          className={`google-gsi-host${ready ? " on" : ""}`}
          aria-label="Continue with Google"
        />
      </div>
      {busy ? <p className="sm mut auth-google-busy">Signing you in…</p> : null}
      {err ? <p className="err auth-google-err">{err}</p> : null}
    </div>
  );
}
