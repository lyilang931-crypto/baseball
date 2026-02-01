/**
 * デイリー体験（Duolingo型の抽象化）
 * - 1日最大3回まで挑戦可能（1回=5問）
 * - 回数は localStorage で管理（日付が変わったらリセット）
 * - 今日の結果を保存して「今日の結果を見る」で再表示
 * - 日付キーは必ず JST の "YYYY-MM-DD"（toISOString 禁止）
 */

const LAST_PLAYED_KEY = "baseball_quiz_last_played_date";
const TODAY_RESULT_KEY = "baseball_quiz_today_result";
const DAILY_ATTEMPTS_KEY = "baseball_quiz_daily_attempts";
const DAILY_USED_QUESTIONS_KEY = "daily_used_question_ids_v1";

/** 1日の最大挑戦回数 */
export const MAX_DAILY_ATTEMPTS = 3;

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

/** 今日プレイ済みか（1回以上プレイしたか） */
export function hasPlayedToday(): boolean {
  return getLastPlayedDate() === getTodayDate();
}

/** 今日すでに使った挑戦回数（0〜3）。日付が違えば0 */
export function getTodayAttemptsUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const s = localStorage.getItem(DAILY_ATTEMPTS_KEY);
    if (!s) return 0;
    const parsed = JSON.parse(s) as { date?: string; used?: number };
    const today = getTodayDate();
    if (parsed?.date !== today) return 0;
    const used = Number(parsed.used);
    return Number.isFinite(used) && used >= 0 ? Math.min(used, MAX_DAILY_ATTEMPTS) : 0;
  } catch {
    return 0;
  }
}

/** 今日残りの挑戦回数（0〜3） */
export function getTodayAttemptsRemaining(): number {
  return Math.max(0, MAX_DAILY_ATTEMPTS - getTodayAttemptsUsed());
}

/** 1回分の挑戦を消費（セッション完了時に呼ぶ） */
export function consumeOneAttempt(): void {
  if (typeof window === "undefined") return;
  try {
    const today = getTodayDate();
    const used = getTodayAttemptsUsed();
    if (used >= MAX_DAILY_ATTEMPTS) return;
    localStorage.setItem(DAILY_ATTEMPTS_KEY, JSON.stringify({ date: today, used: used + 1 }));
    setLastPlayedToday();
  } catch {
    // ignore
  }
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

/** 今日すでに出題した questionId 一覧（同じ日には再度出題しない）。日付が違えば [] */
export function getDailyUsedQuestionIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(DAILY_USED_QUESTIONS_KEY);
    if (!s) return [];
    const parsed = JSON.parse(s) as { date?: string; used?: string[] };
    const today = getTodayDate();
    if (parsed?.date !== today) return [];
    const used = Array.isArray(parsed.used) ? parsed.used : [];
    return used.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
}

/** 今回出題した questionId を今日の使用済みに追加（セッション確定時に呼ぶ） */
export function addDailyUsedQuestionIds(ids: string[]): void {
  if (typeof window === "undefined" || ids.length === 0) return;
  try {
    const today = getTodayDate();
    const current = getDailyUsedQuestionIds();
    const merged = current.concat(ids);
    const seen: Record<string, true> = {};
    const next: string[] = [];
    for (let i = 0; i < merged.length; i++) {
      const id = merged[i];
      if (!seen[id]) {
        seen[id] = true;
        next.push(id);
      }
    }
    localStorage.setItem(DAILY_USED_QUESTIONS_KEY, JSON.stringify({ date: today, used: next }));
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
