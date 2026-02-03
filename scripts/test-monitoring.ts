/**
 * 監視システムテストスクリプト
 *
 * 使い方:
 * npx tsx scripts/test-monitoring.ts
 *
 * または開発サーバー起動後:
 * curl http://localhost:3000/api/health
 * curl http://localhost:3000/api/monitoring
 */

import {
  logger,
  tracker,
  performance,
  context,
  getLogs,
  getMetrics,
  getStats,
  clearLogs,
  errorToContext,
} from "../src/lib/monitoring";

console.log("=== 監視システムテスト開始 ===\n");

// テスト1: 基本的なログ出力
console.log("1. 基本ログテスト");
context.setRequestId();
logger.debug("デバッグメッセージ", { key: "value" });
logger.info("情報メッセージ", { userId: "test-user" });
logger.warn("警告メッセージ", { code: 400 });
logger.error("エラーメッセージ", { stack: "test stack" });
console.log(`   ログ数: ${getLogs().length}`);
console.log("");

// テスト2: イベントトラッキング
console.log("2. イベントトラッキングテスト");
tracker.event("quiz_started", { questionCount: 5 });
tracker.pageView("/quiz", { referrer: "https://example.com" });
tracker.userAction("answer_selected", { choiceId: "A" });
const analyticsLogs = getLogs({ category: "analytics" });
console.log(`   アナリティクスログ数: ${analyticsLogs.length}`);
console.log("");

// テスト3: パフォーマンス計測
console.log("3. パフォーマンス計測テスト");
const endTimer = performance.startTimer("test-operation", { type: "sync" });
// 模擬的な処理
let sum = 0;
for (let i = 0; i < 1000000; i++) {
  sum += i;
}
const duration = endTimer();
console.log(`   処理時間: ${duration}ms`);

// 非同期計測
(async () => {
  const result = await performance.measure(
    "async-operation",
    async () => {
      await new Promise((r) => setTimeout(r, 100));
      return "done";
    },
    { type: "async" }
  );
  console.log(`   非同期処理結果: ${result}`);
  console.log(`   メトリクス数: ${getMetrics().length}`);
  console.log("");

  // テスト4: コンテキスト管理
  console.log("4. コンテキスト管理テスト");
  const reqId = context.setRequestId();
  context.setSessionId("test-session-123");
  console.log(`   リクエストID: ${reqId}`);
  console.log(`   セッションID: ${context.getSessionId()}`);
  context.clear();
  console.log(`   クリア後リクエストID: ${context.getRequestId() || "undefined"}`);
  console.log("");

  // テスト5: ログフィルタリング
  console.log("5. ログフィルタリングテスト");
  const errorLogs = getLogs({ level: "error" });
  const recentLogs = getLogs({ limit: 5 });
  console.log(`   エラーログ数: ${errorLogs.length}`);
  console.log(`   最近5件のログ: ${recentLogs.length}`);
  console.log("");

  // テスト6: 統計情報
  console.log("6. 統計情報テスト");
  const stats = getStats();
  console.log(`   総ログ数: ${stats.totalLogs}`);
  console.log(`   レベル別: debug=${stats.logsByLevel.debug}, info=${stats.logsByLevel.info}, warn=${stats.logsByLevel.warn}, error=${stats.logsByLevel.error}`);
  console.log(`   ソース別: server=${stats.logsBySource.server}, client=${stats.logsBySource.client}`);
  console.log(`   最近のエラー数: ${stats.recentErrors.length}`);
  console.log("");

  // テスト7: エラー変換
  console.log("7. エラー変換テスト");
  const testError = new Error("テストエラー");
  testError.stack = "Error: テストエラー\n    at test.ts:1:1";
  const errorCtx = errorToContext(testError);
  console.log(`   エラー名: ${errorCtx.name}`);
  console.log(`   エラーメッセージ: ${errorCtx.message}`);
  console.log("");

  // テスト8: ログクリア
  console.log("8. ログクリアテスト");
  const beforeClear = getLogs().length;
  clearLogs();
  const afterClear = getLogs().length;
  console.log(`   クリア前: ${beforeClear}, クリア後: ${afterClear}`);
  console.log("");

  console.log("=== 全テスト完了 ===");
})();
