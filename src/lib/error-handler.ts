/**
 * クライアントサイドエラーハンドリング
 *
 * Features:
 * - グローバルエラーリスナー（window.onerror, unhandledrejection）
 * - エラーの自動収集とサーバー報告
 * - バッチ送信による効率化
 * - レート制限によるスパム防止
 * - エラーの重複排除
 */

import { logger, context } from './monitoring';

interface ClientError {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  type: 'error' | 'unhandledrejection' | 'custom';
  url?: string;
  userAgent?: string;
  timestamp: number;
  context?: Record<string, unknown>;
}

// エラーバッファ
const errorBuffer: ClientError[] = [];

// 設定
const config = {
  maxBufferSize: 20,
  flushInterval: 5000, // 5秒ごとにバッチ送信
  reportEndpoint: '/api/errors',
  enabled: true,
  deduplicationWindow: 60000, // 1分以内の同一エラーは重複排除
};

// 重複排除用のキャッシュ
const recentErrors = new Map<string, number>();

// セッションID（一度生成したら維持）
let sessionId: string | null = null;

/**
 * セッションIDを取得または生成
 */
function getSessionId(): string {
  if (sessionId) return sessionId;
  sessionId = context.generateId();
  return sessionId;
}

/**
 * エラーの一意キーを生成（重複排除用）
 */
function getErrorKey(error: ClientError): string {
  return `${error.message}:${error.filename || ''}:${error.lineno || 0}`;
}

/**
 * 重複エラーかチェック
 */
function isDuplicate(error: ClientError): boolean {
  const key = getErrorKey(error);
  const lastSeen = recentErrors.get(key);

  if (lastSeen && error.timestamp - lastSeen < config.deduplicationWindow) {
    return true;
  }

  recentErrors.set(key, error.timestamp);

  // 古いエントリをクリーンアップ
  const threshold = Date.now() - config.deduplicationWindow;
  const entries = Array.from(recentErrors.entries());
  for (const [k, t] of entries) {
    if (t < threshold) {
      recentErrors.delete(k);
    }
  }

  return false;
}

/**
 * エラーをバッファに追加
 */
function addError(error: ClientError): void {
  if (!config.enabled) return;
  if (isDuplicate(error)) {
    logger.debug('Duplicate error suppressed', { message: error.message });
    return;
  }

  errorBuffer.push(error);
  logger.error(`[${error.type}] ${error.message}`, {
    filename: error.filename,
    lineno: error.lineno,
    colno: error.colno,
  });

  // バッファが満杯なら即座にフラッシュ
  if (errorBuffer.length >= config.maxBufferSize) {
    flushErrors();
  }
}

/**
 * エラーをサーバーに送信
 */
async function flushErrors(): Promise<void> {
  if (errorBuffer.length === 0) return;
  if (typeof window === 'undefined') return;

  const errors = errorBuffer.splice(0, errorBuffer.length);

  try {
    const response = await fetch(config.reportEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        errors,
        sessionId: getSessionId(),
        userId: getUserId(),
      }),
    });

    if (!response.ok) {
      // 送信失敗時はコンソールに出力（バッファには戻さない）
      console.error('[error-handler] Failed to report errors:', response.status);
    }
  } catch (e) {
    console.error('[error-handler] Failed to report errors:', e);
  }
}

/**
 * ユーザーIDを取得（存在する場合）
 */
function getUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return localStorage.getItem('baseball_user_id') || undefined;
  } catch {
    return undefined;
  }
}

/**
 * 定期的なフラッシュタイマー
 */
let flushTimer: ReturnType<typeof setInterval> | null = null;

/**
 * エラーハンドリングのセットアップ
 */
export function setupErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // グローバルエラーリスナー
  window.addEventListener('error', (event) => {
    addError({
      message: event.message || 'Unknown error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      type: 'error',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  });

  // Promise rejection リスナー
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    let message = 'Unhandled promise rejection';
    let stack: string | undefined;

    if (reason instanceof Error) {
      message = reason.message;
      stack = reason.stack;
    } else if (typeof reason === 'string') {
      message = reason;
    } else if (reason && typeof reason === 'object') {
      message = JSON.stringify(reason);
    }

    addError({
      message,
      stack,
      type: 'unhandledrejection',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });
  });

  // 定期フラッシュタイマーを開始
  if (!flushTimer) {
    flushTimer = setInterval(flushErrors, config.flushInterval);
  }

  // ページ離脱時にフラッシュ（beacon APIを使用）
  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && errorBuffer.length > 0) {
      const data = JSON.stringify({
        errors: errorBuffer.splice(0, errorBuffer.length),
        sessionId: getSessionId(),
        userId: getUserId(),
      });

      // Beacon API でバックグラウンド送信
      if (navigator.sendBeacon) {
        navigator.sendBeacon(config.reportEndpoint, data);
      }
    }
  });

  logger.info('Error handling initialized', { sessionId: getSessionId() });
}

/**
 * 手動でエラーを報告
 */
export function reportError(
  error: Error | string,
  additionalContext?: Record<string, unknown>
): void {
  const isError = error instanceof Error;
  addError({
    message: isError ? error.message : String(error),
    stack: isError ? error.stack : undefined,
    type: 'custom',
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    timestamp: Date.now(),
    context: additionalContext,
  });
}

/**
 * エラーハンドリングを無効化
 */
export function disableErrorReporting(): void {
  config.enabled = false;
  if (flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  }
}

/**
 * エラーハンドリングを有効化
 */
export function enableErrorReporting(): void {
  config.enabled = true;
  if (typeof window !== 'undefined' && !flushTimer) {
    flushTimer = setInterval(flushErrors, config.flushInterval);
  }
}

/**
 * 設定を更新
 */
export function configureErrorHandler(
  newConfig: Partial<typeof config>
): void {
  Object.assign(config, newConfig);
}

/**
 * 現在のバッファを取得（デバッグ用）
 */
export function getErrorBuffer(): ClientError[] {
  return [...errorBuffer];
}

/**
 * バッファをクリア（テスト用）
 */
export function clearErrorBuffer(): void {
  errorBuffer.length = 0;
}

// デフォルトエクスポート
export default {
  setupErrorHandling,
  reportError,
  disableErrorReporting,
  enableErrorReporting,
  configureErrorHandler,
  getErrorBuffer,
  clearErrorBuffer,
};
