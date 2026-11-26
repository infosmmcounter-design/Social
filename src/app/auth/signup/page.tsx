"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";
import { GoogleSignIn } from "@/components/GoogleSignIn";

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
  const [showEmail, setShowEmail] = useState(false);
  const { setUser } = useAuth();
  const { locale, t } = useLang();
  const router = useRouter();
  const usernameTouched = useRef(false);

  useEffect(() => {
    if (usernameTouched.current || !name.trim()) return;
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
      <section className="sec auth-shell">
        <div className="auth-panel">
          <p className="auth-kicker">SocialsFlip</p>
          <h1>{t("auth.backupTitle")}</h1>
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
              className="btn buy-go"
              type="button"
              disabled={!saved}
              style={{ width: "100%" }}
              onClick={() => router.push(withLocalePrefix("/account?welcome=1", locale))}
            >
              {t("auth.continue")}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="sec auth-shell">
      <div className="auth-panel">
        <p className="auth-kicker">SocialsFlip · Escrow marketplace</p>
        <h1>{t("nav.signup")}</h1>
        <p className="auth-lead">
          One tap with Google. We create your name and username — you can edit
          them later on your profile.
        </p>

        <div className="auth-google-hero">
          <GoogleSignIn nextPath="/account?welcome=1" />
        </div>

        <button
          type="button"
          className="auth-email-toggle"
          onClick={() => setShowEmail((v) => !v)}
        >
          {showEmail ? "Hide email signup" : "Or create with email"}
        </button>

        {showEmail ? (
          <form className="auth-email-form" onSubmit={submit}>
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
              />
              <button
                className="btn o"
                type="button"
                onClick={() => {
                  usernameTouched.current = true;
                  setUsername(suggestUsername(name || "user"));
                }}
              >
                {t("auth.generateUser")}
              </button>
            </div>
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
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
            />
            {err ? <p className="err">{err}</p> : null}
            <button className="btn" type="submit" style={{ width: "100%", marginTop: 12 }}>
              Create account
            </button>
          </form>
        ) : null}

        <p className="auth-foot">
          Already have an account? <Link href="/auth/login">Log in</Link>
        </p>
      </div>
    </section>
  );
}
