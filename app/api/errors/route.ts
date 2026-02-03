/**
 * クライアントエラーレポート API
 *
 * クライアントサイドで発生したエラーをサーバーに報告するためのエンドポイント
 * - 単一エラーまたはバッチ送信をサポート
 * - レート制限機能付き
 */

import { NextResponse } from 'next/server';
import {
  logger,
  context,
  type LogLevel,
} from '@/lib/monitoring';

export const dynamic = 'force-dynamic';

interface ClientError {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  type?: 'error' | 'unhandledrejection' | 'custom';
  url?: string;
  userAgent?: string;
  timestamp?: number;
  context?: Record<string, unknown>;
}

interface ErrorReportBody {
  errors: ClientError[];
  sessionId?: string;
  userId?: string;
}

// シンプルなレート制限（IP/セッションごとに1分あたり最大30リクエスト）
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false;
  }

  entry.count++;
  return true;
}

// 定期的にレート制限マップをクリーンアップ
setInterval(() => {
  const now = Date.now();
  const entries = Array.from(rateLimitMap.entries());
  for (const [key, entry] of entries) {
    if (now > entry.resetAt) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

function parseBody(raw: unknown): ErrorReportBody | null {
  if (!raw || typeof raw !== 'object') return null;

  const obj = raw as Record<string, unknown>;

  // 単一エラーの場合は配列に変換
  if (obj.message && typeof obj.message === 'string') {
    const singleError: ClientError = {
      message: obj.message,
      stack: typeof obj.stack === 'string' ? obj.stack : undefined,
      filename: typeof obj.filename === 'string' ? obj.filename : undefined,
      lineno: typeof obj.lineno === 'number' ? obj.lineno : undefined,
      colno: typeof obj.colno === 'number' ? obj.colno : undefined,
      type: obj.type === 'error' || obj.type === 'unhandledrejection' || obj.type === 'custom' ? obj.type : undefined,
      url: typeof obj.url === 'string' ? obj.url : undefined,
      userAgent: typeof obj.userAgent === 'string' ? obj.userAgent : undefined,
      timestamp: typeof obj.timestamp === 'number' ? obj.timestamp : undefined,
      context: obj.context && typeof obj.context === 'object' ? obj.context as Record<string, unknown> : undefined,
    };
    return {
      errors: [singleError],
      sessionId: typeof obj.sessionId === 'string' ? obj.sessionId : undefined,
      userId: typeof obj.userId === 'string' ? obj.userId : undefined,
    };
  }

  // バッチ送信の場合
  if (Array.isArray(obj.errors)) {
    return {
      errors: obj.errors.filter(
        (e): e is ClientError =>
          e && typeof e === 'object' && typeof (e as ClientError).message === 'string'
      ),
      sessionId: typeof obj.sessionId === 'string' ? obj.sessionId : undefined,
      userId: typeof obj.userId === 'string' ? obj.userId : undefined,
    };
  }

  return null;
}

export async function POST(request: Request) {
  const requestId = context.setRequestId();

  try {
    // レート制限チェック（X-Forwarded-For または sessionId を使用）
    const forwardedFor = request.headers.get('x-forwarded-for');
    const rateLimitKey = forwardedFor?.split(',')[0]?.trim() || 'anonymous';

    if (!checkRateLimit(rateLimitKey)) {
      logger.warn('Error report rate limit exceeded', { rateLimitKey }, 'api');
      return NextResponse.json(
        { error: 'Rate limit exceeded', requestId },
        { status: 429 }
      );
    }

    const raw = await request.json().catch(() => null);
    const body = parseBody(raw);

    if (!body || body.errors.length === 0) {
      return NextResponse.json(
        { error: 'Invalid body: errors array required', requestId },
        { status: 400 }
      );
    }

    // セッションIDを設定
    if (body.sessionId) {
      context.setSessionId(body.sessionId);
    }

    // 各エラーをログに記録
    const loggedCount = body.errors.slice(0, 50).length; // 最大50エラーまで
    for (const err of body.errors.slice(0, 50)) {
      const errorContext: Record<string, unknown> = {
        clientError: true,
        type: err.type || 'error',
        filename: err.filename,
        lineno: err.lineno,
        colno: err.colno,
        url: err.url,
        userAgent: err.userAgent,
        clientTimestamp: err.timestamp,
        userId: body.userId,
        ...err.context,
      };

      if (err.stack) {
        errorContext.stack = err.stack;
      }

      logger.error(`[CLIENT] ${err.message}`, errorContext, 'client-error');
    }

    logger.info('Client errors reported', {
      count: loggedCount,
      sessionId: body.sessionId,
      userId: body.userId,
    }, 'api');

    return NextResponse.json({
      ok: true,
      logged: loggedCount,
      requestId,
    });
  } catch (e) {
    logger.error('Error processing client error report', {
      error: e instanceof Error ? e.message : String(e),
    }, 'api');

    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    );
  } finally {
    context.clear();
  }
}

// GETでエラーログの概要を取得（管理用）
export async function GET() {
  const requestId = context.setRequestId();

  try {
    // クライアントエラーのみをフィルタリング
    const { getLogs } = await import('@/lib/monitoring');
    const clientErrors = getLogs({ category: 'client-error', limit: 100 });

    return NextResponse.json({
      ok: true,
      count: clientErrors.length,
      errors: clientErrors,
      requestId,
    });
  } catch (e) {
    logger.error('Error fetching client errors', {
      error: e instanceof Error ? e.message : String(e),
    }, 'api');

    return NextResponse.json(
      { error: 'Internal server error', requestId },
      { status: 500 }
    );
  } finally {
    context.clear();
  }
}
