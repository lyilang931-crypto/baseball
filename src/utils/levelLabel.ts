/**
 * 比較・競争UX（Trivia系上位アプリ型の抽象化）
 * - 数値断定（全国◯%）は禁止。レート帯で「判断力レベル」の名称のみ表示
 * - 例: プロ野球ファン平均より上 / 経験者クラス
 */

/** レートから判断力レベル名称を返す（数値は出さない） */
export function getLevelLabel(rating: number): string {
  if (rating >= 1600) return "プロ野球ファン平均より上";
  if (rating >= 1400) return "経験者クラス";
  if (rating >= 1200) return "平均付近";
  return "これから伸びる";
}
