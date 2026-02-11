import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ClientInitializer from "./components/ClientInitializer";
import DebugPanel from "./components/DebugPanel";

export const metadata: Metadata = {
  title: "今日の1球 - 野球IQクイズ",
  description: "あなたなら、どうする？毎日1球、習慣化",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        {/* ✅ AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2909101989368969"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        {/* ✅ GA4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-4M4F01VC3F"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-4M4F01VC3F');
          `}
        </Script>
      </head>

      <body className="antialiased min-h-screen bg-white text-black">
        <ClientInitializer />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Suspense fallback={null}>
          <DebugPanel />
        </Suspense>
      </body>
    </html>
  );
}