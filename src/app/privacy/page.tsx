"use client";

import { useLang } from "@/components/LanguageProvider";
import { LocaleLink as Link } from "@/components/LocaleLink";

export default function PrivacyPage() {
  const { t } = useLang();

  return (
    <section className="sec legal-page" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: "2rem" }}>{t("privacy.title")}</h1>
      <p className="mut">{t("privacy.updated")}</p>

      <h2>{t("privacy.s1Title")}</h2>
      <p>{t("privacy.s1Body")}</p>

      <h2>{t("privacy.s2Title")}</h2>
      <p>{t("privacy.s2Body")}</p>

      <h2>{t("privacy.s3Title")}</h2>
      <p>{t("privacy.s3Body")}</p>

      <h2>{t("privacy.s4Title")}</h2>
      <p>{t("privacy.s4Body")}</p>

      <h2>{t("privacy.s5Title")}</h2>
      <p>{t("privacy.s5Body")}</p>

      <h2>{t("privacy.s6Title")}</h2>
      <p>{t("privacy.s6Body")}</p>

      <p className="sm mut" style={{ marginTop: 24 }}>
        <Link href="/help">{t("nav.help")}</Link>
        {" · "}
        <a href="mailto:privacy@socialsflip.com">privacy@socialsflip.com</a>
      </p>
    </section>
  );
}
