/**
 * 状況表示の分解（回・アウト / 塁状況）
 * "9回裏・2アウト・満塁" → { inningOuts: "9回裏・2アウト", baseSituation: "満塁" }
 */

/** 塁状況らしい文字列か（満塁, 1塁, 2塁3塁, 走者なし 等） */
function looksLikeBaseSituation(s: string): boolean {
  const t = s.trim();
  return t === "走者なし" || t.includes("塁");
}

/**
 * situation を「回・アウト」と「塁状況」に分離する。
 * "9回裏・2アウト・満塁" 形式なら { inningOuts, baseSituation }、それ以外は null。
 */
export function parseSituation(
  situation: string
): { inningOuts: string; baseSituation: string } | null {
  const parts = situation.split("・").map((p) => p.trim());
  if (parts.length < 3) return null;
  const last = parts[parts.length - 1];
  if (!looksLikeBaseSituation(last)) return null;
  const inningOuts = parts.slice(0, -1).join("・");
  return { inningOuts, baseSituation: last };
}
