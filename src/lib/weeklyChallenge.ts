/**
 * 週間チャレンジ（月曜リセット）
 * - 週の合計正答数でランク付与
 * - localStorage のみ（DB変更なし）
 * - 月曜 0:00 JST で自動リセット
 */

import { getTodayDate } from "@/lib/daily";

const WEEKLY_KEY = "bq_weekly_challenge";

export interface WeeklyState {
  /** 今週の月曜日 (YYYY-MM-DD) */
  weekStart: string;
  /** 今週の合計正答数 */
  correctTotal: number;
  /** 今週の合計出題数 */
  questionTotal: number;
  /** 今週のセッション数 */
  sessionCount: number;
  /** 今週プレイした日数 */
  daysPlayed: string[];
}

export interface WeeklyRank {
  /** ランク名 */
  title: string;
  /** 色クラス（Tailwind） */
  color: string;
  /** 必要正答数 */
  threshold: number;
}

/** 今週の月曜日を JST で取得 */
export function getCurrentWeekMonday(): string {
  const now = new Date();
  // JST に変換
  const jstOffset = 9 * 60;
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const jstDate = new Date(now.getTime() + jstOffset * 60000);

  const day = jstDate.getUTCDay(); // 0=Sun, 1=Mon
  const diff = day === 0 ? 6 : day - 1; // Mon=0, Tue=1, ..., Sun=6
  const monday = new Date(jstDate);
  monday.setUTCDate(monday.getUTCDate() - diff);

  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const d = String(monday.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 週間ランク定義（正答数ベース） */
const RANKS: WeeklyRank[] = [
  { title: "レジェンド", color: "text-red-500", threshold: 60 },
  { title: "エース", color: "text-amber-500", threshold: 40 },
  { title: "レギュラー", color: "text-blue-500", threshold: 20 },
  { title: "ルーキー", color: "text-gray-500", threshold: 0 },
];

/** 正答数からランクを取得 */
export function getWeeklyRank(correctTotal: number): WeeklyRank {
  for (const rank of RANKS) {
    if (correctTotal >= rank.threshold) return rank;
  }
  return RANKS[RANKS.length - 1];
}

/** 次のランクまでの残り正答数（最上位なら null） */
export function getNextRankGap(correctTotal: number): { nextTitle: string; gap: number } | null {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (correctTotal < RANKS[i].threshold) {
      return { nextTitle: RANKS[i].title, gap: RANKS[i].threshold - correctTotal };
    }
  }
  return null;
}

/** 今週の状態を取得。週が変わっていたら自動リセット */
export function getWeeklyState(): WeeklyState {
  const weekStart = getCurrentWeekMonday();
  const empty: WeeklyState = {
    weekStart,
    correctTotal: 0,
    questionTotal: 0,
    sessionCount: 0,
    daysPlayed: [],
  };

  if (typeof window === "undefined") return empty;

  try {
    const raw = localStorage.getItem(WEEKLY_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as Partial<WeeklyState>;
    // 週が変わっていたらリセット
    if (parsed.weekStart !== weekStart) return empty;
    return {
      weekStart,
      correctTotal: parsed.correctTotal ?? 0,
      questionTotal: parsed.questionTotal ?? 0,
      sessionCount: parsed.sessionCount ?? 0,
      daysPlayed: Array.isArray(parsed.daysPlayed) ? parsed.daysPlayed : [],
    };
  } catch {
    return empty;
  }
}

/** セッション完了時に呼ぶ。今週の状態を更新 */
export function addWeeklySession(correct: number, total: number): WeeklyState {
  if (typeof window === "undefined") {
    return getWeeklyState();
  }
  const state = getWeeklyState();
  state.correctTotal += correct;
  state.questionTotal += total;
  state.sessionCount += 1;

  const today = getTodayDate();
  if (!state.daysPlayed.includes(today)) {
    state.daysPlayed.push(today);
  }

  try {
    localStorage.setItem(WEEKLY_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
  return state;
}
