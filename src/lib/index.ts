/**
 * ライブラリ一括エクスポート
 *
 * 使用例:
 * import { logger, tracker, reportError } from '@/lib';
 */

// 監視・ログシステム
export {
  logger,
  tracker,
  performance,
  context,
  getLogs,
  getMetrics,
  getStats,
  clearLogs,
  configure,
  errorToContext,
  type LogLevel,
  type LogEntry,
  type PerformanceMetric,
} from './monitoring';

// エラーハンドリング
export {
  setupErrorHandling,
  reportError,
  disableErrorReporting,
  enableErrorReporting,
  configureErrorHandler,
  getErrorBuffer,
  clearErrorBuffer,
} from './error-handler';

// APIユーティリティ
export {
  withApiHandler,
  apiSuccess,
  apiError,
  apiOk,
  isUuid,
  validateRequiredString,
  validateUuid,
  parseBoolean,
  parseNumber,
  parseJsonBody,
  getQueryParam,
  getQueryParams,
  type ApiContext,
  type ApiResponse,
  type ApiHandlerOptions,
} from './api-utils';

// ユーザーID
export { getOrCreateUserId } from './userId';

// ELO レーティング
export {
  eloAfterCorrect,
  eloAfterIncorrect,
  getInitialRating,
} from './elo';

// ストレージ
export {
  getRating,
  setRating,
  appendHistory,
} from './storage';

// デイリー機能
export {
  setTodayResult,
  getTodayResult,
  getLastPlayedDate,
  consumeOneAttempt,
  getTodayAttemptsRemaining,
  getTodayAttemptsUsed,
  MAX_DAILY_ATTEMPTS,
  getDailyUsedQuestionIds,
  addDailyUsedQuestionIds,
} from './daily';
