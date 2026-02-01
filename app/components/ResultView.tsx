"use client";

import { useState, useEffect } from "react";
import { useResultSound } from "../hooks/useResultSound";

export interface QuestionStatsResult {
  questionId: string;
  answered_count: number;
  correct_count: number;
  total_attempts: number;
  total_correct: number;
  accuracy: number;
}

type SourceType = "static" | "data";

interface ResultViewProps {
  questionId: string;
  /** 回答直後に親が GET で取得した最新 stats（即反映用） */
  initialStats?: QuestionStatsResult;
  isCorrect: boolean;
  explanation: string;
  sourceLabel: string;
  sourceUrl: string;
  sourceType?: SourceType;
  sourceGameId?: string;
  rating: number;
  ratingDelta: number;
  onNext: () => void;
}

const STATS_OPTIONS: RequestInit = { cache: "no-store" };

export default function ResultView({
  questionId,
  initialStats,
  isCorrect,
  explanation,
  sourceLabel,
  sourceUrl,
  sourceType,
  sourceGameId,
  rating,
  ratingDelta,
  onNext,
}: ResultViewProps) {
  useResultSound(isCorrect);
  const [stats, setStats] = useState<QuestionStatsResult | null>(
    initialStats?.questionId === questionId ? initialStats : null
  );

  useEffect(() => {
    let cancelled = false;
    fetch(
      `/api/stats/question?questionId=${encodeURIComponent(questionId)}`,
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
  }, [questionId]);

  /** トリガー遅延を吸収するため少し後に再取得 */
  useEffect(() => {
    if (!initialStats || initialStats.questionId !== questionId) return;
    const t = setTimeout(() => {
      fetch(
        `/api/stats/question?questionId=${encodeURIComponent(questionId)}`,
        STATS_OPTIONS
      )
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) setStats(data);
        })
        .catch(() => {});
    }, 500);
    return () => clearTimeout(t);
  }, [questionId, initialStats]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        {isCorrect && (
          <div className="mb-4 text-4xl" aria-hidden>
            🎯
          </div>
        )}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isCorrect ? "正解!" : "不正解"}
        </h2>

        <section className="w-full mb-4 text-left">
          <h3 className="text-sm font-bold text-gray-500 mb-1">解説</h3>
          <p className="text-gray-700 text-sm">{explanation}</p>
        </section>

        {(sourceUrl || sourceLabel) ? (
          <section className="w-full mb-4 text-left">
            <h3 className="text-sm font-bold text-gray-500 mb-1">出典</h3>
            <p className="text-gray-700 text-sm">
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {sourceLabel || sourceUrl}
                </a>
              ) : (
                sourceLabel
              )}
              {sourceType === "static" && (
                <span className="text-gray-500 ml-1">（固定）</span>
              )}
              {sourceType === "data" && (
                <span className="text-green-600 ml-1">（実データ）</span>
              )}
              {sourceGameId && (
                <span className="text-gray-400 text-xs ml-1">ID: {sourceGameId}</span>
              )}
            </p>
          </section>
        ) : null}

        {stats != null && (stats.answered_count > 0 || stats.total_attempts > 0) ? (
          <section className="w-full mb-4 text-left">
            <h3 className="text-sm font-bold text-gray-500 mb-1">みんなの正答率</h3>
            <p className="text-gray-700 text-sm">
              正解率: {Math.round(stats.accuracy * 100)}%（
              {stats.correct_count ?? stats.total_correct}人正解 / {stats.answered_count ?? stats.total_attempts}人回答）
            </p>
          </section>
        ) : stats != null && stats.answered_count === 0 && stats.total_attempts === 0 ? null : (
          <section className="w-full mb-4 text-left">
            <p className="text-gray-400 text-sm">集計中</p>
          </section>
        ) }

        <p className="text-center mt-4">
          <span className="text-gray-600">レート: </span>
          <span className="font-bold text-blue-600">
            {rating} ({ratingDelta >= 0 ? "+" : ""}
            {ratingDelta})
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={onNext}
        className="w-full max-w-sm py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors mt-8"
      >
        <span aria-hidden>▶</span>
        次の1球へ
      </button>
    </div>
  );
}
