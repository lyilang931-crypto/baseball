import { supabase } from "@/lib/supabase";
import { getUserId } from "@/lib/user";

/**
 * 回答を Supabase の answers テーブルへ保存する。
 * 失敗時は UI に影響させず console.error のみ。
 */
export async function saveAnswer(
  questionId: string,
  isCorrect: boolean
): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const { error } = await supabase.from("answers").insert({
    user_id: userId,
    question_id: questionId,
    is_correct: isCorrect,
  });

  if (error) {
    console.error("[saveAnswer]", error);
  }
}
