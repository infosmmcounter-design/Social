"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [err, setErr] = useState("");
  const { setUser } = useAuth();
  const { locale, t } = useLang();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const d = await api<{ user: AuthUser }>("/api/auth/signup", {
        method: "POST",
        json: { name, email, password, country },
      });
      setUser(d.user);
      router.push(withLocalePrefix("/dashboard/buyer", locale));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Signup failed");
    }
  }

  return (
    <section className="sec" style={{ maxWidth: 420 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("nav.signup")}</h1>
      <p className="mut">
        Create a buyer account. To sell, submit an application — approval is up
        to admin.
      </p>
      <form className="card" onSubmit={submit}>
        <label>Full name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        <label>Country</label>
        <input value={country} onChange={(e) => setCountry(e.target.value)} />
        {err ? <p className="err">{err}</p> : null}
        <div style={{ marginTop: 14 }}>
          <button className="btn" type="submit">
            Create account
          </button>
        </div>
      </form>
      <p className="sm mut" style={{ marginTop: 12 }}>
        Already have an account? <Link href="/auth/login">Log in</Link>
      </p>
    </section>
  );
}
