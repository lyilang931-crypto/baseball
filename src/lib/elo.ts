/** 難易度 1〜5（1が易しい → 期待勝率が高い、5が難しい → 期待勝率が低い） */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

const INITIAL_RATING = 1500;
const K = 24;

/**
 * 難易度から期待勝率を算出（1→高、5→低）
 * 難しい問題ほど正解でレートが上がりやすい
 */
function expectedScore(difficulty: DifficultyLevel): number {
  return (6 - difficulty) / 5;
}

/**
 * 正解時の新レートと変動量を計算
 */
export function eloAfterCorrect(
  currentRating: number,
  difficulty: DifficultyLevel
): { newRating: number; delta: number } {
  const expected = expectedScore(difficulty);
  const delta = Math.round(K * (1 - expected));
  return { newRating: currentRating + delta, delta };
}

/**
 * 不正解時の新レートと変動量を計算
 */
export function eloAfterIncorrect(
  currentRating: number,
  difficulty: DifficultyLevel
): { newRating: number; delta: number } {
  const expected = expectedScore(difficulty);
  const delta = Math.round(K * (0 - expected));
  return { newRating: currentRating + delta, delta };
}

export function getInitialRating(): number {
  return INITIAL_RATING;
}

export { K };
