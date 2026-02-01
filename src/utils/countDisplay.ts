/**
 * カウント表記の統一（B/S を常時表示して迷い防止）
 * メイン: B{balls} | S{strikes}、補助: （nボールnストライク）
 * "カウント 1-2" または "1-2" をパースして balls/strikes を復元。
 */

const COUNT_REGEX = /カウント\s*(\d)-(\d)/;
const PLAIN_XY_REGEX = /^(\d)-(\d)$/;

/** "カウント X-Y" または "X-Y" をパース。X=ボール, Y=ストライク。該当しなければ null */
export function parseCountDisplay(countStr: string): { balls: number; strikes: number } | null {
  const s = countStr.trim();
  let m = s.match(COUNT_REGEX);
  if (!m) m = s.match(PLAIN_XY_REGEX);
  if (!m) return null;
  const balls = parseInt(m[1], 10);
  const strikes = parseInt(m[2], 10);
  if (Number.isNaN(balls) || Number.isNaN(strikes)) return null;
  return { balls, strikes };
}

/** 補助表示「（nボールnストライク）」*/
export function formatCountSub(balls: number, strikes: number): string {
  return `（${balls}ボール${strikes}ストライク）`;
}

/** 内部用 B/S 短い文字列 "B0 S2"（UIには表示しない） */
export function formatCountShort(balls: number, strikes: number): string {
  return `B${balls} S${strikes}`;
}

/** 日本語併記 "ボール0 ストライク2" */
export function formatCountLong(balls: number, strikes: number): string {
  return `ボール${balls} ストライク${strikes}`;
}
