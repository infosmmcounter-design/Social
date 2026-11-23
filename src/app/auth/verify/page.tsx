"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { api } from "@/lib/api";
import { LocaleLink as Link } from "@/components/LocaleLink";
import { useLang } from "@/components/LanguageProvider";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const { t } = useLang();
  const [state, setState] = useState<"wait" | "ok" | "bad">("wait");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) {
      setState("bad");
      return;
    }
    let live = true;
    api("/api/auth/verify", { method: "POST", json: { token } })
      .then(() => {
        if (live) setState("ok");
      })
      .catch((e) => {
        if (!live) return;
        setErr(e instanceof Error ? e.message : "");
        setState("bad");
      });
    return () => {
      live = false;
    };
  }, [token]);

  return (
    <section className="sec" style={{ maxWidth: 460 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("auth.verifyTitle")}</h1>
      {state === "wait" ? <p className="mut">…</p> : null}
      {state === "ok" ? <p className="okmsg">{t("auth.verifyOk")}</p> : null}
      {state === "bad" ? (
        <p className="err">{err || t("auth.verifyBad")}</p>
      ) : null}
      <p style={{ marginTop: 16 }}>
        <Link className="btn" href="/account">
          {t("nav.account")}
        </Link>
      </p>
    </section>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<section className="sec">…</section>}>
      <VerifyInner />
    </Suspense>
  );
}
