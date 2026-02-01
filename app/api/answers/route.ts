import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_REGEX.test(s);
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

export async function POST(request: Request) {
  try {
    const raw = await request.json().catch(() => null);
    const body = parseBody(raw);
    if (!body) {
      return NextResponse.json(
        { error: "Invalid body: userId, questionId, selectedOption, isCorrect required" },
        { status: 400 }
      );
    }
    if (!isUuid(body.questionId)) {
      console.error("[POST /api/answers] questionId is not uuid. payload:", {
        questionId: body.questionId,
        userId: body.userId,
        isCorrect: body.isCorrect,
      });
      return NextResponse.json(
        { error: "questionId must be a valid uuid" },
        { status: 400 }
      );
    }

    // question_id は Supabase 側で uuid 型。フロントは questionId (uuid) を送る。
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
    console.log("[payload]", payload);

    const { error } = await supabase.from("answer_logs").insert(payload);

    if (error) {
      console.error("[POST /api/answers]", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[POST /api/answers]", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal server error" },
      { status: 500 }
    );
  }
}
