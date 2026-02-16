/**
 * 「明日の予告」機能
 * 明日の日付をシードにテーマを決定的に選択し、
 * 結果画面で「明日はこのテーマ」と予告して再訪を促す。
 */

import { hashSeed } from "@/utils/seededShuffle";

/** JST で明日の日付を "YYYY-MM-DD" で返す */
export function getTomorrowDateJST(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export interface TomorrowPreview {
  /** テーマ名（短め） */
  theme: string;
  /** 興味を引くサブテキスト */
  teaser: string;
}

/**
 * 明日の予告テーマ一覧
 * - 好奇心ギャップを作る（答えが気になる）
 * - 実際の問題内容と完全一致する必要はない（テーマ的方向性）
 * - 14個 = 2週間でローテーション
 */
const THEMES: TomorrowPreview[] = [
  { theme: "決め球の選択", teaser: "追い込んだ後、何を投げる？" },
  { theme: "ピンチの配球", teaser: "満塁のマウンドで問われる判断" },
  { theme: "初球の入り方", teaser: "最初の1球が勝負を決める" },
  { theme: "フルカウントの心理戦", teaser: "3-2から投げるべき球は？" },
  { theme: "左右の駆け引き", teaser: "左打者への定石、知ってる？" },
  { theme: "リード時の攻め方", teaser: "勝ってる時こそ難しい配球" },
  { theme: "速球 vs 変化球", teaser: "データが覆す常識がある" },
  { theme: "クリーンナップ攻略", teaser: "強打者を抑える頭脳戦" },
  { theme: "データ野球の真実", teaser: "数字が語る意外な事実" },
  { theme: "名勝負の判断力", teaser: "あの場面、あなたならどうする？" },
  { theme: "カウント別の戦略", teaser: "有利カウントの使い方が問われる" },
  { theme: "投手 vs 打者の読み合い", teaser: "相手の裏をかく1球" },
  { theme: "セオリーの盲点", teaser: "定説を疑えるか？" },
  { theme: "勝負どころの1球", teaser: "ここぞの場面での選択" },
];

/**
 * 明日の予告テーマを返す（全ユーザー同じ結果）
 */
export function getTomorrowPreview(): TomorrowPreview {
  const tomorrow = getTomorrowDateJST();
  const seed = hashSeed(`tomorrow-preview-${tomorrow}`);
  const index = seed % THEMES.length;
  return THEMES[index];
}
