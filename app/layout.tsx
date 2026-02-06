import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ClientInitializer from "./components/ClientInitializer";

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
        {/* ✅ AdSense 所有権確認用 */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2909101989368969"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body className="antialiased min-h-screen bg-white text-black">
        <ClientInitializer />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}