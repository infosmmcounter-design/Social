import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
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

const jakarta = localFont({
  src: [
    { path: "../../public/fonts/pj400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/pj600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/pj700.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin()),
  title: {
    default: "SocialsFlip – Safe Marketplace for Accounts & Services",
    template: "%s | SocialsFlip",
  },
  description:
    "Buy and sell social accounts, freelance gigs, and digital tools with USDT escrow. Funds stay protected until you confirm delivery.",
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
    title: "SocialsFlip – Safe Marketplace for Accounts & Services",
    description:
      "Buy and sell social accounts, freelance gigs, and digital tools with USDT escrow. Funds stay protected until you confirm delivery.",
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
    title: "SocialsFlip – Safe Marketplace for Accounts & Services",
    description:
      "Buy and sell social accounts, freelance gigs, and digital tools with USDT escrow.",
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
                    "Buy and sell social accounts, freelance gigs, and digital tools with USDT escrow.",
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
