import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { DocumentTitle } from "@/components/DocumentTitle";
import { HreflangTags } from "@/components/HreflangTags";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { BottomNav } from "@/components/BottomNav";
import { hreflangAlternates, siteOrigin } from "@/lib/i18n/seo";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: "SocialsFlip: Buy Social Media Accounts, Services and Tools",
  description:
    "Escrow-protected marketplace for social accounts, services and tools. Pay USDT TRC20/BEP20 — funds held until delivery.",
  alternates: {
    canonical: "/",
    languages: hreflangAlternates("/").languages,
  },
  openGraph: {
    title: "SocialsFlip: Buy Social Media Accounts, Services and Tools",
    description:
      "Escrow-protected marketplace for social accounts, services and tools.",
    url: siteOrigin(),
    siteName: "SocialsFlip",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={jakarta.className}>
        <LanguageProvider>
          <AuthProvider>
            <HreflangTags />
            <DocumentTitle />
            <StoreHeader />
            <main className="w page-pad">{children}</main>
            <StoreFooter />
            <BottomNav />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
