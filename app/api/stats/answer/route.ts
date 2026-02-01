import { NextResponse } from "next/server";
import { recordAnswer } from "@/lib/stats-db";

export const dynamic = "force-dynamic";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_REGEX.test(s);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const questionId =
      typeof body?.questionId === "string" ? body.questionId.trim() : "";
    const isCorrect = Boolean(body?.isCorrect);
    if (!questionId) {
      return NextResponse.json(
        { error: "questionId is required (string)" },
        { status: 400 }
      );
    }
    if (!isUuid(questionId)) {
      console.error("[POST /api/stats/answer] questionId is not uuid. payload:", {
        questionId,
        isCorrect,
      });
      return NextResponse.json(
        { error: "questionId must be a valid uuid" },
        { status: 400 }
      );
    }
    const payload = { questionId, isCorrect };
    console.log("[payload]", payload);

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
