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

import { useState, useEffect } from "react";
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
import { isPremiumUser } from "@/lib/monetization";

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
  // SSRとクライアント初期描画時の一致を保証するため、mountedフラグを使用
  const [mounted, setMounted] = useState(false);
  const [streak, setStreak] = useState(0);
  const [premium, setPremium] = useState(false);

  // クライアント側でのみlocalStorageから値を読み込む
  useEffect(() => {
    setMounted(true);
    setStreak(getStreakCount());
    setPremium(isPremiumUser());
  }, []);

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
        {mounted && streak > 0 && (
          <p className="text-center text-gray-500 text-sm mb-6">
            連続: {streak}日
          </p>
        )}
        {(!mounted || streak === 0) && <div className="mb-6" />}

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

      <button
        type="button"
        onClick={onBackToStart}
        className="w-full max-w-sm py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors mt-8"
      >
        <span aria-hidden>&#x25B6;</span>
        スタートに戻る
      </button>

      {/* 広告なし（Pro）導線 */}
      {mounted && !premium && (
        <div className="w-full max-w-sm mt-4 text-center">
          <button
            type="button"
            onClick={() => {
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
