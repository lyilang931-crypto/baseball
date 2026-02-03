/**
 * ヘルスチェック API
 * GET /api/health - システムの健全性をチェック
 *
 * レスポンス:
 * - status: "healthy" | "degraded" | "unhealthy"
 * - components: 各コンポーネントの状態
 * - timestamp: チェック時刻
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { context, logger, getStats } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

type HealthStatus = "healthy" | "degraded" | "unhealthy";

interface ComponentHealth {
  status: HealthStatus;
  latency?: number;
  error?: string;
}

interface HealthResponse {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  components: {
    supabase: ComponentHealth;
    monitoring: ComponentHealth;
  };
  metrics?: {
    totalLogs: number;
    recentErrors: number;
  };
}

const startTime = Date.now();

async function checkSupabase(): Promise<ComponentHealth> {
  const start = Date.now();
  try {
    // 軽量なクエリでSupabase接続をテスト
    const { error } = await supabase
      .from("question_stats")
      .select("question_id")
      .limit(1);

    const latency = Date.now() - start;

    if (error) {
      return {
        status: "unhealthy",
        latency,
        error: error.message,
      };
    }

    return {
      status: latency < 1000 ? "healthy" : "degraded",
      latency,
    };
  } catch (e) {
    return {
      status: "unhealthy",
      latency: Date.now() - start,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

function checkMonitoring(): ComponentHealth {
  try {
    const stats = getStats();
    return {
      status: "healthy",
      latency: 0,
    };
  } catch (e) {
    return {
      status: "unhealthy",
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

function determineOverallStatus(components: HealthResponse["components"]): HealthStatus {
  const statuses = Object.values(components).map((c) => c.status);

  if (statuses.every((s) => s === "healthy")) {
    return "healthy";
  }
  if (statuses.some((s) => s === "unhealthy")) {
    return "unhealthy";
  }
  return "degraded";
}

export async function GET() {
  const requestId = context.setRequestId();

  try {
    // 各コンポーネントの健全性をチェック
    const [supabaseHealth] = await Promise.all([
      checkSupabase(),
    ]);
    const monitoringHealth = checkMonitoring();

    const components = {
      supabase: supabaseHealth,
      monitoring: monitoringHealth,
    };

    const status = determineOverallStatus(components);
    const stats = getStats();

    const response: HealthResponse = {
      status,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      components,
      metrics: {
        totalLogs: stats.totalLogs,
        recentErrors: stats.logsByLevel.error,
      },
    };

    logger.info("Health check completed", {
      status,
      supabaseLatency: supabaseHealth.latency,
    }, "health");

    // ステータスに応じたHTTPステータスコード
    const httpStatus = status === "healthy" ? 200 : status === "degraded" ? 200 : 503;

    return NextResponse.json(
      { ...response, requestId },
      { status: httpStatus }
    );
  } catch (e) {
    logger.error("Health check failed", {
      error: e instanceof Error ? e.message : String(e),
    }, "health");

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: e instanceof Error ? e.message : "Unknown error",
        requestId,
      },
      { status: 503 }
    );
  } finally {
    context.clear();
  }
}
