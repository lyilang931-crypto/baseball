import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats-db";

export const dynamic = "force-dynamic";

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
    const stats = await getStats(questionId);
    return NextResponse.json(stats);
  } catch (e) {
    console.error("[GET /api/stats/question]", e);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
