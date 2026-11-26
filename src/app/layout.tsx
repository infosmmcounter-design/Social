import type { Metadata, Viewport } from "next";
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
  applicationName: "SocialsFlip",
  authors: [{ name: "SocialsFlip", url: siteOrigin() }],
  creator: "SocialsFlip",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    apple: [
      { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [{ rel: "mask-icon", url: "/brand/safari-pinned-tab.svg", color: "#17140F" }],
  },
  other: {
    "msapplication-TileColor": "#17140F",
    "msapplication-TileImage": "/brand/mstile-150x150.png",
  },
  openGraph: {
    title: "Buy YouTube Channel, Facebook Page, Instagram Account | SocialsFlip",
    description:
      "Buy a YouTube channel, Facebook page, Instagram account, or freelance service. USDT escrow holds payment until you approve.",
    url: siteOrigin(),
    siteName: "SocialsFlip",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/brand/og.png",
        width: 1200,
        height: 630,
        alt: "SocialsFlip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialsFlip",
    description:
      "Buy a YouTube channel, Facebook page, Instagram account, or freelance service with USDT escrow.",
    images: ["/brand/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#17140F",
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
              "@graph": [
                {
                  "@type": "Organization",
                  name: "SocialsFlip",
                  url: siteOrigin(),
                  logo: {
                    "@type": "ImageObject",
                    url: `${siteOrigin()}/brand/logo.png`,
                    width: 512,
                    height: 512,
                  },
                  image: `${siteOrigin()}/brand/og.png`,
                },
                {
                  "@type": "WebSite",
                  name: "SocialsFlip",
                  url: siteOrigin(),
                  description:
                    "Buy a YouTube channel, Facebook page, Instagram account, TikTok account, or freelance service with USDT escrow.",
                  publisher: { "@type": "Organization", name: "SocialsFlip" },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: `${siteOrigin()}/listings?q={search_term_string}`,
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
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
