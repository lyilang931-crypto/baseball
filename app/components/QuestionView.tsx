"use client";

/**
 * 即体験UX（TikTok型の抽象化）
 * - 起動後すぐに答えるボタンが押せる
 * - 説明画面なし。問題 → 選択肢が最短で表示
 */

import type { Question } from "@/data/questions";

interface QuestionViewProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  secondsLeft: number;
  onSelect: (choiceId: string) => void;
}

export default function QuestionView({
  question,
  questionNumber,
  totalQuestions,
  secondsLeft,
  onSelect,
}: QuestionViewProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-6 py-10 max-w-md mx-auto">
      <p className="text-xs text-gray-400 w-full text-center">
        {questionNumber}/{totalQuestions} · 残り{secondsLeft}秒
      </p>

      <div className="flex-1 flex flex-col items-center justify-center w-full py-4">
        <h2 className="text-lg font-bold text-gray-900 text-center mb-1">
          {question.situation}
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          {question.count}
        </p>

        <div className="w-full space-y-2">
          {question.choices.map((choice) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => onSelect(choice.id)}
              className="w-full py-4 px-4 rounded-2xl border-2 border-gray-200 bg-white text-gray-900 font-medium text-center hover:border-blue-300 hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
              {choice.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
