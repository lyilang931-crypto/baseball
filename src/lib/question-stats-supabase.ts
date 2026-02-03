/**
 * Supabase question_stats の参照（answer_logs の trigger で更新される）
 * GET /api/stats/question から利用。SQL の値と UI を一致させる。
 */

import { supabase } from "@/lib/supabase";
import { logger, errorToContext } from "@/lib/monitoring";

export interface QuestionStatsRow {
  question_id: string;
  answered_count: number;
  correct_count: number;
}

/**
 * question_id (uuid) で question_stats を取得。
 * 行がなければ { answered_count: 0, correct_count: 0 } を返す。
 */
export async function getQuestionStatsFromSupabase(
  questionId: string
): Promise<{ answered_count: number; correct_count: number }> {
  const { data, error } = await supabase
    .from("question_stats")
    .select("question_id, answered_count, correct_count")
    .eq("question_id", questionId)
    .maybeSingle();

  if (error) {
    logger.error("Failed to fetch question stats from Supabase", {
      ...errorToContext(error),
      questionId,
    }, "supabase");
    return { answered_count: 0, correct_count: 0 };
  }

  if (!data) {
    return { answered_count: 0, correct_count: 0 };
  }

  const row = data as QuestionStatsRow;
  const answered_count = Number(row.answered_count) || 0;
  const correct_count = Number(row.correct_count) || 0;
  return { answered_count, correct_count };
}
