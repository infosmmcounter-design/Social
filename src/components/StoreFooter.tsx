"use client";

import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";

export function StoreFooter() {
  const { t } = useLang();
  return (
    <footer className="sf-footer">
      <div className="w">
        <div className="footer-grid">
          <div>
            <strong>SocialsFlip</strong>
            <p className="sm mut" style={{ margin: "6px 0 0", maxWidth: 320 }}>
              {t("footer.escrow")}
            </p>
          </div>
          <div className="footer-links">
            <Link href="/privacy">{t("nav.privacy")}</Link>
            <Link href="/blog">{t("nav.blog")}</Link>
          </div>
        </div>
        <p className="sm mut" style={{ marginTop: 18 }}>
          © {new Date().getFullYear()} SocialsFlip · Escrow marketplace
        </p>
      </div>
    </footer>
  );
}
