/**
 * API ユーティリティ - 一貫したリクエスト処理とエラーハンドリング
 *
 * Features:
 * - リクエストID自動生成とトレーサビリティ
 * - 自動的なリクエスト/レスポンスログ
 * - パフォーマンス計測
 * - 標準化されたエラーレスポンス
 * - 入力バリデーションヘルパー
 */

import { NextResponse } from 'next/server';
import {
  logger,
  context,
  performance,
  errorToContext,
} from './monitoring';

export interface ApiContext {
  requestId: string;
  startTime: number;
}

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
  requestId: string;
  duration?: number;
}

export interface ApiHandlerOptions {
  /** エンドポイント名（ログ用） */
  name: string;
  /** ログレベル（デフォルト: info） */
  logLevel?: 'debug' | 'info';
  /** パフォーマンス計測を有効にする（デフォルト: true） */
  measurePerformance?: boolean;
}

type NextApiHandler = (request: Request) => Promise<Response>;

/**
 * APIハンドラをラップして自動ログ・エラーハンドリングを追加
 */
export function withApiHandler(
  handler: (request: Request, ctx: ApiContext) => Promise<Response>,
  options: ApiHandlerOptions
): NextApiHandler {
  return async (request: Request): Promise<Response> => {
    const requestId = context.setRequestId();
    const startTime = Date.now();
    const { name, logLevel = 'info', measurePerformance = true } = options;

    // リクエストログ
    const logFn = logLevel === 'debug' ? logger.debug : logger.info;
    logFn(`${request.method} ${name} started`, {
      url: request.url,
      method: request.method,
    }, 'api');

    let endTimer: (() => number) | undefined;
    if (measurePerformance) {
      endTimer = performance.startTimer(`api:${name}`, { method: request.method });
    }

    try {
      const response = await handler(request, { requestId, startTime });
      const duration = Date.now() - startTime;

      // レスポンスログ
      logFn(`${request.method} ${name} completed`, {
        status: response.status,
        duration,
      }, 'api');

      if (endTimer) endTimer();

      return response;
    } catch (e) {
      const duration = Date.now() - startTime;

      logger.error(`${request.method} ${name} failed`, {
        ...errorToContext(e),
        duration,
      }, 'api');

      if (endTimer) endTimer();

      return NextResponse.json(
        {
          ok: false,
          error: e instanceof Error ? e.message : 'Internal server error',
          requestId,
        },
        { status: 500 }
      );
    } finally {
      context.clear();
    }
  };
}

/**
 * 成功レスポンスを作成
 */
export function apiSuccess<T>(
  data: T,
  requestId: string,
  status = 200
): Response {
  return NextResponse.json(
    { ok: true, data, requestId } as ApiResponse<T>,
    { status }
  );
}

/**
 * エラーレスポンスを作成
 */
export function apiError(
  error: string,
  requestId: string,
  status = 400
): Response {
  return NextResponse.json(
    { ok: false, error, requestId } as ApiResponse,
    { status }
  );
}

/**
 * シンプルな成功レスポンス（ok: true のみ）
 */
export function apiOk(requestId: string): Response {
  return NextResponse.json({ ok: true, requestId });
}

// =====================
// バリデーションヘルパー
// =====================

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * UUID形式かチェック
 */
export function isUuid(s: string): boolean {
  return UUID_REGEX.test(s);
}

/**
 * 必須文字列フィールドをバリデート
 */
export function validateRequiredString(
  value: unknown,
  fieldName: string
): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return `${fieldName} is required (string)`;
  }
  return null;
}

/**
 * UUID形式の文字列をバリデート
 */
export function validateUuid(
  value: unknown,
  fieldName: string
): string | null {
  const strError = validateRequiredString(value, fieldName);
  if (strError) return strError;

  if (!isUuid(value as string)) {
    return `${fieldName} must be a valid UUID`;
  }
  return null;
}

/**
 * オプショナルなブーリアンをパース
 */
export function parseBoolean(value: unknown, defaultValue = false): boolean {
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1') return true;
  if (value === 'false' || value === '0') return false;
  return defaultValue;
}

/**
 * オプショナルな数値をパース
 */
export function parseNumber(
  value: unknown,
  defaultValue?: number
): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return defaultValue;
}

/**
 * JSONリクエストボディを安全にパース
 */
export async function parseJsonBody<T = Record<string, unknown>>(
  request: Request
): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

/**
 * クエリパラメータを取得
 */
export function getQueryParam(
  request: Request,
  name: string
): string | null {
  const { searchParams } = new URL(request.url);
  return searchParams.get(name);
}

/**
 * 複数のクエリパラメータを取得
 */
export function getQueryParams(
  request: Request,
  names: string[]
): Record<string, string | null> {
  const { searchParams } = new URL(request.url);
  const result: Record<string, string | null> = {};
  for (const name of names) {
    result[name] = searchParams.get(name);
  }
  return result;
}
