/**
 * 回答記録 API
 * POST /api/answers - ユーザーの回答をSupabaseに記録
 */

import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  withApiHandler,
  apiOk,
  apiError,
  parseJsonBody,
  isUuid,
  type ApiContext,
} from "@/lib/api-utils";
import { logger, errorToContext } from "@/lib/monitoring";

export const dynamic = "force-dynamic";

export interface PostAnswerBody {
  userId: string;
  questionId: string;
  selectedOption: string;
  isCorrect: boolean;
  sourceUrl?: string;
  ratingBefore?: number;
  ratingAfter?: number;
}

function parseBody(body: unknown): PostAnswerBody | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;

  if (typeof o.userId !== "string" || !o.userId.trim()) return null;
  if (typeof o.questionId !== "string" || !o.questionId.trim()) return null;
  if (typeof o.selectedOption !== "string") return null;
  if (typeof o.isCorrect !== "boolean") return null;

  return {
    userId: o.userId.trim(),
    questionId: o.questionId.trim(),
    selectedOption: o.selectedOption,
    isCorrect: o.isCorrect,
    sourceUrl:
      typeof o.sourceUrl === "string" && o.sourceUrl.trim()
        ? o.sourceUrl.trim()
        : undefined,
    ratingBefore:
      typeof o.ratingBefore === "number" && Number.isFinite(o.ratingBefore)
        ? o.ratingBefore
        : undefined,
    ratingAfter:
      typeof o.ratingAfter === "number" && Number.isFinite(o.ratingAfter)
        ? o.ratingAfter
        : undefined,
  };
}

async function handlePost(
  request: Request,
  ctx: ApiContext
): Promise<Response> {
  const raw = await parseJsonBody(request);
  const body = parseBody(raw);

  if (!body) {
    logger.warn("Invalid request body", { raw }, "api");
    return apiError(
      "Invalid body: userId, questionId, selectedOption, isCorrect required",
      ctx.requestId,
      400
    );
  }

  if (!isUuid(body.questionId)) {
    logger.warn("Invalid questionId format", {
      questionId: body.questionId,
      userId: body.userId,
    }, "api");
    return apiError("questionId must be a valid uuid", ctx.requestId, 400);
  }

  // Supabaseに保存
  const payload = {
    user_id: body.userId,
    question_id: body.questionId,
    selected_option: body.selectedOption,
    is_correct: body.isCorrect,
    source_url: body.sourceUrl ?? null,
    rating_before: body.ratingBefore ?? null,
    rating_after: body.ratingAfter ?? null,
    meta: null,
  };

  logger.debug("Inserting answer log", {
    questionId: body.questionId,
    isCorrect: body.isCorrect,
  }, "api");

  const { error } = await supabase.from("answer_logs").insert(payload);

  if (error) {
    logger.error("Supabase insert failed", {
      ...errorToContext(error),
      questionId: body.questionId,
    }, "api");
    return NextResponse.json(
      { error: error.message, requestId: ctx.requestId },
      { status: 500 }
    );
  }

  logger.info("Answer logged successfully", {
    questionId: body.questionId,
    isCorrect: body.isCorrect,
    ratingDelta: body.ratingAfter && body.ratingBefore
      ? body.ratingAfter - body.ratingBefore
      : null,
  }, "api");

  return apiOk(ctx.requestId);
}

export const POST = withApiHandler(handlePost, {
  name: "/api/answers",
  logLevel: "info",
});
