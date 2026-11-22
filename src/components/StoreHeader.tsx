"use client";

import { useAuth } from "./AuthProvider";
import { BrandLogo } from "./BrandLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";

export function StoreHeader() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const dash = user?.role === "admin" ? "/admin" : "/account";

  return (
    <header className="sf-header">
      <div className="w">
        <nav className="sf-nav">
          <BrandLogo size={38} />
          <span className="sp" />
          <ThemeToggle />
          <LanguageSwitcher compact />
          <div className="nav-actions">
            <Link className="nav-chip" href="/create-deal">
              {t("nav.createDeal")}
            </Link>
            {user ? (
              <>
                <Link className="btn s" href={dash}>
                  {user.role === "admin" ? t("nav.admin") : t("nav.account")}
                </Link>
                <button className="btn s o" type="button" onClick={() => logout()}>
                  {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link className="btn s o" href="/auth/signup">
                  {t("nav.signup")}
                </Link>
                <Link className="btn s nav-login" href="/auth/login">
                  {t("nav.login")}
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
