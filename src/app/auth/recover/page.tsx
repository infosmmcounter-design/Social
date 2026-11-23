"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth, type AuthUser } from "@/components/AuthProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";
import { withLocalePrefix } from "@/lib/i18n/locale-path";

export default function RecoverPage() {
  const [login, setLogin] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const { setUser } = useAuth();
  const { locale, t } = useLang();
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const d = await api<{ user: AuthUser }>("/api/auth/recover", {
        method: "POST",
        json: { login, backupCode, password },
      });
      setUser(d.user);
      const dest =
        d.user.role === "admin"
          ? "/admin"
          : d.user.role === "seller"
            ? "/dashboard/seller"
            : "/account";
      router.push(withLocalePrefix(dest, locale));
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Recovery failed");
    }
  }

  return (
    <section className="sec" style={{ maxWidth: 460 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("auth.recoverTitle")}</h1>
      <p className="mut">{t("auth.recoverHint")}</p>
      <form className="card" onSubmit={submit}>
        <label>{t("auth.loginId")}</label>
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          required
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
        />
        <label>Backup code</label>
        <input
          value={backupCode}
          onChange={(e) => setBackupCode(e.target.value)}
          required
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="SF-XXXX-XXXX-XXXX"
        />
        <label>New password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
        />
        {err ? <p className="err">{err}</p> : null}
        <div style={{ marginTop: 14 }}>
          <button className="btn" type="submit">
            {t("auth.continue")}
          </button>
        </div>
      </form>
      <p className="sm mut" style={{ marginTop: 12 }}>
        <Link href="/auth/login">{t("nav.login")}</Link>
      </p>
    </section>
  );
}
