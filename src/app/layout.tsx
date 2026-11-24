import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { LanguageProvider } from "@/components/LanguageProvider";
import { DocumentTitle } from "@/components/DocumentTitle";
import { HreflangTags } from "@/components/HreflangTags";
import { StoreHeader } from "@/components/StoreHeader";
import { StoreFooter } from "@/components/StoreFooter";
import { BottomNav } from "@/components/BottomNav";
import { ChatDock } from "@/components/ChatDock";
import { hreflangAlternates, siteOrigin } from "@/lib/i18n/seo";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: "Buy YouTube Channel, Facebook Page, Instagram Account | SocialsFlip",
  description:
    "Buy a YouTube channel, Facebook page, Instagram account, TikTok account, or freelance service with USDT escrow. Your payment stays protected until you approve.",
  keywords: [
    "Buy YouTube channel",
    "Buy Facebook page",
    "Buy Instagram account",
    "Buy TikTok account",
    "Freelance services",
    "Buy social media account",
    "USDT escrow",
    "Buy monetized YouTube channel",
    "Hire freelancer",
    "SocialsFlip",
  ],
  alternates: {
    canonical: "/",
    languages: hreflangAlternates("/").languages,
  },
  openGraph: {
    title: "Buy YouTube Channel, Facebook Page, Instagram Account | SocialsFlip",
    description:
      "Buy a YouTube channel, Facebook page, Instagram account, or freelance service. USDT escrow holds payment until you approve.",
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
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(localStorage.getItem('sf_theme')==='dark')document.documentElement.dataset.theme='dark';}catch(e){}",
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SocialsFlip",
              url: siteOrigin(),
              description:
                "Buy a YouTube channel, Facebook page, Instagram account, TikTok account, or freelance service with USDT escrow.",
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteOrigin()}/listings?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <LanguageProvider>
          <AuthProvider>
            <HreflangTags />
            <DocumentTitle />
            <StoreHeader />
            <main className="w page-pad">{children}</main>
            <StoreFooter />
            <ChatDock />
            <BottomNav />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
