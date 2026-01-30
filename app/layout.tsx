import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "今日の1球 - 野球クイズ",
  description: "あなたなら、どうする？30秒で終わる野球クイズ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
