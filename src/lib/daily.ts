/**
 * デイリー体験（Duolingo型の抽象化）
 * - 今日プレイ済みかどうかを lastPlayedDate で管理
 * - 日付が変わったら再挑戦可能（JST 基準）
 * - 今日の結果を保存して「今日の結果を見る」で再表示
 * - 日付キーは必ず JST の "YYYY-MM-DD"（toISOString 禁止）
 */

const LAST_PLAYED_KEY = "baseball_quiz_last_played_date";
const TODAY_RESULT_KEY = "baseball_quiz_today_result";

export interface TodayResult {
  correctCount: number;
  totalQuestions: number;
  ratingBefore: number;
  ratingAfter: number;
}

/** JST の "YYYY-MM-DD" を返す（sv-SE でゼロ埋め） */
function formatDateJST(date: Date): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** 今日の日付（JST YYYY-MM-DD） */
export function getTodayDate(): string {
  return formatDateJST(new Date());
}

/** 昨日の日付（JST YYYY-MM-DD） */
export function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return formatDateJST(d);
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

/** 今日の結果を取得（今日プレイしていれば存在）。lastPlayedDate !== todayJST のときは破棄して null */
export function getTodayResult(): TodayResult | null {
  if (typeof window === "undefined") return null;
  try {
    const todayJST = getTodayDate();
    const lastPlayed = getLastPlayedDate();
    if (lastPlayed !== todayJST) {
      localStorage.removeItem(TODAY_RESULT_KEY);
      return null;
    }
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
