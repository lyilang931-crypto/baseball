"use client";

/**
 * 即体験UX（TikTok型の抽象化）
 * - メインは「B/Sカウント + 塁状況」のみ大きく中央表示
 * - 回・アウトは補助で小さく表示
 * - みんなの成績（正解率・correct/answered）を表示
 * - カウント説明は折りたたみ（初期は非表示）
 */

import { useState, useEffect } from "react";
import type { Question } from "@/data/questions";
import { parseCountDisplay } from "@/utils/countDisplay";
import { parseSituation } from "@/utils/situationDisplay";

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
  secondsLeft: number;
  onSelect: (choiceId: string) => void;
}

const STATS_OPTIONS: RequestInit = { cache: "no-store" };

export default function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  secondsLeft,
  onSelect,
}: QuestionViewProps) {
  const countParsed = parseCountDisplay(question.count);
  const situationParsed = parseSituation(question.situation);
  const [stats, setStats] = useState<QuestionStatsDisplay | null>(null);

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

  /** メイン表示: B/S + 塁状況 または 従来表示（統計問題など） */
  const showMainCountAndBase =
    countParsed && situationParsed;

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
      <p className="text-xs text-gray-400 w-full text-center">
        {questionNumber}/{totalQuestions} · 残り{secondsLeft}秒
      </p>

      <div className="flex-1 flex flex-col items-center justify-center w-full py-4">
        {/* 補助: 回・アウト（小さく） */}
        {situationParsed && (
          <p className="text-xs text-gray-400 text-center mb-2">
            {situationParsed.inningOuts}
          </p>
        )}

        {/* メイン: B/Sカウント + 塁状況 を大きく中央 */}
        {showMainCountAndBase ? (
          <div className="text-center mb-8">
            <p className="text-3xl font-bold text-gray-900 tracking-tight">
              <span className="text-green-600">B{countParsed!.balls}</span>
              <span className="text-red-600"> S{countParsed!.strikes}</span>
              <span className="text-gray-400 mx-2">｜</span>
              <span className="text-gray-900">{situationParsed!.baseSituation}</span>
            </p>
          </div>
        ) : (
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {question.situation}
            </h2>
            <p className="text-sm text-gray-600">
              {countParsed ? (
                <span className="font-semibold">
                  <span className="text-green-600">B{countParsed.balls}</span>
                  <span className="text-gray-400 mx-1">/</span>
                  <span className="text-red-600">S{countParsed.strikes}</span>
                </span>
              ) : (
                question.count
              )}
            </p>
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
              <span className="group-open:hidden">カウントの説明（B/S）を表示</span>
              <span className="hidden group-open:inline">カウントの説明（B/S）を閉じる</span>
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
          {question.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onSelect(choice.id)}
              className="w-full py-4 px-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-medium text-center hover:border-blue-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
