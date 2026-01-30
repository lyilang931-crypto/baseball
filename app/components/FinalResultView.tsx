"use client";

/**
 * シェア前提の結果画面（Trivia系上位アプリ型の抽象化）
 * - 結果 = シェア画面。X / LINE を自然に配置
 * - 判断力レベルは名称のみ（数値断定禁止）
 */

import {
  buildShareText,
  getTwitterShareUrl,
  getLineShareUrl,
} from "@/utils/shareText";
import { getLevelLabel } from "@/utils/levelLabel";
import { getStreakCount } from "@/utils/streak";
import ShareCard from "./ShareCard";

interface FinalResultViewProps {
  correctCount: number;
  totalQuestions: number;
  ratingBefore: number;
  ratingAfter: number;
  onBackToStart: () => void;
}

export default function FinalResultView({
  correctCount,
  totalQuestions,
  ratingBefore,
  ratingAfter,
  onBackToStart,
}: FinalResultViewProps) {
  const delta = ratingAfter - ratingBefore;
  const accuracy =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const levelLabel = getLevelLabel(ratingAfter);
  const streak = getStreakCount();

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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">結果</h2>
        <p className="text-gray-600 text-center mb-2">
          {totalQuestions}問中{correctCount}問正解（正答率{Math.round(accuracy)}%）
        </p>
        <p className="text-center mb-2">
          <span className="text-gray-600">レート: </span>
          <span className="font-bold text-blue-600 text-xl">
            {ratingAfter} ({delta >= 0 ? "+" : ""}
            {delta})
          </span>
        </p>
        <p className="text-center text-gray-700 font-medium mb-2">
          あなたの判断力レベル: {levelLabel}
        </p>
        {streak > 0 && (
          <p className="text-center text-gray-500 text-sm mb-6">
            連続: {streak}日
          </p>
        )}
        {streak === 0 && <div className="mb-6" />}

        {/* 結果画面 = シェア画面（X / LINE を自然に配置） */}
        <section className="w-full max-w-sm mt-4 mb-6" aria-label="結果をシェア">
          <p className="text-sm text-gray-500 text-center mb-3">
            結果をシェアする
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => handleShare("twitter")}
              className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              aria-label="Xでシェア"
            >
              <span aria-hidden>𝕏</span>
              Xでシェア
            </button>
            <button
              type="button"
              onClick={() => handleShare("line")}
              className="flex-1 py-3 px-4 rounded-xl bg-[#06C755] text-white font-medium flex items-center justify-center gap-2 hover:bg-[#05b34a] active:bg-[#049c40] transition-colors"
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
          streak={streak > 0 ? streak : undefined}
        />
      </div>

      <button
        type="button"
        onClick={onBackToStart}
        className="w-full max-w-sm py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors mt-8"
      >
        <span aria-hidden>▶</span>
        スタートに戻る
      </button>
    </div>
  );
}
