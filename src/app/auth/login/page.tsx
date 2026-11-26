"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { EmailProviders } from "@/components/EmailProviders";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [googleOn, setGoogleOn] = useState(true);
  const { setUser } = useAuth();
  const { locale, t } = useLang();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const d = await api<{ user: AuthUser }>("/api/auth/login", {
        method: "POST",
        json: { email, password },
      });
      setUser(d.user);
      if (d.user.role === "admin")
        router.push(withLocalePrefix("/admin", locale));
      else if (d.user.role === "seller")
        router.push(withLocalePrefix("/dashboard/seller", locale));
      else router.push(withLocalePrefix("/dashboard/buyer", locale));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Login failed");
    }
  }

  return (
    <section className="sec auth-page" style={{ maxWidth: 440 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("nav.login")}</h1>
      <p className="mut">
        Continue with Google, or log in with your username or any email —
        Gmail, Yahoo, Outlook, and more.
      </p>

      {googleOn ? (
        <div className="card auth-card" style={{ marginBottom: 12 }}>
          <GoogleSignIn onUnavailable={() => setGoogleOn(false)} />
          <div className="auth-or">
            <span>or use email</span>
          </div>
        </div>
      ) : null}

      <form className="card auth-card" onSubmit={submit}>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Email or username</h2>
        <EmailProviders onPick={() => emailRef.current?.focus()} />
        <label>{t("auth.loginId")}</label>
        <input
          ref={emailRef}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          placeholder="username, you@gmail.com, you@yahoo.com…"
          aria-label={t("auth.loginId")}
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
        <div style={{ marginTop: 14 }}>
          <button className="btn buy-go" type="submit" style={{ width: "100%" }}>
            {t("nav.login")}
          </button>
        </div>
      </form>
      <p className="sm mut" style={{ marginTop: 12 }}>
        <Link href="/auth/recover">{t("auth.recoverLink")}</Link>
      </p>
      <p className="sm mut" style={{ marginTop: 12 }}>
        New here? <Link href="/auth/signup">Create an account</Link>. Guests can
        also checkout without signing up.
      </p>
    </section>
  );
}
