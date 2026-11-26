"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { GoogleSignIn } from "@/components/GoogleSignIn";
import { EmailProviders } from "@/components/EmailProviders";

function suggestUsername(name: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 12) || "user";
  const n = 1000 + Math.floor(Math.random() * 9000);
  return `${base}${n}`.slice(0, 20);
}

export default function SignupPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [err, setErr] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [googleOn, setGoogleOn] = useState(true);
  const { setUser } = useAuth();
  const { locale, t } = useLang();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);
  const usernameTouched = useRef(false);

  useEffect(() => {
    if (usernameTouched.current) return;
    if (!name.trim()) return;
    setUsername(suggestUsername(name));
  }, [name]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const d = await api<{ user: AuthUser; backupCode: string }>("/api/auth/signup", {
        method: "POST",
        json: { name, username, email, password, country },
      });
      setUser(d.user);
      setBackupCode(d.backupCode);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Signup failed");
    }
  }

  if (backupCode) {
    return (
      <section className="sec" style={{ maxWidth: 480 }}>
        <h1 style={{ fontSize: "2rem" }}>{t("auth.backupTitle")}</h1>
        <p className="mut">{t("auth.backupHint")}</p>
        <p className="backup-code" aria-label="Backup code">
          {backupCode}
        </p>
        <button
          className="btn o"
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(backupCode);
              setCopied(true);
            } catch {
              setCopied(false);
            }
          }}
        >
          {copied ? "Copied" : "Copy code"}
        </button>
        <label className="row" style={{ marginTop: 16 }}>
          <input
            type="checkbox"
            checked={saved}
            onChange={(e) => setSaved(e.target.checked)}
            style={{ width: "auto" }}
          />
          {t("auth.savedCode")}
        </label>
        <div style={{ marginTop: 14 }}>
          <button
            className="btn"
            type="button"
            disabled={!saved}
            onClick={() => router.push(withLocalePrefix("/account?welcome=1", locale))}
          >
            {t("auth.continue")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="sec auth-page" style={{ maxWidth: 440 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("nav.signup")}</h1>
      <p className="mut">
        Use Google in one tap, or sign up with Gmail, Yahoo, Outlook, or any email.
        Your name and username are filled for you — you can edit them later on your profile.
      </p>

      {googleOn ? (
        <div className="card auth-card" style={{ marginBottom: 12 }}>
          <GoogleSignIn
            nextPath="/account?welcome=1"
            onUnavailable={() => setGoogleOn(false)}
          />
          <div className="auth-or">
            <span>or continue with email</span>
          </div>
        </div>
      ) : null}

      <form className="card auth-card" onSubmit={submit}>
        <h2 style={{ marginTop: 0, fontSize: "1.1rem" }}>Continue with email</h2>
        <p className="sm mut" style={{ marginTop: 0 }}>
          Works with Gmail, Yahoo, Outlook, iCloud, Proton, or any other inbox.
        </p>
        <EmailProviders onPick={() => emailRef.current?.focus()} />

        <label>Full name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
          autoComplete="name"
        />

        <label>{t("auth.username")}</label>
        <div className="row">
          <input
            value={username}
            onChange={(e) => {
              usernameTouched.current = true;
              setUsername(e.target.value.toLowerCase());
            }}
            required
            minLength={3}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            aria-label={t("auth.username")}
          />
          <button
            className="btn o"
            type="button"
            onClick={() => {
              usernameTouched.current = true;
              setUsername(suggestUsername(name || email || "user"));
            }}
          >
            {t("auth.generateUser")}
          </button>
        </div>

        <label>Email</label>
        <input
          ref={emailRef}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com, you@yahoo.com, …"
          autoComplete="email"
        />
        <p className="sm mut">Optional for now. Add any inbox so you can recover this account later.</p>

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
        />

        <label>Country</label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="Optional"
          autoComplete="country-name"
        />

        {err ? <p className="err">{err}</p> : null}
        <div style={{ marginTop: 14 }}>
          <button className="btn buy-go" type="submit" style={{ width: "100%" }}>
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
