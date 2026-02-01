"use client";

import { useState } from "react";
import { getStreakCount } from "@/utils/streak";

/**
 * 即体験UX（TikTok型の抽象化）
 * - 画面中央に1つの強いCTA
 * - テキストは極力短く、説明・チュートリアルなし
 *
 * デイリー体験（Duolingo型の抽象化）
 * - 未プレイ時: 「今日の1球に挑戦」＋オプションで「実データ問題のみ」
 * - プレイ後: 「今日の結果を見る」のみ
 * - 連続日数 Streak を小さく表示
 */

export interface StartOptions {
  /** 実データ問題のみ出題（NPB/MLB 等の統計問題のみ） */
  dataOnly?: boolean;
}

interface StartViewProps {
  hasPlayedToday: boolean;
  onStart: (options?: StartOptions) => void;
  onViewTodayResult: () => void;
}

export default function StartView({
  hasPlayedToday,
  onStart,
  onViewTodayResult,
}: StartViewProps) {
  const streak = getStreakCount();
  const [dataOnly, setDataOnly] = useState(false);

  if (hasPlayedToday) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          ⚾ 今日の1球
        </h1>
        {streak > 0 && (
          <p className="text-sm text-gray-500 mb-2">連続: {streak}日</p>
        )}
        <p className="text-gray-600 text-center mb-8">
          今日の挑戦は完了しました
        </p>
        <div className="w-full max-w-sm">
          <button
            type="button"
            onClick={onViewTodayResult}
            className="w-full py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
          >
            今日の結果を見る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        ⚾ 今日の1球
      </h1>
      {streak > 0 && (
        <p className="text-sm text-gray-500 mb-2">連続: {streak}日</p>
      )}
      <p className="text-gray-600 text-center mb-6">あなたなら、どうする？</p>

      <label className="flex items-center gap-2 mb-6 text-sm text-gray-600 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={dataOnly}
          onChange={(e) => setDataOnly(e.target.checked)}
          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          aria-describedby="data-only-desc"
        />
        <span id="data-only-desc">実データ問題のみ出題する（NPB/MLB 等）</span>
      </label>

      <button
        type="button"
        onClick={() => onStart({ dataOnly: dataOnly || undefined })}
        className="w-full max-w-sm py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
      >
        <span aria-hidden>▶</span>
        今日の1球に挑戦
      </button>
    </div>
  );
}
