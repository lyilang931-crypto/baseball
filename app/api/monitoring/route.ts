/**
 * 監視・ログ取得 API
 * GET /api/monitoring - サーバーログと統計情報を取得
 */

import { NextResponse } from "next/server";
import {
  getLogs,
  getMetrics,
  getStats,
  context,
  type LogLevel,
} from "@/lib/monitoring";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const requestId = context.setRequestId();

  try {
    const { searchParams } = new URL(request.url);

    // クエリパラメータからフィルタを取得
    const level = searchParams.get("level") as LogLevel | null;
    const category = searchParams.get("category");
    const limit = searchParams.get("limit");
    const since = searchParams.get("since");
    const includeMetrics = searchParams.get("metrics") === "true";
    const includeStats = searchParams.get("stats") !== "false";

    const logs = getLogs({
      level: level || undefined,
      category: category || undefined,
      limit: limit ? parseInt(limit, 10) : 100,
      since: since ? parseInt(since, 10) : undefined,
    });

    const response: Record<string, unknown> = {
      ok: true,
      requestId,
      logs,
      logsCount: logs.length,
    };

    if (includeStats) {
      response.stats = getStats();
    }

    if (includeMetrics) {
      response.metrics = getMetrics(50);
    }

    return NextResponse.json(response);
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        error: e instanceof Error ? e.message : "Internal server error",
        requestId,
      },
      { status: 500 }
    );
  } finally {
    context.clear();
  }
}
