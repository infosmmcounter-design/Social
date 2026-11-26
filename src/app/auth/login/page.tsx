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
    <section className="sec" style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("nav.login")}</h1>
      <div className="card" style={{ marginBottom: 12 }}>
        <GoogleSignIn />
      </div>
      <form className="card" onSubmit={submit}>
        <label>{t("auth.loginId")}</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label={t("auth.loginId")}
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {err ? <p className="err">{err}</p> : null}
        <div style={{ marginTop: 14 }}>
          <button className="btn" type="submit">
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
