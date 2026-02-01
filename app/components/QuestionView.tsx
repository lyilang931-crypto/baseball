"use client";

/**
 * 即体験UX（TikTok型の抽象化）
 * - カウントは常に B/S 表記（B{balls} | S{strikes}）を主表示、補助で（nボールnストライク）
 * - 選択肢は seeded shuffle で表示順をランダム化
 * - 回・アウトは補助で小さく表示
 */

import { useState, useEffect, useMemo } from "react";
import type { Question } from "@/data/questions";
import { getQuestionType, getDataSourceShort } from "@/data/questions";
import { parseCountDisplay, formatCountSub } from "@/utils/countDisplay";
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
      <p className="text-xs text-gray-400 w-full text-center">
        {attemptIndex != null && maxAttempts != null && (
          <span>今日 {attemptIndex}/{maxAttempts} 回目 · </span>
        )}
        {questionNumber}/{totalQuestions} · 残り{secondsLeft}秒
      </p>

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

        {/* 補助: 回・アウト（小さく） */}
        {situationParsed && (
          <p className="text-xs text-gray-400 text-center mb-2">
            {situationParsed.inningOuts}
          </p>
        )}

        {/* メイン: B/S バッジ（常時表示・迷い防止）+ 補助（nボールnストライク）+ 塁状況 or 問題文 */}
        {countParsed ? (
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-gray-900 tracking-tight flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-green-100 px-3 py-1 text-green-800 font-bold" aria-label={`ボール${countParsed.balls}`}>B{countParsed.balls}</span>
              <span className="text-gray-400" aria-hidden>|</span>
              <span className="inline-flex items-center rounded-lg bg-red-100 px-3 py-1 text-red-800 font-bold" aria-label={`ストライク${countParsed.strikes}`}>S{countParsed.strikes}</span>
              {situationParsed && (
                <>
                  <span className="text-gray-400 mx-1" aria-hidden>｜</span>
                  <span className="text-gray-900">{situationParsed.baseSituation}</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCountSub(countParsed.balls, countParsed.strikes)}
            </p>
            {!situationParsed && question.situation && (
              <h2 className="text-lg font-bold text-gray-900 mt-3 mb-1">{question.situation}</h2>
            )}
          </div>
        ) : (
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {question.situation}
            </h2>
            <p className="text-sm text-gray-600">{question.count}</p>
            <p className="text-xs text-gray-500 mt-1">B=ボール S=ストライク</p>
          </div>
        )}

        {/* みんなの成績（正解率・correct/answered） */}
        {stats != null && (
          <p className="text-xs text-gray-500 text-center mb-4">
            正解率: {stats.answered_count === 0 ? "—" : `${Math.round(stats.accuracy * 100)}%`}
            {stats.answered_count > 0 && (
              <span className="ml-2">
                みんなの成績: {stats.correct_count} / {stats.answered_count}
              </span>
            )}
          </p>
        )}

        {/* カウント説明は折りたたみ（初期非表示） */}
        <details className="w-full mb-6 text-left group">
          <summary className="text-xs text-gray-400 cursor-pointer list-none py-1 select-none">
            <span className="inline-flex items-center gap-1">
              <span className="group-open:hidden">カウントの説明を表示</span>
              <span className="hidden group-open:inline">カウントの説明を閉じる</span>
            </span>
          </summary>
          <div className="mt-2 pl-0 text-xs text-gray-500 border-l-0">
            <p className="mb-1">
              <strong className="text-gray-600">B（ボール）</strong>：打者が打たなかったり、ストライクゾーン外の球で審判がボールと判定した数。
            </p>
            <p>
              <strong className="text-gray-600">S（ストライク）</strong>：ストライクゾーンを通過した球、空振り、ファウル（2ストライク未満時）などでカウントされる数。
            </p>
          </div>
        </details>

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
