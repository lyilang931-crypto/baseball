/**
 * カウント表記の統一（「XボールYストライクカウント」のみ表示）
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

/** 画面上のカウント表示はこの形式のみ。「XボールYストライクカウント」（省略しない） */
export function formatCountJP(balls: number, strikes: number): string {
  return `${balls}ボール${strikes}ストライクカウント`;
}

/** 文字列内の「カウント X-Y」および単体の「X-Y」を「XボールYストライクカウント」に置換（状況・解説文で統一） */
export function replaceCountInText(str: string): string {
  let s = str.replace(/カウント\s*(\d)-(\d)/g, (_, b, s2) =>
    formatCountJP(Number(b), Number(s2))
  );
  // 単体の X-Y（後続が数字でない場合のみ。例: 「2-2の」「1-2で」「1-2カウントで」）
  s = s.replace(/(^|[\s　、。「」])([0-3])-([0-2])(?=[^\d]|$)/g, (_, g1, b, s2) =>
    g1 + formatCountJP(Number(b), Number(s2))
  );
  // 「カウントカウント」の重複を防止
  s = s.replace(/カウントカウント/g, "カウント");
  return s;
}
