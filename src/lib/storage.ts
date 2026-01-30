const RATING_KEY = "baseball_quiz_rating";
const HISTORY_KEY = "baseball_quiz_history";

export interface HistoryEntry {
  questionId: number;
  correct: boolean;
  ratingBefore: number;
  ratingAfter: number;
  difficulty: number;
  timestamp: number;
}

/**
 * レーティングを取得（未保存なら初期値）
 */
export function getRating(initialRating: number): number {
  if (typeof window === "undefined") return initialRating;
  try {
    const s = localStorage.getItem(RATING_KEY);
    if (s == null) return initialRating;
    const n = Number(s);
    return Number.isFinite(n) ? n : initialRating;
  } catch {
    return initialRating;
  }
}

/**
 * レーティングを保存
 */
export function setRating(rating: number): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(RATING_KEY, String(rating));
  } catch {
    // ignore
  }
}

/**
 * 履歴を取得
 */
export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const s = localStorage.getItem(HISTORY_KEY);
    if (s == null) return [];
    const parsed = JSON.parse(s) as unknown;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * 履歴に1件追加して保存
 */
export function appendHistory(entry: HistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const list = getHistory();
    list.push(entry);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}
