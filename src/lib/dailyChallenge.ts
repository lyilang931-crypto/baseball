/**
 * デイリーチャレンジ（毎日同じ問題セット）
 * - 日付をシードにして全ユーザー同じ5問を出題
 * - 1日1回のみ挑戦可能
 * - 完了状態は localStorage で管理
 */

import { hashSeed, shuffleWithSeed } from "@/utils/seededShuffle";
import { getTodayDate } from "@/lib/daily";
import type { Question } from "@/data/questions";
import { filterPitchingQuestions } from "@/data/questions";

const DAILY_CHALLENGE_KEY = "baseball_quiz_daily_challenge";

export interface DailyChallengeState {
  /** 挑戦した日付（YYYY-MM-DD） */
  date: string;
  /** 完了したか */
  completed: boolean;
  /** 正解数 */
  correctCount: number;
  /** レーティング変動 */
  ratingDelta: number;
}

/** デイリーチャレンジの状態を取得 */
export function getDailyChallengeState(): DailyChallengeState | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(DAILY_CHALLENGE_KEY);
    if (!s) return null;
    const parsed = JSON.parse(s) as Partial<DailyChallengeState>;
    const today = getTodayDate();
    if (parsed.date !== today) return null;
    return {
      date: today,
      completed: parsed.completed ?? false,
      correctCount: parsed.correctCount ?? 0,
      ratingDelta: parsed.ratingDelta ?? 0,
    };
  } catch {
    return null;
  }
}

/** デイリーチャレンジの結果を保存 */
export function saveDailyChallengeResult(
  correctCount: number,
  ratingDelta: number
): void {
  if (typeof window === "undefined") return;
  try {
    const today = getTodayDate();
    localStorage.setItem(
      DAILY_CHALLENGE_KEY,
      JSON.stringify({
        date: today,
        completed: true,
        correctCount,
        ratingDelta,
      })
    );
  } catch {
    // ignore
  }
}

/** 今日のデイリーチャレンジが完了済みか */
export function isDailyChallengeCompleted(): boolean {
  const state = getDailyChallengeState();
  return state?.completed ?? false;
}

/**
 * 日付をシードにして問題プールから5問を決定的に選ぶ。
 * 全ユーザーに同じ問題セットが出る。
 * 汎用関数：全問題から選択（既存機能維持のため変更なし）
 * @param allQuestions 全問題プール
 * @param count 出題数（デフォルト5）
 */
export function getDailyChallengeQuestions<T>(
  allQuestions: T[],
  count: number = 5
): T[] {
  const today = getTodayDate();
  const seed = hashSeed(`daily-challenge-${today}`);
  const shuffled = shuffleWithSeed(allQuestions, seed);
  return shuffled.slice(0, count);
}

/**
 * 配球チャレンジ用：mode === "pitching" の問題のみを対象とするデイリーチャレンジ
 * @param allQuestions 全問題プール
 * @param count 出題数（デフォルト5）
 */
export function getPitchingDailyChallengeQuestions(
  allQuestions: Question[],
  count: number = 5
): Question[] {
  // filterPitchingQuestions を通してから getDailyChallengeQuestions を呼ぶ
  const pitchingQuestions = filterPitchingQuestions(allQuestions);
  
  if (pitchingQuestions.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[getPitchingDailyChallengeQuestions] No pitching questions available"
      );
    }
    return [];
  }

  if (pitchingQuestions.length < count) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[getPitchingDailyChallengeQuestions] Only ${pitchingQuestions.length} pitching questions available, requested ${count}`
      );
    }
  }

  // 汎用関数を使って日付シードで選択
  return getDailyChallengeQuestions(pitchingQuestions, count);
}
