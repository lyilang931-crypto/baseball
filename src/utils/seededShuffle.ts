/**
 * 選択肢表示順の安定シャッフル用（seeded shuffle）
 * 同じ seed なら同じ並びになり、リロードでもブレない。
 */

/** 文字列から 32bit シードを生成（簡易ハッシュ） */
export function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h = (h << 5) - h + c;
    h |= 0;
  }
  return h >>> 0;
}

/** Mulberry32 擬似乱数生成器（軽量・外部依存なし） */
function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher–Yates で配列をシャッフル（seed 固定で同じ並びになる）
 */
export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const arr = [...array];
  const rng = mulberry32(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 今日の日付を JST で yyyy-mm-dd に（選択肢 seed 用） */
export function getTodayJST(): string {
  if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
    return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Tokyo" });
  }
  const d = new Date();
  const jst = new Date(d.getTime() + (9 * 60 * 60 * 1000));
  const y = jst.getUTCFullYear();
  const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
  const day = String(jst.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
