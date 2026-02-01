/**
 * 開発者向け: 出題バランス検証
 * 実行例: npx ts-node --esm scripts/debug.ts
 * または ブラウザでアプリ起動後、開発者ツールで
 * import('/src/data/questions').then(m => m.verifySessionQuestionsDistribution(100))
 */
import { verifySessionQuestionsDistribution } from "../src/data/questions";

verifySessionQuestionsDistribution(100);
