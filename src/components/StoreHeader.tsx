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
          <Link className="l" href="/listings">
            {t("nav.listings")}
          </Link>
          <Link className="l" href="/listings?type=service">
            {t("nav.services")}
          </Link>
          <Link className="l" href="/?view=sellers">
            {t("nav.sellers")}
          </Link>
          <Link className="l" href="/create-deal">
            {t("nav.createDeal")}
          </Link>
          <Link className="l" href="/apply">
            {t("nav.sell")}
          </Link>
          <Link className="l" href="/chats">
            {t("nav.chats")}
          </Link>
          <Link className="l" href="/orders">
            {t("nav.orders")}
          </Link>
          <Link className="l" href="/blog">
            {t("nav.blog")}
          </Link>
          {user ? (
            <>
              <Link className="l" href={dash}>
                {user.role === "admin" ? t("nav.admin") : t("nav.dashboard")}
              </Link>
              <button className="btn s o" onClick={() => logout()}>
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <Link className="btn s" href="/auth/login">
              {t("nav.login")}
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
