"use client";

import { useState } from "react";
import { getStreakCount } from "@/utils/streak";
import {
  getTodayAttemptsUsed,
  getTodayAttemptsRemaining,
  MAX_DAILY_ATTEMPTS,
} from "@/lib/daily";

/**
 * 1日3回まで挑戦可能。残り回数 / ○/3 回目 を表示。
 * 3回使い切ったら「今日の結果を見る」のみ。
 */

export interface StartOptions {
  /** 実データ問題のみ出題 */
  dataOnly?: boolean;
  /** 今回の挑戦が何回目か（1〜3） */
  attemptIndex?: number;
}

interface StartViewProps {
  onStart: (options?: StartOptions) => void;
  onViewTodayResult: () => void;
}

export default function StartView({
  onStart,
  onViewTodayResult,
}: StartViewProps) {
  const streak = getStreakCount();
  const [dataOnly, setDataOnly] = useState(false);
  const attemptsUsed = getTodayAttemptsUsed();
  const remaining = getTodayAttemptsRemaining();
  const allUsed = remaining === 0;

  if (allUsed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          ⚾ 今日の1球
        </h1>
        {streak > 0 && (
          <p className="text-sm text-gray-500 mb-2">連続: {streak}日</p>
        )}
        <p className="text-gray-600 text-center mb-6">
          今日の挑戦は完了しました（{MAX_DAILY_ATTEMPTS}/{MAX_DAILY_ATTEMPTS}回）
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
        <p className="text-xs text-gray-400 text-center mt-6">
          明日の0:00（JST）に次の1球が解放されます
        </p>
      </div>
    );
  }

  const nextAttempt = attemptsUsed + 1;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        ⚾ 今日の1球
      </h1>
      {streak > 0 && (
        <p className="text-sm text-gray-500 mb-2">連続: {streak}日</p>
      )}
      <p className="text-sm text-gray-500 mb-1">
        今日 {nextAttempt}/{MAX_DAILY_ATTEMPTS} 回目 · 残り {remaining} 回
      </p>
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
        onClick={() =>
          onStart({ dataOnly: dataOnly || undefined, attemptIndex: nextAttempt })
        }
        className="w-full max-w-sm py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
      >
        <span aria-hidden>▶</span>
        今日の1球に挑戦
      </button>

      {attemptsUsed >= 1 && (
        <button
          type="button"
          onClick={onViewTodayResult}
          className="mt-4 text-sm text-gray-500 underline hover:text-gray-700"
        >
          今日の結果を見る
        </button>
      )}
    </div>
  );
}
