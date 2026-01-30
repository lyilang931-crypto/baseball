/**
 * SNSシェア用テキスト生成（シェア前提の結果画面 = 自慢・挑戦誘導）
 * 含めるもの: 正解率, レート, 「あなたならどうする？」, 公開URL
 * 全国◯%などの数値断定は禁止（後でDB対応時に差し替え可能）
 */

export interface ShareTextParams {
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  /** レート（シェア文に含める） */
  rating?: number;
  url: string;
}

export interface ShareTextResult {
  twitterText: string;
  lineText: string;
}

export function buildShareText(params: ShareTextParams): ShareTextResult {
  const { correctCount, totalQuestions, accuracy, rating, url } = params;

  const accuracyPercent = Math.round(accuracy);
  const resultLine = `結果：${correctCount}/${totalQuestions} 正解（正答率${accuracyPercent}%）`;
  const ratingLine = rating != null ? `レート ${rating}` : "";

  const twitterParts = [
    "今日の1球、あなたならどうする？",
    resultLine,
    ...(ratingLine ? [ratingLine] : []),
    "",
    "▼あなたも挑戦",
    url,
    "",
    "#今日の1球 #野球IQ #野球クイズ",
  ];
  const twitterText = twitterParts.join("\n");

  const lineParts = [
    "⚾ 今日の1球",
    `正解率${accuracyPercent}%（${correctCount}/${totalQuestions}）`,
    ...(ratingLine ? [ratingLine] : []),
    "あなたも挑戦してみて👇",
    url,
  ];
  const lineText = lineParts.join("\n");

  return { twitterText, lineText };
}

/**
 * X（Twitter）のシェア用URLを生成
 */
export function getTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
}

/**
 * LINEのシェア用URLを生成
 */
export function getLineShareUrl(text: string, url: string): string {
  return `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}
