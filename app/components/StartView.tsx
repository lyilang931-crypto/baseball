"use client";

import { useState, useEffect } from "react";
import { getStreakCount } from "@/utils/streak";
import {
  getTodayAttemptsUsed,
  getTodayAttemptsRemaining,
  MAX_DAILY_ATTEMPTS,
} from "@/lib/daily";
import {
  isPremiumUser,
  shouldShowAd,
  addAdBonusSession,
  getTodayBonusSessions,
  getRemainingPlays,
} from "@/lib/monetization";
import {
  isDailyChallengeCompleted,
  getDailyChallengeState,
} from "@/lib/dailyChallenge";

/**
 * 1日3回まで挑戦可能。残り回数 / ○/3 回目 を表示。
 * 3回使い切ったら「今日の結果を見る」or「広告で追加プレイ」。
 *
 * 【広告ポイント（将来実装）】
 * - 制限到達時: リワード広告で追加セッション獲得
 * - バナー広告: 画面下部に控えめに表示（プレミアム時は非表示）
 */

export interface StartOptions {
  /** 実データ問題のみ出題 */
  dataOnly?: boolean;
  /** 今回の挑戦が何回目か（1〜3） */
  attemptIndex?: number;
  /** デイリーチャレンジモード */
  dailyChallenge?: boolean;
}

interface StartViewProps {
  onStart: (options?: StartOptions) => void;
  onViewTodayResult: () => void;
}

export default function StartView({
  onStart,
  onViewTodayResult,
}: StartViewProps) {
  // SSRとクライアント初期描画時の一致を保証するため、mountedフラグを使用
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [dataOnly, setDataOnly] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [bonusSessions, setBonusSessions] = useState(0);
  const [effectiveRemaining, setEffectiveRemaining] = useState(0);
  const [allUsed, setAllUsed] = useState(false);
  const [showAdOption, setShowAdOption] = useState(false);
  const [dailyDone, setDailyDone] = useState(false);
  const [dailyResult, setDailyResult] = useState<{ correctCount: number; ratingDelta: number } | null>(null);

  // クライアント側でのみlocalStorageから値を読み込む
  useEffect(() => {
    setMounted(true);
    setStreak(getStreakCount());
    const used = getTodayAttemptsUsed();
    const rem = getTodayAttemptsRemaining();
    const bonus = getTodayBonusSessions();
    const effective = getRemainingPlays(used);
    setAttemptsUsed(used);
    setRemaining(rem);
    setBonusSessions(bonus);
    setEffectiveRemaining(effective);
    setAllUsed(effective === 0);
    setShowAdOption(shouldShowAd("extra_play_rewarded"));
    setDailyDone(isDailyChallengeCompleted());
    const dcState = getDailyChallengeState();
    if (dcState?.completed) {
      setDailyResult({ correctCount: dcState.correctCount, ratingDelta: dcState.ratingDelta });
    }
  }, []);

  // 広告視聴で追加プレイを獲得する処理（将来SDK導入時に実装）
  const handleWatchAdForBonus = () => {
    // TODO: 実際の広告SDKを呼び出し、視聴完了後にaddAdBonusSession()を呼ぶ
    // 現在はプレースホルダー（開発時のみ動作）
    if (process.env.NODE_ENV === "development") {
      addAdBonusSession();
      // 状態を更新するためにリロード（本番ではstateで管理）
      window.location.reload();
    } else {
      // 本番ではまだ機能しない旨を表示
      alert("広告機能は準備中です。もうしばらくお待ちください。");
    }
  };

  // SSR時とクライアント初期描画時は同じデフォルト値を表示（hydration error防止）
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          ⚾ 今日の1球
        </h1>
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
            onStart({ dataOnly: dataOnly || undefined, attemptIndex: 1 })
          }
          className="w-full max-w-sm py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
        >
          <span aria-hidden>▶</span>
          今日の1球に挑戦
        </button>
      </div>
    );
  }

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
        <div className="w-full max-w-sm space-y-3">
          <button
            type="button"
            onClick={onViewTodayResult}
            className="w-full py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
          >
            今日の結果を見る
          </button>

          {/* 広告視聴で追加プレイ（将来実装） */}
          {showAdOption && (
            <button
              type="button"
              onClick={handleWatchAdForBonus}
              className="w-full py-3 px-6 rounded-2xl border-2 border-gray-300 bg-white text-gray-700 font-medium text-base flex items-center justify-center gap-2 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <span aria-hidden>🎬</span>
              広告を見て追加プレイ
            </button>
          )}
        </div>
        <p className="text-xs text-gray-400 text-center mt-6">
          明日の0:00（JST）に次の1球が解放されます
        </p>

        {/* プレミアムへの誘導（将来実装） */}
        <p className="text-xs text-gray-400 text-center mt-4">
          <span className="text-blue-500 cursor-pointer hover:underline">
            プレミアムで無制限プレイ
          </span>
        </p>
      </div>
    );
  }

  const nextAttempt = attemptsUsed + 1;
  const totalSlots = MAX_DAILY_ATTEMPTS + bonusSessions;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        ⚾ 今日の1球
      </h1>
      {streak > 0 && (
        <p className="text-sm text-gray-500 mb-2">連続: {streak}日</p>
      )}
      <p className="text-sm text-gray-500 mb-1">
        今日 {nextAttempt}/{totalSlots} 回目 · 残り {effectiveRemaining} 回
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

      {/* デイリーチャレンジ */}
      <div className="w-full max-w-sm mt-6">
        {!dailyDone ? (
          <button
            type="button"
            onClick={() => onStart({ dailyChallenge: true })}
            className="w-full py-3 px-6 rounded-2xl border-2 border-amber-400 bg-amber-50 text-amber-800 font-bold text-base flex items-center justify-center gap-2 hover:border-amber-500 hover:bg-amber-100 active:bg-amber-200 transition-colors"
          >
            <span aria-hidden>&#x1F31F;</span>
            今日の配球チャレンジ
          </button>
        ) : (
          <div className="w-full py-3 px-6 rounded-2xl border-2 border-gray-200 bg-gray-50 text-gray-500 text-sm text-center">
            今日のチャレンジ済み
            {dailyResult && (
              <span className="ml-2 font-medium">
                {dailyResult.correctCount}/5問正解
              </span>
            )}
          </div>
        )}
      </div>

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
