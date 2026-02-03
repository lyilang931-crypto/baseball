"use client";

import { useEffect } from "react";
import { setupErrorHandling } from "@/lib/error-handler";
import { tracker } from "@/lib/monitoring";

/**
 * クライアントサイドの初期化コンポーネント
 * - エラーハンドリングのセットアップ
 * - ページビュートラッキング
 */
export function ClientInitializer(): null {
  useEffect(() => {
    // エラーハンドリングを初期化
    setupErrorHandling();

    // 初回ページビューを記録
    tracker.pageView(window.location.pathname, {
      referrer: document.referrer,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
    });

    // 開発モードでのみログを表示
    if (process.env.NODE_ENV !== "production") {
      console.log("[ClientInitializer] Monitoring and error handling initialized");
    }
  }, []);

  return null;
}

export default ClientInitializer;
