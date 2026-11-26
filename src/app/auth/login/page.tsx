"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { GoogleSignIn } from "@/components/GoogleSignIn";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const { setUser } = useAuth();
  const { locale, t } = useLang();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const d = await api<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      setUser(d.user);
      if (d.user.role === "admin") router.push(withLocalePrefix("/admin", locale));
      else if (d.user.role === "seller")
        router.push(withLocalePrefix("/dashboard/seller", locale));
      else router.push(withLocalePrefix("/dashboard/buyer", locale));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    }
  }

  return (
    <section className="sec auth-shell">
      <div className="auth-panel">
        <p className="auth-kicker">SocialsFlip · Escrow marketplace</p>
        <h1>{t("nav.login")}</h1>
        <p className="auth-lead">Continue with Google to open your account in one tap.</p>

        <div className="auth-google-hero">
          <GoogleSignIn />
        </div>

        <button
          type="button"
          className="auth-email-toggle"
          onClick={() => setShowEmail((v) => !v)}
        >
          {showEmail ? "Hide email login" : "Or log in with email"}
        </button>

        {showEmail ? (
          <form className="auth-email-form" onSubmit={submit}>
            <label>{t("auth.loginId")}</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Username or email"
              autoComplete="username"
            />
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            {err ? <p className="err">{err}</p> : null}
            <button className="btn" type="submit" style={{ width: "100%", marginTop: 12 }}>
              {t("nav.login")}
            </button>
          </form>
        ) : null}

        <p className="auth-foot">
          <Link href="/auth/recover">{t("auth.recoverLink")}</Link>
          <br />
          New here? <Link href="/auth/signup">Create an account</Link>
        </p>
      </div>
    </section>
  );
}
