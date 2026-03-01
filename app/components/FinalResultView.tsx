"use client";

/**
 * シェア前提の結果画面（Trivia系上位アプリ型の抽象化）
 * - 結果 = シェア画面。X / LINE を自然に配置
 * - 判断力レベルは名称のみ（数値断定禁止）
 *
 * 【広告】
 * - バナー広告: 結果画面のみ、3回に1回だけ表示（プレミアム時は非表示）
 * - リワード広告: 「配球ヒントを見る」任意押下（1日1回）
 * - インタースティシャルは入れない（"うざい"防止）
 */

import { useState, useEffect, useRef } from "react";
import {
  buildShareText,
  getTwitterShareUrl,
  getLineShareUrl,
} from "@/utils/shareText";
import { getLevelLabel } from "@/utils/levelLabel";
import { getStreakCount } from "@/utils/streak";
import ShareCard from "./ShareCard";
import AdSlot from "./AdSlot";
import RewardedAdButton from "./RewardedAdButton";
import NotificationButton from "./NotificationButton";
import { isPremiumUser } from "@/lib/monetization";
import { track, getSessionId, once } from "@/lib/analytics";
import {
  getTodayAttemptsUsed,
  getTodayAttemptsRemaining,
} from "@/lib/daily";
import { getTomorrowPreview } from "@/utils/tomorrowPreview";
import type { TomorrowPreview } from "@/utils/tomorrowPreview";
import {
  getWeeklyState,
  getWeeklyRank,
  getNextRankGap,
} from "@/lib/weeklyChallenge";
import type { WeeklyState, WeeklyRank } from "@/lib/weeklyChallenge";

interface FinalResultViewProps {
  correctCount: number;
  totalQuestions: number;
  ratingBefore: number;
  ratingAfter: number;
  onBackToStart: () => void;
  /** GA4用（省略時は daily_normal / 0） */
  analyticsMode?: "daily_pitching" | "daily_normal" | "normal";
  analyticsQuestionId?: number;
  /** 配球チャレンジモードかどうか */
  isDailyChallenge?: boolean;
}

export default function FinalResultView({
  correctCount,
  totalQuestions,
  ratingBefore,
  ratingAfter,
  onBackToStart,
  analyticsMode = "daily_normal",
  analyticsQuestionId = 0,
  isDailyChallenge = false,
}: FinalResultViewProps) {
  // SSRとクライアント初期描画時の一致を保証するため、mountedフラグを使用
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [premium, setPremium] = useState(false);
  const [attemptsUsed, setAttemptsUsed] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(0);
  const resultViewTrackedRef = useRef(false);
  /** ③ 前回セッションのレート（成長表示用） */
  const [prevRating, setPrevRating] = useState<number | null>(null);
  /** ③ 直近3回の平均正答率 */
  const [avgAccuracy, setAvgAccuracy] = useState<number | null>(null);
  /** 明日の予告 */
  const [tomorrow, setTomorrow] = useState<TomorrowPreview | null>(null);
  /** 週間チャレンジ */
  const [weekly, setWeekly] = useState<WeeklyState | null>(null);
  const [weeklyRank, setWeeklyRank] = useState<WeeklyRank | null>(null);
  const [nextRank, setNextRank] = useState<{ nextTitle: string; gap: number } | null>(null);

  // クライアント側でのみlocalStorageから値を読み込む
  useEffect(() => {
    setMounted(true);
    setStreak(getStreakCount());
    setPremium(isPremiumUser());
    setAttemptsUsed(getTodayAttemptsUsed());
    setAttemptsRemaining(getTodayAttemptsRemaining());
    setTomorrow(getTomorrowPreview());
    // 週間チャレンジ
    const ws = getWeeklyState();
    setWeekly(ws);
    setWeeklyRank(getWeeklyRank(ws.correctTotal));
    setNextRank(getNextRankGap(ws.correctTotal));

    // ③ セッション履歴から成長指標を算出
    try {
      const raw = localStorage.getItem("bq_session_log");
      if (raw) {
        const log = JSON.parse(raw) as Array<{
          c: number;
          t: number;
          r: number;
          ts: number;
        }>;
        // log[-1] = 今回, log[-2] = 前回
        if (log.length >= 2) {
          setPrevRating(log[log.length - 2].r);
        }
        // 直近3回の平均正答率（今回含む）
        const recent = log.slice(-3);
        if (recent.length >= 2) {
          const avg =
            recent.reduce(
              (s, e) => s + (e.t > 0 ? (e.c / e.t) * 100 : 0),
              0
            ) / recent.length;
          setAvgAccuracy(Math.round(avg));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // GA4: result_view イベント（1回だけ）
  useEffect(() => {
    if (!mounted || resultViewTrackedRef.current) return;
    resultViewTrackedRef.current = true;
    const used = getTodayAttemptsUsed();
    const rem = getTodayAttemptsRemaining();
    track("result_view", {
      app: "baseball-quiz-web",
      mode: analyticsMode,
      session_id: getSessionId(),
      attempt: used,
      remaining: rem,
    });
  }, [mounted, analyticsMode]);

  const delta = ratingAfter - ratingBefore;
  const accuracy =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const levelLabel = getLevelLabel(ratingAfter);

  const handleShare = (type: "twitter" | "line") => {
    if (typeof window === "undefined") return;
    const url = window.location.origin;
    const { twitterText, lineText } = buildShareText({
      correctCount,
      totalQuestions,
      accuracy,
      rating: ratingAfter,
      url,
    });
    const shareUrl =
      type === "twitter"
        ? getTwitterShareUrl(twitterText)
        : getLineShareUrl(lineText, url);
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {correctCount <= 1 ? "挑戦完了" : "結果"}
        </h2>

        {/* ② 0-1問正解: 学習リフレーム / 2問以上: 通常表示 */}
        {correctCount <= 1 ? (
          <div className="text-center mb-2">
            <p className="text-lg font-bold text-gray-900">
              今日の解説で 知識+{totalQuestions}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {totalQuestions}問分の解説を読んだ — もう昨日の自分より強い
            </p>
          </div>
        ) : (
          <p className="text-gray-600 text-center mb-2">
            {totalQuestions}問中{correctCount}問正解（正答率
            {Math.round(accuracy)}%）
          </p>
        )}

        <p className="text-center mb-2">
          <span className="text-gray-600">レート: </span>
          <span className="font-bold text-blue-600 text-xl">
            {ratingAfter} ({delta >= 0 ? "+" : ""}
            {delta})
          </span>
        </p>
        <p className="text-center text-gray-700 font-medium mb-1">
          あなたの判断力レベル: {levelLabel}
        </p>

        {/* ③ 成長指標: 前回比 + 直近平均 */}
        {mounted && (prevRating !== null || avgAccuracy !== null) && (
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-1">
            {prevRating !== null && (
              <span>
                前回比{" "}
                <span
                  className={
                    ratingAfter - prevRating >= 0
                      ? "font-medium text-blue-600"
                      : "font-medium text-red-500"
                  }
                >
                  {ratingAfter - prevRating >= 0 ? "+" : ""}
                  {ratingAfter - prevRating}
                </span>
              </span>
            )}
            {avgAccuracy !== null && (
              <span>直近平均 {avgAccuracy}%</span>
            )}
          </div>
        )}

        {/* ④ ストリーク: 損失回避強化 */}
        {mounted && streak > 0 && (
          <p className="text-center text-sm text-orange-500 font-medium mb-2">
            🔥 {streak}日連続 — 明日やらないとリセット
          </p>
        )}
        {mounted && streak === 0 && (
          <p className="text-center text-xs text-gray-400 mb-2">
            明日プレイで連続記録スタート
          </p>
        )}

        {/* ② 0-1問正解時の未来志向メッセージ */}
        {correctCount <= 1 && (
          <p className="text-center text-sm text-gray-500 mb-2">
            明日は取り返せる。挑戦を続けよう。
          </p>
        )}

        {/* Primary CTA: 次の挑戦 or 終了 */}
        {mounted && (
          <div className="w-full max-w-sm mt-4 mb-6">
            {!isDailyChallenge && attemptsRemaining > 0 ? (
              <button
                type="button"
                onClick={() => {
                  track("challenge_continue_click", {
                    app: "baseball-quiz-web",
                    mode: analyticsMode,
                    session_id: getSessionId(),
                    attempt: attemptsUsed,
                    remaining: attemptsRemaining,
                  });
                  onBackToStart();
                }}
                className="w-full py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                <span aria-hidden>&#x25B6;</span>
                次の挑戦へ（残り{attemptsRemaining}回）
              </button>
            ) : !isDailyChallenge ? (
              <button
                type="button"
                disabled
                className="w-full py-4 px-6 rounded-2xl bg-gray-300 text-gray-500 font-bold text-lg flex items-center justify-center gap-2 cursor-not-allowed"
              >
                今日は終了（明日また挑戦）
              </button>
            ) : (
              <button
                type="button"
                onClick={onBackToStart}
                className="w-full py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
              >
                <span aria-hidden>&#x25B6;</span>
                スタートに戻る
              </button>
            )}
          </div>
        )}
        {!mounted && <div className="mb-6" />}

        {/* 🔔 プッシュ通知オプトイン（今日のプレイ完了後に表示） */}
        {mounted && <NotificationButton />}

        {/* 明日の予告（オープンループで再訪を促す） */}
        {mounted && tomorrow && (
          <div className="w-full max-w-sm mb-4 py-4 px-5 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100">
            <p className="text-xs text-indigo-400 font-medium mb-1">
              明日のテーマ
            </p>
            <p className="text-base font-bold text-indigo-700">
              {tomorrow.theme}
            </p>
            <p className="text-sm text-indigo-500 mt-0.5">
              {tomorrow.teaser}
            </p>
          </div>
        )}

        {/* 週間チャレンジ進捗 */}
        {mounted && weekly && weeklyRank && weekly.sessionCount > 0 && (
          <div className="w-full max-w-sm mb-4 py-3 px-4 rounded-xl bg-gray-50 border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">今週のチャレンジ</span>
              <span className={`text-xs font-bold ${weeklyRank.color}`}>
                {weeklyRank.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                {weekly.correctTotal}問正解
              </span>
              <span className="text-xs text-gray-400">
                / {weekly.daysPlayed.length}日プレイ
              </span>
            </div>
            {nextRank && (
              <p className="text-xs text-gray-400 mt-1">
                {nextRank.nextTitle}まであと{nextRank.gap}問
              </p>
            )}
          </div>
        )}

        {/* 結果画面 = シェア画面（X / LINE を自然に配置） */}
        <section className="w-full max-w-sm mt-4 mb-6" aria-label="結果をシェア">
          <p className="text-sm text-gray-500 text-center mb-3">
            結果をシェアする
          </p>
          <div className="flex gap-3 min-w-0">
            <button
              type="button"
              onClick={() => handleShare("twitter")}
              className="flex-1 min-w-0 py-3 px-3 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-sm font-medium flex items-center justify-center gap-1.5 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors whitespace-nowrap"
              aria-label="Xでシェア"
            >
              <span aria-hidden>𝕏</span>
              Xでシェア
            </button>
            <button
              type="button"
              onClick={() => handleShare("line")}
              className="flex-1 min-w-0 py-3 px-3 rounded-xl border-2 border-transparent bg-[#06C755] text-white text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-[#05b34a] active:bg-[#049c40] transition-colors whitespace-nowrap"
              aria-label="LINEでシェア"
            >
              <span aria-hidden>LINE</span>
              LINEでシェア
            </button>
          </div>
        </section>

        <ShareCard
          correctCount={correctCount}
          totalQuestions={totalQuestions}
          ratingAfter={ratingAfter}
          ratingDelta={delta}
          streak={mounted && streak > 0 ? streak : undefined}
        />

        {/* 広告枠（結果画面のみ・頻度制限あり・プレミアム非表示） */}
        {mounted && <AdSlot placement="final_result_banner" />}

        {/* 任意の報酬型広告（1日1回・ユーザー押下時のみ） */}
        {mounted && <RewardedAdButton />}
      </div>

      {/* 広告なし（Pro）導線 */}
      {mounted && !premium && (
        <div className="w-full max-w-sm mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              if (!once("pro_cta_click_result")) return;
              track("pro_cta_click", {
                app: "baseball-quiz-web",
                mode: analyticsMode,
                question_id: analyticsQuestionId,
                session_id: getSessionId(),
                is_pro: false,
                placement: "result",
              });
              if (typeof window !== "undefined") {
                window.alert("プレミアムプランは準備中です。もうしばらくお待ちください。");
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-500 transition-colors"
          >
            <span className="inline-block w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-white text-[10px] font-bold leading-4 text-center">P</span>
            広告なしで快適に（Pro）
          </button>
        </div>
      )}
    </div>
  );
}
