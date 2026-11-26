"use client";

import { useState } from "react";
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
  const [verifyCode, setVerifyCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const { setUser } = useAuth();
  const { locale, t } = useLang();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const d = await api<{ user: AuthUser; backupCode: string; verifyCode?: string }>("/api/auth/signup", {
        method: "POST",
        json: { name, username, email, password, country },
      });
      setUser(d.user);
      setBackupCode(d.backupCode);
      setVerifyCode(d.verifyCode || "");
      setVerified(!d.verifyCode);
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
        {verifyCode && !verified ? (
          <div className="card" style={{ marginTop: 16 }}>
            <h2 style={{ marginTop: 0, fontSize: "1.2rem" }}>Verify your email</h2>
            <p className="sm mut">
              Email delivery is not connected on this server, so the code is shown here and nothing waits on an inbox. Enter it, or skip and keep using the account.
            </p>
            <p className="backup-code">{verifyCode}</p>
            <label>6-digit code</label>
            <input
              inputMode="numeric"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              maxLength={6}
            />
            <div className="row" style={{ marginTop: 10 }}>
              <button
                className="btn"
                type="button"
                onClick={async () => {
                  setErr("");
                  try {
                    const d = await api<{ user: AuthUser }>("/api/auth/verify", {
                      method: "POST",
                      json: { code: enteredCode.trim() },
                    });
                    setUser(d.user);
                    setVerified(true);
                  } catch (e) {
                    setErr(e instanceof Error ? e.message : "Could not verify");
                  }
                }}
              >
                Verify email
              </button>
              <button className="btn o" type="button" onClick={() => setVerified(true)}>
                Skip for now
              </button>
            </div>
            {err ? <p className="err">{err}</p> : null}
          </div>
        ) : verified && verifyCode ? (
          <p className="okmsg">Email verified.</p>
        ) : null}
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
            onClick={() => router.push(withLocalePrefix("/dashboard/buyer", locale))}
          >
            {t("auth.continue")}
          </button>
        </div>
      </section>
    );
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
        <label>{t("auth.username")}</label>
        <div className="row">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
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
            onClick={() => setUsername(suggestUsername(name))}
          >
            {t("auth.generateUser")}
          </button>
        </div>
        <label>{t("auth.emailOptional")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
        <GoogleSignIn />
      </form>
      <p className="sm mut" style={{ marginTop: 12 }}>
        Already have an account? <Link href="/auth/login">Log in</Link>
      </p>
    </section>
  );
}
