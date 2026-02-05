/**
 * 問題品質バリデーション（Phase 2: mikan風品質管理）
 * - 問題文の長さチェック
 * - 選択肢のトーン統一チェック
 * - 重複表現検出
 *
 * ビルドは落とさず、開発時に警告を出す
 */

export interface ValidationWarning {
  questionId: number;
  type: "LENGTH" | "DUPLICATE_PHRASE" | "CHOICE_TONE" | "CHOICE_LENGTH";
  message: string;
}

/** 問題文の最大推奨長（これを超えたら警告） */
const MAX_SITUATION_LENGTH = 60;

/** 選択肢の長さ差（最長と最短の比率がこれを超えたら警告） */
const CHOICE_LENGTH_RATIO_THRESHOLD = 3;

/**
 * 問題文が長すぎないかチェック
 */
export function checkSituationLength(
  questionId: number,
  situation: string
): ValidationWarning | null {
  if (situation.length > MAX_SITUATION_LENGTH) {
    return {
      questionId,
      type: "LENGTH",
      message: `問題文が${situation.length}文字（推奨${MAX_SITUATION_LENGTH}以下）: "${situation.slice(0, 30)}..."`,
    };
  }
  return null;
}

/**
 * 同語・同表現の重複を検出
 * 例: "0ボール2ストライク" が2回出る、"球速が遅い球種"の重複など
 */
export function checkDuplicatePhrases(
  questionId: number,
  situation: string,
  count: string
): ValidationWarning | null {
  const combined = situation + " " + count;

  // ボール・ストライク表現の重複
  const countMatches = combined.match(/\d[ボール|B].*?\d[ストライク|S]/g);
  if (countMatches && countMatches.length > 1) {
    return {
      questionId,
      type: "DUPLICATE_PHRASE",
      message: `カウント表現が重複: ${countMatches.join(", ")}`,
    };
  }

  // 3文字以上の同一単語が2回以上出現
  const words = combined.match(/[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]{3,}/g);
  if (words) {
    const freq = new Map<string, number>();
    for (const w of words) {
      freq.set(w, (freq.get(w) || 0) + 1);
    }
    const keys = Array.from(freq.keys());
    for (const word of keys) {
      const cnt = freq.get(word) || 0;
      if (cnt >= 2 && !["ストライク", "ボール", "カウント"].includes(word)) {
        return {
          questionId,
          type: "DUPLICATE_PHRASE",
          message: `"${word}"が${cnt}回重複`,
        };
      }
    }
  }

  return null;
}

/**
 * 選択肢のトーン（文章 vs 単語）の不一致を検出
 * 1つだけ長文で他が短い場合など
 */
export function checkChoiceTone(
  questionId: number,
  choices: { id: string; text: string }[]
): ValidationWarning | null {
  if (choices.length < 2) return null;

  const lengths = choices.map((c) => c.text.length);
  const maxLen = Math.max(...lengths);
  const minLen = Math.min(...lengths);

  // 長さの比率チェック
  if (minLen > 0 && maxLen / minLen > CHOICE_LENGTH_RATIO_THRESHOLD) {
    return {
      questionId,
      type: "CHOICE_LENGTH",
      message: `選択肢の長さにばらつき（最短${minLen}字 / 最長${maxLen}字）`,
    };
  }

  // 文末の統一性チェック（「。」で終わるものと終わらないものが混在）
  const endsWithPeriod = choices.filter((c) => c.text.endsWith("。")).length;
  if (endsWithPeriod > 0 && endsWithPeriod < choices.length) {
    return {
      questionId,
      type: "CHOICE_TONE",
      message: `選択肢の文末が不統一（${endsWithPeriod}/${choices.length}が「。」で終わる）`,
    };
  }

  return null;
}

/**
 * 問題文の短文化ユーティリティ
 * 意味を変えずに冗長表現を削減
 */
export function shortenQuestionText(text: string): string {
  let result = text;

  // "2023年MLBで、" → "2023年MLB："
  result = result.replace(/(\d{4}年)(MLB|NPB)で[、,]\s*/g, "$1$2：");

  // "〜の空振り率(Whiff%)が最も高かった球種は？" → "〜のWhiff%が最も高い球種は？"
  result = result.replace(/の空振り率\s*\(Whiff%\)/g, "のWhiff%");
  result = result.replace(/が最も高かった/g, "が最も高い");
  result = result.replace(/が最も低かった/g, "が最も低い");

  // "球速が遅い球種" → 球種カテゴリで既に低速なら削減
  // (これは文脈依存なので安全な変換のみ)
  result = result.replace(/球速が遅い(チェンジアップ|カーブ|スライダー)/g, "$1");

  // "次のうち" の削除（選択肢があることは自明）
  result = result.replace(/次のうち[、,]?\s*/g, "");

  // "正しいのはどれ？" → "正しいのは？"
  result = result.replace(/正しいのはどれ[？?]/g, "正しいのは？");

  // 連続する読点を1つに
  result = result.replace(/[、,]{2,}/g, "、");

  return result;
}

/**
 * 全問題に対して品質チェックを実行
 * @returns 警告リスト（ビルドは落とさない）
 */
export function validateAllQuestions(
  questions: Array<{
    id: number;
    situation: string;
    count: string;
    choices: { id: string; text: string }[];
  }>
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const q of questions) {
    const lengthWarn = checkSituationLength(q.id, q.situation);
    if (lengthWarn) warnings.push(lengthWarn);

    const dupWarn = checkDuplicatePhrases(q.id, q.situation, q.count);
    if (dupWarn) warnings.push(dupWarn);

    const toneWarn = checkChoiceTone(q.id, q.choices);
    if (toneWarn) warnings.push(toneWarn);
  }

  return warnings;
}

/**
 * 開発時に警告を出力（ビルドは落とさない）
 */
export function logValidationWarnings(warnings: ValidationWarning[]): void {
  if (warnings.length === 0) {
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("[questionValidation] 全問題の品質チェックOK");
    }
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(`[questionValidation] ${warnings.length}件の品質警告:`);
  for (const w of warnings) {
    // eslint-disable-next-line no-console
    console.warn(`  - [id=${w.questionId}] ${w.type}: ${w.message}`);
  }
}
