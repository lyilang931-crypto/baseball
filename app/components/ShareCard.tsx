"use client";

/**
 * シェア用カード画像の生成・ダウンロード・共有
 * Canvas でカード画像を生成し、ダウンロード or Web Share API で共有
 */

import { useState, useCallback } from "react";
import { generateShareImage } from "@/utils/generateShareImage";
import { getLevelLabel } from "@/utils/levelLabel";

interface ShareCardProps {
  correctCount: number;
  totalQuestions: number;
  ratingAfter: number;
  ratingDelta?: number;
  streak?: number;
}

export default function ShareCard({
  correctCount,
  totalQuestions,
  ratingAfter,
  ratingDelta = 0,
  streak = 0,
}: ShareCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accuracy =
    totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const levelLabel = getLevelLabel(ratingAfter);

  const handleCreateAndShare = useCallback(async () => {
    if (typeof window === "undefined") return;
    setLoading(true);
    setError(null);
    try {
      const url = window.location.origin;
      const blob = await generateShareImage({
        correctCount,
        totalQuestions,
        accuracy,
        rating: ratingAfter,
        ratingDelta,
        streak: streak > 0 ? streak : undefined,
        levelLabel,
        url,
      });

      const file = new File(
        [blob],
        `今日の1球_${correctCount}-${totalQuestions}.png`,
        { type: "image/png" }
      );

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "今日の1球",
          text: "あなたなら、どうする？",
          files: [file],
        });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "画像の生成に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, [
    correctCount,
    totalQuestions,
    accuracy,
    ratingAfter,
    ratingDelta,
    streak,
    levelLabel,
  ]);

  const handleDownloadOnly = useCallback(async () => {
    if (typeof window === "undefined") return;
    setLoading(true);
    setError(null);
    try {
      const url = window.location.origin;
      const blob = await generateShareImage({
        correctCount,
        totalQuestions,
        accuracy,
        rating: ratingAfter,
        ratingDelta,
        streak: streak > 0 ? streak : undefined,
        levelLabel,
        url,
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `今日の1球_${correctCount}-${totalQuestions}.png`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "画像の生成に失敗しました"
      );
    } finally {
      setLoading(false);
    }
  }, [
    correctCount,
    totalQuestions,
    accuracy,
    ratingAfter,
    ratingDelta,
    streak,
    levelLabel,
  ]);

  return (
    <section className="w-full max-w-sm mt-4 mb-4" aria-label="シェア画像">
      <p className="text-sm text-gray-500 text-center mb-3">
        シェア画像を作成
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCreateAndShare}
          disabled={loading}
          className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium text-sm flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? "作成中…" : "作成して共有"}
        </button>
        <button
          type="button"
          onClick={handleDownloadOnly}
          disabled={loading}
          className="flex-1 py-3 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-900 font-medium text-sm flex items-center justify-center gap-2 hover:border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
        >
          {loading ? "…" : "画像を保存"}
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm text-center mt-2">{error}</p>
      )}
      <p className="text-xs text-gray-400 text-center mt-2">
        保存した画像をXやLINEに投稿してシェアできます
      </p>
    </section>
  );
}
