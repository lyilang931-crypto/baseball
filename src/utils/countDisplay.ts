/**
 * カウント表記の B/S 統一（ストライク/ボールの混同を防ぐ）
 * "カウント 0-2" → B0 S2（ボール0 ストライク2）
 */

const COUNT_REGEX = /カウント\s*(\d)-(\d)/;

/** "カウント X-Y" をパース。X=ボール, Y=ストライク。該当しなければ null */
export function parseCountDisplay(countStr: string): { balls: number; strikes: number } | null {
  const m = countStr.trim().match(COUNT_REGEX);
  if (!m) return null;
  const balls = parseInt(m[1], 10);
  const strikes = parseInt(m[2], 10);
  if (Number.isNaN(balls) || Number.isNaN(strikes)) return null;
  return { balls, strikes };
}

/** B/S 表記の短い文字列 "B0 S2" */
export function formatCountShort(balls: number, strikes: number): string {
  return `B${balls} S${strikes}`;
}

/** 日本語併記 "ボール0 ストライク2" */
export function formatCountLong(balls: number, strikes: number): string {
  return `ボール${balls} ストライク${strikes}`;
}
