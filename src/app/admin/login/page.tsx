"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading, setUser } = useAuth();
  const { locale } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role === "admin") {
      router.replace(withLocalePrefix("/admin", locale));
    }
  }, [user, loading, router, locale]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const d = await api<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      setUser(d.user);
      if (d.user.role !== "admin") {
        setErr("This account is not an admin. Use the storefront login instead.");
        return;
      }
      router.replace(withLocalePrefix("/admin", locale));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <p className="sec mut">Loading…</p>;
  }

  return (
    <section className="sec auth-shell admin-login-shell">
      <div className="auth-panel admin-login-panel">
        <p className="auth-kicker">SocialsFlip · Admin</p>
        <h1>Admin sign-in</h1>
        <p className="auth-lead">
          Secure access to escrow moderation, orders, sellers, and payouts.
        </p>

        <form className="auth-email-form admin-login-form" onSubmit={submit}>
          <label htmlFor="admin-email">Email or username</label>
          <input
            id="admin-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="admin@socialsflip.com"
            autoComplete="username"
          />
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          {err ? <p className="err">{err}</p> : null}
          <button className="btn admin-login-btn" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in to admin"}
          </button>
        </form>

        <div className="admin-login-divider">
          <span>or continue with Google</span>
        </div>
        <div className="auth-google-hero">
          <GoogleSignIn />
        </div>

        <p className="auth-foot">
          <Link href="/">Back to storefront</Link>
          <br />
          Buyer or seller? <Link href="/auth/login">Use regular login</Link>
        </p>
      </div>
    </section>
  );
}
