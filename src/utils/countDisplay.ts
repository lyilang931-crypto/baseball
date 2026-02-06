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

/** カウントの簡潔な表示（見出し用）: "0-2" 形式 */
export function formatCountCompact(balls: number, strikes: number): string {
  return `${balls}-${strikes}`;
}

/** カウントの明示的表示（配球チャレンジ見出し用）: "B0–S2" 形式（B=ボール、S=ストライク） */
export function formatCountBS(balls: number, strikes: number): string {
  return `B${balls}–S${strikes}`;
}

/** 文字列内のカウント情報を完全に削除（本文表示用） */
export function removeCountFromText(str: string): string {
  let s = str;
  // 「カウント X-Y」形式を削除
  s = s.replace(/カウント\s*(\d)-(\d)/g, "");
  // 単体の X-Y（カウントとして解釈されるもの）を削除
  s = s.replace(/(^|[\s　、。「」])([0-3])-([0-2])(?=[^\d]|$)/g, "$1");
  // 「XボールYストライクカウント」形式を削除
  s = s.replace(/(\d)ボール(\d)ストライクカウント/g, "");
  // 余分な空白・句読点を整理
  s = s.replace(/\s*[、。]\s*/g, "・").replace(/\s+/g, " ").trim();
  // 空になった場合は元の文字列を返す（削除しすぎを防止）
  return s || str;
}

/** 短縮表記（サブ行用）: "(0B-2S)" 形式 */
export function formatCountShort(balls: number, strikes: number): string {
  return `(${balls}B-${strikes}S)`;
}

/** 文字列内のカウント表記を短縮表記に置き換える（サブ行用） */
export function replaceCountToShort(str: string): string {
  let s = str.replace(/カウント\s*(\d)-(\d)/g, (_, b, s2) =>
    formatCountShort(Number(b), Number(s2))
  );
  // 単体の X-Y を短縮表記に
  s = s.replace(/(^|[\s　、。「」])([0-3])-([0-2])(?=[^\d]|$)/g, (_, g1, b, s2) =>
    g1 + formatCountShort(Number(b), Number(s2))
  );
  // 「XボールYストライクカウント」形式も短縮表記に置き換え
  s = s.replace(/(\d)ボール(\d)ストライクカウント/g, (_, b, s2) =>
    formatCountShort(Number(b), Number(s2))
  );
  return s;
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
