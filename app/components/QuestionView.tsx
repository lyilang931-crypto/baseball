"use client";

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
      <p className="text-sm text-gray-500 w-full text-center">
        第{questionNumber}問 / {totalQuestions}
      </p>

      <div className="flex-1 flex flex-col items-center justify-center w-full py-6">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          {question.situation}
        </h2>
        <p className="text-base text-gray-700 text-center mb-4">
          {question.count}
        </p>
        <p className="text-gray-900 text-center mb-8">あなたはどうする?</p>

        <div className="w-full space-y-3">
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

      <p className="text-sm text-gray-500">残り {secondsLeft} 秒</p>
    </div>
  );
}
