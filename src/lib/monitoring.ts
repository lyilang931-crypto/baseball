/**
 * 実運用レベルの監視・ログシステム
 *
 * Features:
 * - 構造化ログ形式（JSON対応）
 * - リクエストID/セッションIDによるトレーサビリティ
 * - サーバー・クライアント両方をサポート
 * - ログレベル（debug, info, warn, error）
 * - メモリ内バッファ + オプションの永続化
 * - パフォーマンス計測
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  timestampMs: number;
  context?: Record<string, unknown>;
  requestId?: string;
  sessionId?: string;
  source?: 'client' | 'server';
  category?: string;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

interface MonitoringConfig {
  maxLogs: number;
  maxMetrics: number;
  logToConsole: boolean;
  minConsoleLevel: LogLevel;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// 設定
const config: MonitoringConfig = {
  maxLogs: 1000,
  maxMetrics: 500,
  logToConsole: typeof process !== 'undefined' && process?.env?.NODE_ENV !== 'production',
  minConsoleLevel: 'debug',
};

// ログバッファ
const logs: LogEntry[] = [];
const metrics: PerformanceMetric[] = [];

// 現在のコンテキスト（リクエストごとに設定可能）
let currentRequestId: string | undefined;
let currentSessionId: string | undefined;

/**
 * UUID v4 生成（crypto.randomUUID フォールバック付き）
 */
function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 現在のタイムスタンプ（ISO形式）
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * ソース判定（クライアント or サーバー）
 */
function getSource(): 'client' | 'server' {
  return typeof window !== 'undefined' ? 'client' : 'server';
}

/**
 * ログエントリを追加
 */
function addLog(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  category?: string
): LogEntry {
  const entry: LogEntry = {
    level,
    message,
    timestamp: getTimestamp(),
    timestampMs: Date.now(),
    context,
    requestId: currentRequestId,
    sessionId: currentSessionId,
    source: getSource(),
    category,
  };

  logs.unshift(entry);

  // バッファサイズ制限
  while (logs.length > config.maxLogs) {
    logs.pop();
  }

  // コンソール出力
  if (config.logToConsole && LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[config.minConsoleLevel]) {
    const consoleMethod =
      level === 'error' ? console.error :
      level === 'warn' ? console.warn :
      level === 'debug' ? console.debug :
      console.log;

    const prefix = `[${level.toUpperCase()}]`;
    const reqInfo = entry.requestId ? ` [req:${entry.requestId.slice(0, 8)}]` : '';
    const catInfo = category ? ` [${category}]` : '';

    if (context && Object.keys(context).length > 0) {
      consoleMethod(`${prefix}${reqInfo}${catInfo} ${message}`, context);
    } else {
      consoleMethod(`${prefix}${reqInfo}${catInfo} ${message}`);
    }
  }

  return entry;
}

/**
 * メインのロガーオブジェクト
 */
export const logger = {
  debug: (message: string, context?: Record<string, unknown>, category?: string) =>
    addLog('debug', message, context, category),

  info: (message: string, context?: Record<string, unknown>, category?: string) =>
    addLog('info', message, context, category),

  warn: (message: string, context?: Record<string, unknown>, category?: string) =>
    addLog('warn', message, context, category),

  error: (message: string, context?: Record<string, unknown>, category?: string) =>
    addLog('error', message, context, category),
};

/**
 * イベントトラッカー（アナリティクス用）
 */
export const tracker = {
  event: (name: string, payload?: Record<string, unknown>) => {
    addLog('info', `event:${name}`, payload, 'analytics');
  },

  pageView: (path: string, metadata?: Record<string, unknown>) => {
    addLog('info', `pageview:${path}`, metadata, 'analytics');
  },

  userAction: (action: string, metadata?: Record<string, unknown>) => {
    addLog('info', `action:${action}`, metadata, 'analytics');
  },
};

/**
 * パフォーマンス計測
 */
export const performance = {
  /**
   * 処理時間を計測
   * @returns 終了時に呼ぶ関数（durationを返す）
   */
  startTimer: (name: string, metadata?: Record<string, unknown>) => {
    const start = Date.now();
    return (): number => {
      const duration = Date.now() - start;
      const metric: PerformanceMetric = {
        name,
        duration,
        timestamp: getTimestamp(),
        metadata,
      };
      metrics.unshift(metric);
      while (metrics.length > config.maxMetrics) {
        metrics.pop();
      }
      logger.debug(`perf:${name}`, { duration, ...metadata }, 'performance');
      return duration;
    };
  },

  /**
   * 非同期処理の計測ラッパー
   */
  measure: async <T>(
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, unknown>
  ): Promise<T> => {
    const end = performance.startTimer(name, metadata);
    try {
      return await fn();
    } finally {
      end();
    }
  },
};

/**
 * コンテキスト管理
 */
export const context = {
  /**
   * リクエストIDを設定（APIハンドラの最初に呼ぶ）
   */
  setRequestId: (id?: string): string => {
    currentRequestId = id ?? generateId();
    return currentRequestId;
  },

  /**
   * セッションIDを設定
   */
  setSessionId: (id: string) => {
    currentSessionId = id;
  },

  /**
   * 現在のリクエストIDを取得
   */
  getRequestId: () => currentRequestId,

  /**
   * 現在のセッションIDを取得
   */
  getSessionId: () => currentSessionId,

  /**
   * コンテキストをクリア
   */
  clear: () => {
    currentRequestId = undefined;
    currentSessionId = undefined;
  },

  /**
   * 新しいリクエストIDを生成
   */
  generateId,
};

/**
 * ログの取得
 */
export function getLogs(options?: {
  level?: LogLevel;
  category?: string;
  limit?: number;
  since?: number;
}): LogEntry[] {
  let result = [...logs];

  if (options?.level) {
    const minPriority = LOG_LEVEL_PRIORITY[options.level];
    result = result.filter((log) => LOG_LEVEL_PRIORITY[log.level] >= minPriority);
  }

  if (options?.category) {
    result = result.filter((log) => log.category === options.category);
  }

  if (options?.since !== undefined) {
    const sinceTime = options.since;
    result = result.filter((log) => log.timestampMs >= sinceTime);
  }

  if (options?.limit) {
    result = result.slice(0, options.limit);
  }

  return result;
}

/**
 * メトリクスの取得
 */
export function getMetrics(limit?: number): PerformanceMetric[] {
  return limit ? metrics.slice(0, limit) : [...metrics];
}

/**
 * 統計情報の取得
 */
export function getStats(): {
  totalLogs: number;
  logsByLevel: Record<LogLevel, number>;
  logsBySource: Record<string, number>;
  totalMetrics: number;
  recentErrors: LogEntry[];
} {
  const logsByLevel: Record<LogLevel, number> = {
    debug: 0,
    info: 0,
    warn: 0,
    error: 0,
  };
  const logsBySource: Record<string, number> = {
    client: 0,
    server: 0,
  };

  for (const log of logs) {
    logsByLevel[log.level]++;
    if (log.source) {
      logsBySource[log.source]++;
    }
  }

  const recentErrors = logs.filter((log) => log.level === 'error').slice(0, 10);

  return {
    totalLogs: logs.length,
    logsByLevel,
    logsBySource,
    totalMetrics: metrics.length,
    recentErrors,
  };
}

/**
 * ログをクリア
 */
export function clearLogs(): void {
  logs.length = 0;
  metrics.length = 0;
}

/**
 * 設定の更新
 */
export function configure(newConfig: Partial<MonitoringConfig>): void {
  Object.assign(config, newConfig);
}

/**
 * エラーオブジェクトをログ用コンテキストに変換
 */
export function errorToContext(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }
  return { error: String(error) };
}

// デフォルトエクスポート
export default {
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
};
