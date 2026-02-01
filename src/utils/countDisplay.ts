/**
 * カウント表記の統一（「XボールYストライク」のみ表示）
 * "カウント 1-2" または "1-2" をパースして balls/strikes を復元し、formatCountJP で表示する。
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

/** 画面上のカウント表示はこの形式のみ。「XボールYストライク」 */
export function formatCountJP(balls: number, strikes: number): string {
  return `${balls}ボール${strikes}ストライク`;
}
