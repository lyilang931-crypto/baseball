/**
 * 問題統計取得 API
 * GET /api/stats/question?questionId={uuid} - 問題の統計情報を取得
 */

import { NextResponse } from "next/server";
import { getQuestionStatsFromSupabase } from "@/lib/question-stats-supabase";
import {
  withApiHandler,
  apiError,
  getQueryParam,
  type ApiContext,
} from "@/lib/api-utils";
import { logger, errorToContext } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

async function handleGet(
  request: Request,
  ctx: ApiContext
): Promise<Response> {
  const questionId = getQueryParam(request, "questionId")?.trim() ?? "";

  if (!questionId) {
    logger.warn("Missing questionId query parameter", {}, "api");
    return apiError("questionId is required (query)", ctx.requestId, 400);
  }

  try {
    const { answered_count, correct_count } =
      await getQuestionStatsFromSupabase(questionId);

    const accuracy =
      answered_count === 0
        ? 0
        : Math.round((correct_count / answered_count) * 100) / 100;

    const response = {
      questionId,
      answered_count,
      correct_count,
      total_attempts: answered_count,
      total_correct: correct_count,
      accuracy,
      requestId: ctx.requestId,
    };

    logger.debug("Question stats fetched", {
      questionId,
      answered_count,
      accuracy,
    }, "api");

    return NextResponse.json(response);
  } catch (e) {
    logger.error("Failed to fetch question stats", {
      ...errorToContext(e),
      questionId,
    }, "api");

    return NextResponse.json(
      { error: "Internal server error", requestId: ctx.requestId },
      { status: 500 }
    );
  }
}

export const GET = withApiHandler(handleGet, {
  name: "/api/stats/question",
  logLevel: "debug",
});
