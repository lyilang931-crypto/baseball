import { NextResponse } from "next/server";
import { recordAnswer } from "@/lib/stats-db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const questionId =
      typeof body?.questionId === "string" ? body.questionId.trim() : "";
    const isCorrect = Boolean(body?.isCorrect);
    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required (string)" },
        { status: 400 }
      );
    }
    const stats = await recordAnswer(questionId, isCorrect);
    return NextResponse.json(stats);
  } catch (e) {
    console.error("[POST /api/stats/answer]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
