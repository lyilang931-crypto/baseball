import { NextResponse } from "next/server";
import { getQuestionStatsFromSupabase } from "@/lib/question-stats-supabase";

export const dynamic = "force-dynamic";

/** SQL（question_stats）と UI を一致させる。answered_count / correct_count を返す */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get("questionId")?.trim() ?? "";
    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required (query)" },
        { status: 400 }
      );
    }
    const { answered_count, correct_count } =
      await getQuestionStatsFromSupabase(questionId);
    const accuracy =
      answered_count === 0
        ? 0
        : Math.round((correct_count / answered_count) * 100) / 100;
    return NextResponse.json({
      questionId,
      answered_count,
      correct_count,
      total_attempts: answered_count,
      total_correct: correct_count,
      accuracy,
    });
  } catch (e) {
    console.error("[GET /api/stats/question]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
