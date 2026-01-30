"use client";

import { useState, useEffect } from "react";
import { useResultSound } from "../hooks/useResultSound";

interface QuestionStats {
  questionId: string;
  total_attempts: number;
  total_correct: number;
  accuracy: number;
}

interface ResultViewProps {
  questionId: string;
  isCorrect: boolean;
  explanation: string;
  sourceLabel: string;
  sourceUrl: string;
  rating: number;
  ratingDelta: number;
  onNext: () => void;
}

export default function ResultView({
  questionId,
  isCorrect,
  explanation,
  sourceLabel,
  sourceUrl,
  rating,
  ratingDelta,
  onNext,
}: ResultViewProps) {
  useResultSound(isCorrect);
  const [stats, setStats] = useState<QuestionStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/stats/question?questionId=${encodeURIComponent(questionId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data) setStats(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [questionId]);

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

        {sourceUrl ? (
          <section className="w-full mb-4 text-left">
            <h3 className="text-sm font-bold text-gray-500 mb-1">出典</h3>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline text-sm break-all"
            >
              {sourceLabel || sourceUrl}
            </a>
          </section>
        ) : null}

        {stats != null && stats.total_attempts > 0 ? (
          <section className="w-full mb-4 text-left">
            <h3 className="text-sm font-bold text-gray-500 mb-1">みんなの正答率</h3>
            <p className="text-gray-700 text-sm">
              みんなの正答率: {Math.round(stats.accuracy * 100)}%（
              {stats.total_attempts}人中{stats.total_correct}人正解）
            </p>
          </section>
        ) : stats != null && stats.total_attempts === 0 ? null : (
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
