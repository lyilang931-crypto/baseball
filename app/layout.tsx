import type { Metadata } from "next";
import "./globals.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ClientInitializer from "./components/ClientInitializer";

export const metadata: Metadata = {
  title: "今日の1球 - 野球IQクイズ",
  description:
    "あなたなら、どうする？30秒で終わる野球IQクイズ。毎日1球、習慣化。",
  openGraph: {
    title: "今日の1球 - 野球IQクイズ",
    description: "あなたなら、どうする？野球IQクイズ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "今日の1球 - 野球IQクイズ",
    description: "あなたなら、どうする？野球IQクイズ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-white text-gray-900">
        <ClientInitializer />
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
