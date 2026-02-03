/**
 * 統計記録 API
 * POST /api/stats/answer - 回答統計を記録
 */

import { NextResponse } from "next/server";
import { recordAnswer } from "@/lib/stats-db";
import {
  withApiHandler,
  apiError,
  parseJsonBody,
  isUuid,
  type ApiContext,
} from "@/lib/api-utils";
import { logger, errorToContext } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

async function handlePost(
  request: Request,
  ctx: ApiContext
): Promise<Response> {
  const body = await parseJsonBody(request);
  const questionId =
    typeof body?.questionId === "string" ? body.questionId.trim() : "";
  const isCorrect = Boolean(body?.isCorrect);

  if (!questionId) {
    logger.warn("Missing questionId", { body }, "api");
    return apiError("questionId is required (string)", ctx.requestId, 400);
  }

  if (!isUuid(questionId)) {
    logger.warn("Invalid questionId format", { questionId }, "api");
    return apiError("questionId must be a valid uuid", ctx.requestId, 400);
  }

  try {
    const stats = await recordAnswer(questionId, isCorrect);

    logger.info("Answer stats recorded", {
      questionId,
      isCorrect,
      totalAttempts: stats.total_attempts,
      accuracy: stats.accuracy,
    }, "api");

    return NextResponse.json({
      ...stats,
      requestId: ctx.requestId,
    });
  } catch (e) {
    logger.error("Failed to record answer stats", {
      ...errorToContext(e),
      questionId,
    }, "api");

    return NextResponse.json(
      { error: "Internal server error", requestId: ctx.requestId },
      { status: 500 }
    );
  }
}

export const POST = withApiHandler(handlePost, {
  name: "/api/stats/answer",
  logLevel: "debug",
});
