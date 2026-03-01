"use client";

/**
 * 通知許可ボタン
 * - 結果画面（FinalResultView）でプレイ完了後に表示
 * - 非侵襲的なデザイン（押さなくても次へ進める）
 * - 状態: unsupported / denied / subscribed / unsubscribed
 */

import { useState, useEffect } from "react";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isAlreadySubscribed,
} from "@/lib/pushNotification";
import { getOrCreateUserId } from "@/lib/userId";

type NotifState =
  | "loading"       // 確認中
  | "unsupported"   // ブラウザ非対応
  | "denied"        // ユーザーが拒否済み
  | "subscribed"    // 購読中
  | "unsubscribed"  // 未購読（許可を求められる）
  | "error";        // 購読処理でエラー発生

interface NotificationButtonProps {
  /** コンパクト表示（スタート画面など） */
  compact?: boolean;
}

export default function NotificationButton({ compact = false }: NotificationButtonProps) {
  const [state, setState] = useState<NotifState>("loading");
  const [isProcessing, setIsProcessing] = useState(false);

  // 現在の通知状態を確認
  useEffect(() => {
    if (!isPushSupported()) {
      setState("unsupported");
      return;
    }

    const permission = getNotificationPermission();
    if (permission === "denied") {
      setState("denied");
      return;
    }

    // すでに購読済みか確認
    isAlreadySubscribed().then((subscribed) => {
      setState(subscribed ? "subscribed" : "unsubscribed");
    });
  }, []);

  // 通知を有効化する
  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      const userId = getOrCreateUserId();
      const result = await subscribeToPush(userId);

      if (result === "subscribed" || result === "already_subscribed") {
        setState("subscribed");
      } else if (result === "denied") {
        setState("denied");
      } else {
        // "error": UI にフィードバックを表示する
        setState("error");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 通知を無効化する
  const handleUnsubscribe = async () => {
    setIsProcessing(true);
    try {
      const userId = getOrCreateUserId();
      const success = await unsubscribeFromPush(userId);
      if (success) setState("unsubscribed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── 非対応・拒否済みの場合は表示しない ──────────────────────
  if (state === "loading" || state === "unsupported") return null;

  if (state === "denied") {
    return (
      <p className="text-xs text-gray-400 text-center mt-2">
        通知はブラウザの設定からオンにできます
      </p>
    );
  }

  if (state === "error") {
    return (
      <div className="w-full max-w-sm mt-4 py-3 px-4 rounded-xl bg-red-50 border border-red-100 text-center">
        <p className="text-sm text-red-600 mb-2">
          通知の設定に失敗しました
        </p>
        <p className="text-xs text-red-400 mb-3">
          ブラウザのコンソールでエラー詳細を確認してください
        </p>
        <button
          onClick={() => {
            setState("unsubscribed");
          }}
          className="text-xs text-blue-500 underline hover:text-blue-600 transition-colors"
        >
          再試行する
        </button>
      </div>
    );
  }

  // ── 購読済み ─────────────────────────────────────────────────
  if (state === "subscribed") {
    if (compact) {
      return (
        <p className="text-xs text-green-600 text-center mt-2 flex items-center justify-center gap-1">
          <span>🔔</span>
          毎日0時に通知が届きます
          <button
            onClick={handleUnsubscribe}
            disabled={isProcessing}
            className="ml-1 text-gray-400 underline hover:text-gray-600 transition-colors"
          >
            オフにする
          </button>
        </p>
      );
    }

    return (
      <div className="w-full max-w-sm mt-4 py-3 px-4 rounded-xl bg-green-50 border border-green-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔔</span>
          <div>
            <p className="text-sm font-medium text-green-700">通知オン</p>
            <p className="text-xs text-green-600">毎日0時に今日の1球をお届け</p>
          </div>
        </div>
        <button
          onClick={handleUnsubscribe}
          disabled={isProcessing}
          className="text-xs text-gray-400 underline hover:text-gray-600 transition-colors disabled:opacity-50"
        >
          {isProcessing ? "..." : "オフ"}
        </button>
      </div>
    );
  }

  // ── 未購読（通知を促す） ──────────────────────────────────────
  if (compact) {
    return (
      <button
        onClick={handleSubscribe}
        disabled={isProcessing}
        className="mt-3 text-sm text-blue-500 underline hover:text-blue-600 transition-colors disabled:opacity-50"
      >
        {isProcessing ? "設定中..." : "🔔 明日の通知を受け取る"}
      </button>
    );
  }

  return (
    <div className="w-full max-w-sm mt-4 py-4 px-5 rounded-2xl bg-blue-50 border border-blue-100">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">🔔</span>
        <div className="flex-1">
          <p className="text-sm font-bold text-blue-800">
            明日も忘れずプレイしよう
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            毎日0時に「今日の1球」が届きます
          </p>
        </div>
      </div>
      <button
        onClick={handleSubscribe}
        disabled={isProcessing}
        className="mt-3 w-full py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing ? "設定中..." : "通知をオンにする（無料）"}
      </button>
      <p className="text-xs text-blue-400 text-center mt-2">
        いつでもオフにできます
      </p>
    </div>
  );
}
