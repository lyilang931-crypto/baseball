/**
 * 連続日数 Streak（デイリー習慣化）
 * - 1日1回プレイで streak 増加
 * - 日付が途切れたら 1 から再開
 * - localStorage: streakCount, lastPlayedDate は daily.ts と共有（日付は JST で daily が管理）
 */

import { getTodayDate, getYesterdayDate } from "@/lib/daily";

const STREAK_COUNT_KEY = "baseball_quiz_streak_count";

function getStoredStreakCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const s = localStorage.getItem(STREAK_COUNT_KEY);
    if (s == null) return 0;
    const n = parseInt(s, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

function setStoredStreakCount(count: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAK_COUNT_KEY, String(count));
  } catch {
    // ignore
  }
}

/** 現在の連続日数を返す（表示用） */
export function getStreakCount(): number {
  return getStoredStreakCount();
}

/**
 * 今日のプレイ完了時に呼ぶ。lastPlayedDate は呼び出し元で setLastPlayedToday() すること。
 * - 同日内の再プレイは増やさない
 * - 昨日の翌日なら +1
 * - それ以外は 1 にリセット
 * @param lastPlayedDate 保存されている最終プレイ日（YYYY-MM-DD）。daily.getLastPlayedDate() を渡す
 * @returns 更新後の streak 数
 */
export function updateStreakAndReturn(lastPlayedDate: string | null): number {
  if (typeof window === "undefined") return 0;
  const today = getTodayDate();
  const yesterday = getYesterdayDate();

  if (lastPlayedDate === today) {
    return getStoredStreakCount();
  }

  const current = getStoredStreakCount();
  const next = lastPlayedDate === yesterday ? current + 1 : 1;
  setStoredStreakCount(next);
  return next;
}
