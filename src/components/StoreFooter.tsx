"use client";

import { useLang } from "./LanguageProvider";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { LocaleLink as Link } from "./LocaleLink";

export function StoreFooter() {
  const { t } = useLang();
  return (
    <footer className="sf-footer">
      <div className="w">
        <div className="footer-grid footer-grid-rich">
          <div className="footer-brand">
            <strong>SocialsFlip</strong>
            <p className="sm mut" style={{ margin: "6px 0 0", maxWidth: 320 }}>
              {t("footer.escrow")}
            </p>
            <p className="sm mut" style={{ margin: "10px 0 0" }}>
              {t("footer.supportPromise")}
            </p>
            <div style={{ marginTop: 12 }}>
              <LanguageSwitcher />
            </div>
          </div>
          <div className="footer-col">
            <h3 className="footer-h">{t("footer.buySell")}</h3>
            <div className="footer-links footer-links-col">
              <Link href="/listings">{t("nav.listings")}</Link>
              <Link href="/dashboard/seller">{t("home.sellPath")}</Link>
              <Link href="/create-deal">{t("nav.createDeal")}</Link>
              <Link href="/blog">{t("nav.blog")}</Link>
            </div>
          </div>
          <div className="footer-col">
            <h3 className="footer-h">{t("footer.trust")}</h3>
            <div className="footer-links footer-links-col">
              <Link href="/escrow-fees">{t("nav.escrowFees")}</Link>
              <Link href="/refund">{t("nav.refund")}</Link>
              <Link href="/scam-alerts">{t("nav.scamAlerts")}</Link>
              <Link href="/faq">{t("nav.faq")}</Link>
              <Link href="/help">{t("nav.help")}</Link>
              <Link href="/contact">{t("nav.contact")}</Link>
            </div>
          </div>
          <div className="footer-col">
            <h3 className="footer-h">{t("footer.legal")}</h3>
            <div className="footer-links footer-links-col">
              <Link href="/about">{t("nav.about")}</Link>
              <Link href="/terms">{t("nav.terms")}</Link>
              <Link href="/privacy">{t("nav.privacy")}</Link>
              <Link href="/prohibited">{t("nav.prohibited")}</Link>
            </div>
          </div>
        </div>
        <p className="sm mut" style={{ marginTop: 22 }}>
          © {new Date().getFullYear()} SocialsFlip · Escrow marketplace
        </p>
      </div>
    </footer>
  );
}
