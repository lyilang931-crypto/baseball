"use client";

/**
 * 任意の報酬型広告ボタン（1日1回制限）
 * - ユーザーが自分で押した時だけ広告を表示
 * - 報酬: 「今日の配球ヒント」解放 or streak +1 ボーナス
 * - 1日1回まで（localStorage で日付管理）
 * - プレミアムユーザーには非表示
 */

import { useState, useEffect } from "react";
import { isPremiumUser } from "@/lib/monetization";

const REWARD_AD_KEY = "baseball_quiz_reward_ad";

interface RewardAdState {
  /** 最後に報酬を受け取った日（YYYY-MM-DD） */
  lastRewardDate: string;
  /** 今日受け取った報酬 */
  rewardClaimed: boolean;
}

function getTodayJST(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getRewardState(): RewardAdState {
  if (typeof window === "undefined") return { lastRewardDate: "", rewardClaimed: false };
  try {
    const s = localStorage.getItem(REWARD_AD_KEY);
    if (!s) return { lastRewardDate: "", rewardClaimed: false };
    const parsed = JSON.parse(s) as Partial<RewardAdState>;
    const today = getTodayJST();
    if (parsed.lastRewardDate !== today) {
      return { lastRewardDate: "", rewardClaimed: false };
    }
    return { lastRewardDate: today, rewardClaimed: parsed.rewardClaimed ?? false };
  } catch {
    return { lastRewardDate: "", rewardClaimed: false };
  }
}

function claimReward(): void {
  if (typeof window === "undefined") return;
  try {
    const today = getTodayJST();
    localStorage.setItem(
      REWARD_AD_KEY,
      JSON.stringify({ lastRewardDate: today, rewardClaimed: true })
    );
  } catch {
    // ignore
  }
}

export function hasClaimedTodayReward(): boolean {
  return getRewardState().rewardClaimed;
}

interface RewardedAdButtonProps {
  /** 報酬受取後のコールバック */
  onRewardClaimed?: () => void;
}

export default function RewardedAdButton({ onRewardClaimed }: RewardedAdButtonProps) {
  const [mounted, setMounted] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setMounted(true);
    setClaimed(getRewardState().rewardClaimed);
  }, []);

  if (!mounted) return null;
  if (isPremiumUser()) return null;
  if (claimed) {
    if (!showHint) return null;
    return (
      <div className="w-full max-w-sm mx-auto my-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
        <p className="font-medium mb-1">今日の配球メモ</p>
        <p>追い込んだら「打者の意識の逆」を突く。ストレート待ちには変化球、変化球待ちにはストレート。</p>
      </div>
    );
  }

  const handleClick = () => {
    // TODO: 本番では広告SDK (AdMob rewarded) を呼び出し、
    // 視聴完了コールバックで claimReward() を実行する。
    // 現在は即座に報酬を付与する。
    claimReward();
    setClaimed(true);
    setShowHint(true);
    onRewardClaimed?.();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full max-w-sm mx-auto my-3 py-3 px-4 rounded-xl border-2 border-amber-300 bg-amber-50 text-amber-800 text-sm font-medium flex items-center justify-center gap-2 hover:border-amber-400 hover:bg-amber-100 active:bg-amber-200 transition-colors"
    >
      <span aria-hidden>&#x1F4A1;</span>
      今日の配球ヒントを見る（広告を見る）
    </button>
  );
}
