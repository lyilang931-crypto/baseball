/**
 * デイリー体験（Duolingo型の抽象化）
 * - 今日プレイ済みかどうかを lastPlayedDate で管理
 * - 日付が変わったら再挑戦可能
 * - 今日の結果を保存して「今日の結果を見る」で再表示
 */

const LAST_PLAYED_KEY = "baseball_quiz_last_played_date";
const TODAY_RESULT_KEY = "baseball_quiz_today_result";

export interface TodayResult {
  correctCount: number;
  totalQuestions: number;
  ratingBefore: number;
  ratingAfter: number;
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** 今日の日付（YYYY-MM-DD） */
export function getTodayDate(): string {
  return todayString();
}

/** 最後にプレイした日付。未プレイなら null */
export function getLastPlayedDate(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(LAST_PLAYED_KEY);
    return s || null;
  } catch {
    return null;
  }
}

/** 今日プレイ済みか */
export function hasPlayedToday(): boolean {
  return getLastPlayedDate() === getTodayDate();
}

/** 最終プレイ日を今日で保存（セッション完了時に呼ぶ） */
export function setLastPlayedToday(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_PLAYED_KEY, getTodayDate());
  } catch {
    // ignore
  }
}

/** 今日の結果を保存 */
export function setTodayResult(result: TodayResult): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TODAY_RESULT_KEY, JSON.stringify(result));
  } catch {
    // ignore
  }
}

/** 今日の結果を取得（今日プレイしていれば存在） */
export function getTodayResult(): TodayResult | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(TODAY_RESULT_KEY);
    if (s == null) return null;
    const parsed = JSON.parse(s) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      "correctCount" in parsed &&
      "totalQuestions" in parsed &&
      "ratingBefore" in parsed &&
      "ratingAfter" in parsed
    ) {
      return parsed as TodayResult;
    }
    return null;
  } catch {
    return null;
  }
}
