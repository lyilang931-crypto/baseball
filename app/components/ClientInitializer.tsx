"use client";

import { useEffect } from "react";
import { setupErrorHandling } from "@/lib/error-handler";
import { tracker } from "@/lib/monitoring";
import { registerServiceWorker } from "@/lib/pushNotification";

/**
 * クライアントサイドの初期化コンポーネント
 * - エラーハンドリングのセットアップ
 * - ページビュートラッキング
 * - Service Worker 登録（Web Push 通知のため）
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

    // Service Worker を登録（Web Push 通知の前提）
    // 失敗してもアプリの動作には影響しない
    registerServiceWorker().catch((err) => {
      console.warn("[ClientInitializer] SW registration skipped:", err);
    });

    // 開発モードでのみログを表示
    if (process.env.NODE_ENV !== "production") {
      console.log("[ClientInitializer] Monitoring and error handling initialized");
    }
  }, []);

  return null;
}

export default ClientInitializer;
