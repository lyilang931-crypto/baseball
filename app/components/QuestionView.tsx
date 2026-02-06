"use client";

/**
 * 即体験UX（TikTok型の抽象化）
 * - カウントは「XボールYストライク」のみ表示（全問題タイプで統一）
 * - 選択肢は seeded shuffle で表示順をランダム化
 */

import { useState, useEffect, useMemo } from "react";
import type { Question } from "@/data/questions";
import { getQuestionType, getDataSourceShort } from "@/data/questions";
import { parseCountDisplay, formatCountJP, formatCountBS, replaceCountInText, replaceCountToShort, removeCountFromText } from "@/utils/countDisplay";
import { parseSituation } from "@/utils/situationDisplay";
import { hashSeed, shuffleWithSeed, getTodayJST } from "@/utils/seededShuffle";

export interface QuestionStatsDisplay {
  questionId: string;
  answered_count: number;
  correct_count: number;
  accuracy: number;
}

interface QuestionViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  /** 今日の何回目か（1〜3） */
  attemptIndex?: number;
  maxAttempts?: number;
  secondsLeft: number;
  /** 現在のセッション内での連続正解数 */
  consecutiveCorrect?: number;
  onSelect: (choiceId: string) => void;
  /** 回答送信中は true（連打防止で選択肢を無効化） */
  optionsDisabled?: boolean;
}

const STATS_OPTIONS: RequestInit = { cache: "no-store" };

export default function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  attemptIndex,
  maxAttempts,
  secondsLeft,
  consecutiveCorrect = 0,
  onSelect,
  optionsDisabled = false,
}: QuestionViewProps) {
  const countParsed = parseCountDisplay(question.count);
  const situationParsed = parseSituation(question.situation);
  const [stats, setStats] = useState<QuestionStatsDisplay | null>(null);

  // SSRとクライアント初期描画時の一致を保証するため、mountedフラグを使用
  const [mounted, setMounted] = useState(false);
  const [todayJST, setTodayJST] = useState("");

  // クライアント側でのみDateから値を読み込む
  useEffect(() => {
    setMounted(true);
    setTodayJST(getTodayJST());
  }, []);

  /** 選択肢の表示順を seeded shuffle（同じ日・同じ挑戦回・同じ設問なら安定） */
  const shuffledChoices = useMemo(() => {
    // SSR時とクライアント初期描画時は固定seedを使用（hydration error防止）
    // mounted後に実際の日付で再シャッフル（useEffectで再計算される）
    const seedDate = mounted && todayJST ? todayJST : "1970-01-01"; // 固定seed用の日付
    const seedStr = [
      question.questionId,
      attemptIndex ?? 0,
      questionNumber,
      seedDate,
    ].join("-");
    const seed = hashSeed(seedStr);
    const shuffled = shuffleWithSeed(question.choices, seed);
    if (process.env.NODE_ENV === "development" && mounted) {
      const pos = shuffled.findIndex((c) => c.id === question.answerChoiceId);
      if (pos >= 0) {
        // eslint-disable-next-line no-console
        console.log(`[dev] 正解の表示位置: ${pos + 1}/${shuffled.length} (questionId: ${question.questionId.slice(0, 8)}…)`);
      }
    }
    return shuffled;
  }, [question.questionId, question.choices, question.answerChoiceId, attemptIndex, questionNumber, mounted, todayJST]);

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/stats/question?questionId=${encodeURIComponent(question.questionId)}`,
      STATS_OPTIONS
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [question.questionId]);

  const qType = getQuestionType(question);
  const dataSourceShort = getDataSourceShort(question);

  /** 残り時間のプログレス幅（0-100%） */
  const TIMER_MAX = 30;
  const timerProgress = Math.max(0, Math.min(100, (secondsLeft / TIMER_MAX) * 100));
  /** プログレスバーの色: 余裕あり→青、残り少ない→オレンジ→赤 */
  const progressBarColor =
    secondsLeft >= 15
      ? "bg-blue-500"
      : secondsLeft >= 7
        ? "bg-orange-400"
        : "bg-red-500";

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
      <div className="w-full text-center">
        <p className="text-xs text-gray-400">
          {attemptIndex != null && maxAttempts != null && (
            <span>今日 {attemptIndex}/{maxAttempts} 回目 · </span>
          )}
          {questionNumber} / {totalQuestions}
        </p>
        {consecutiveCorrect > 0 && (
          <p className="text-xs font-medium text-green-600 mt-1">
            {consecutiveCorrect}問連続正解中！
          </p>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full py-4">
        {/* 実データ / 配球セオリー / 知識問題 */}
        <p className="text-xs text-gray-500 mb-3 text-center">
          {qType === "REAL_DATA" ? (
            <>
              <span className="font-medium text-green-700">実データ</span>
              {dataSourceShort && (
                <span className="ml-2 text-gray-500">出典: {dataSourceShort}</span>
              )}
            </>
          ) : qType === "KNOWLEDGE" ? (
            <span className="text-gray-500">知識問題</span>
          ) : (
            <span className="text-gray-500">配球セオリー</span>
          )}
        </p>

        {/* 補助: 回・アウト（小さく）。カウント表記は短縮表記(0B-2S)に統一（メインで大きく表示されるため重複排除） */}
        {situationParsed && (
          <p className="text-xs text-gray-400 text-center mb-2">
            {replaceCountToShort(situationParsed.inningOuts)}
          </p>
        )}

        {/* メイン: カウントは見出しに明示的に表示（"B0–S2"形式）、本文には補足情報（回・アウト・走者）のみ */}
        {countParsed ? (
          <div className="text-center mb-8">
            {/* 見出し: カウントを明示的に表示（"B0–S2"形式、B=ボール、S=ストライク） */}
            <p className="text-3xl font-bold text-gray-900 tracking-tight mb-3">
              {formatCountBS(countParsed.balls, countParsed.strikes)}
            </p>
            {/* 本文: 補足情報（回・アウト・走者）のみ表示（カウント情報は削除） */}
            {situationParsed ? (
              <div className="space-y-1">
                {/* 回・アウト情報（カウント情報を削除） */}
                {situationParsed.inningOuts && (
                  <p className="text-sm text-gray-600">
                    {removeCountFromText(situationParsed.inningOuts)}
                  </p>
                )}
                {/* 塁状況（カウント情報を削除） */}
                {situationParsed.baseSituation && (
                  <p className="text-lg text-gray-700">
                    {removeCountFromText(situationParsed.baseSituation)}
                  </p>
                )}
              </div>
            ) : question.situation ? (
              <p className="text-lg text-gray-700 mt-2">
                {/* situationからカウント情報を完全に削除して表示 */}
                {removeCountFromText(question.situation)}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {replaceCountInText(question.situation)}
            </h2>
            <p className="text-sm text-gray-600">{replaceCountInText(question.count)}</p>
          </div>
        )}

        {/* みんなの正解率（シンプル1行） */}
        {stats != null && stats.answered_count > 0 && (
          <p className="text-xs text-gray-400 text-center mb-4">
            正解率 {Math.round(stats.accuracy * 100)}%
          </p>
        )}

        {/* 残り時間プログレスバー（数字非表示） */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
            style={{ width: `${timerProgress}%` }}
          />
        </div>

        <div className="w-full space-y-2">
          {shuffledChoices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              disabled={optionsDisabled}
              onClick={() => onSelect(choice.id)}
              className="w-full py-4 px-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-medium text-center hover:border-blue-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-60 disabled:pointer-events-none"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
