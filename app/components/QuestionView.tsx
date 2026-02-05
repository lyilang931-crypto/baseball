"use client";

/**
 * 即体験UX（TikTok型の抽象化）
 * - カウントは「XボールYストライク」のみ表示（全問題タイプで統一）
 * - 選択肢は seeded shuffle で表示順をランダム化
 */

import { useState, useEffect, useMemo } from "react";
import type { Question } from "@/data/questions";
import { getQuestionType, getDataSourceShort } from "@/data/questions";
import { parseCountDisplay, formatCountJP, replaceCountInText, replaceCountToShort } from "@/utils/countDisplay";
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

  /** 選択肢の表示順を seeded shuffle（同じ日・同じ挑戦回・同じ設問なら安定） */
  const shuffledChoices = useMemo(() => {
    const todayJST = getTodayJST();
    const seedStr = [
      question.questionId,
      attemptIndex ?? 0,
      questionNumber,
      todayJST,
    ].join("-");
    const seed = hashSeed(seedStr);
    const shuffled = shuffleWithSeed(question.choices, seed);
    if (process.env.NODE_ENV === "development") {
      const pos = shuffled.findIndex((c) => c.id === question.answerChoiceId);
      if (pos >= 0) {
        // eslint-disable-next-line no-console
        console.log(`[dev] 正解の表示位置: ${pos + 1}/${shuffled.length} (questionId: ${question.questionId.slice(0, 8)}…)`);
      }
    }
    return shuffled;
  }, [question.questionId, question.choices, question.answerChoiceId, attemptIndex, questionNumber]);

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

        {/* メイン: カウントは「XボールYストライク」のみ表示 + 塁状況 or 問題文（重複なし） */}
        {countParsed ? (
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-gray-900 tracking-tight">
              {formatCountJP(countParsed.balls, countParsed.strikes)}
            </p>
            {situationParsed && (() => {
              const countStr = formatCountJP(countParsed.balls, countParsed.strikes);
              // baseSituation内のカウント表記を短縮表記に置き換え（メインで大きく表示されるため重複排除）
              let baseStr = replaceCountToShort(situationParsed.baseSituation);
              // 「、」で終わるカウント文字列も削除（既存ロジック維持）
              if (baseStr.endsWith("、" + countStr)) baseStr = baseStr.slice(0, baseStr.length - (countStr.length + 1));
              return (
                <p className="text-lg text-gray-700 mt-2">{baseStr}</p>
              );
            })()}
            {!situationParsed && question.situation && (
              <h2 className="text-lg font-bold text-gray-900 mt-3 mb-1">
                {replaceCountInText(question.situation)}
              </h2>
            )}
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
