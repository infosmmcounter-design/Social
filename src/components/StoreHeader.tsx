"use client";

import { useAuth } from "./AuthProvider";
import { BrandLogo } from "./BrandLogo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLang } from "./LanguageProvider";
import { LocaleLink as Link } from "./LocaleLink";

export function StoreHeader() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const dash =
    user?.role === "admin"
      ? "/admin"
      : user?.role === "seller"
        ? "/dashboard/seller"
        : "/dashboard/buyer";

  return (
    <header className="sf-header">
      <div className="w">
        <nav className="sf-nav">
          <BrandLogo size={38} />
          <span className="sp" />
          <LanguageSwitcher compact />
          <div className="nav-pills" role="navigation" aria-label="Primary">
            <Link className="nav-pill np-listings" href="/listings">
              {t("nav.listings")}
            </Link>
            <Link
              className="nav-pill np-services"
              href="/listings?cat=freelance"
            >
              {t("nav.services")}
            </Link>
            <Link className="nav-pill np-sellers" href="/?view=sellers">
              {t("nav.sellers")}
            </Link>
            <Link className="nav-pill np-create" href="/create-deal">
              {t("nav.createDeal")}
            </Link>
            <Link className="nav-pill np-sell" href="/apply">
              {t("nav.sell")}
            </Link>
            <Link className="nav-pill np-chats" href="/chats">
              {t("nav.chats")}
            </Link>
            <Link className="nav-pill np-orders" href="/orders">
              {t("nav.orders")}
            </Link>
            <Link className="nav-pill np-blog" href="/blog">
              {t("nav.blog")}
            </Link>
            <Link className="nav-pill np-help" href="/help">
              {t("nav.help")}
            </Link>
          </div>
          {user ? (
            <div className="nav-actions">
              <Link className="nav-pill np-dash" href={dash}>
                {user.role === "admin" ? t("nav.admin") : t("nav.dashboard")}
              </Link>
              <button className="btn s o" type="button" onClick={() => logout()}>
                {t("nav.logout")}
              </button>
            </div>
          ) : (
            <Link className="btn s nav-login" href="/auth/login">
              {t("nav.login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
