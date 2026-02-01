/**
 * カウント表記の統一（ストライク/ボールの混同を防ぐ）
 * UI表示は「カウント：1-2」+ 補助「(ボール 1 / ストライク 2)」に統一。
 * B/S 表記は内部・非表示用途のみ。
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

/** UI用メイン表示「カウント：1-2」（数字部分はコンポーネントで色分けする想定） */
export function formatCountMain(balls: number, strikes: number): string {
  return `カウント：${balls}-${strikes}`;
}

/** UI用補助表示「(ボール 1 / ストライク 2)」*/
export function formatCountSub(balls: number, strikes: number): string {
  return `（ボール ${balls} / ストライク ${strikes}）`;
}

/** 内部用 B/S 短い文字列 "B0 S2"（UIには表示しない） */
export function formatCountShort(balls: number, strikes: number): string {
  return `B${balls} S${strikes}`;
}

/** 日本語併記 "ボール0 ストライク2" */
export function formatCountLong(balls: number, strikes: number): string {
  return `ボール${balls} ストライク${strikes}`;
}
