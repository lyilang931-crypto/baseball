"use client";

interface FinalResultViewProps {
  correctCount: number;
  totalQuestions: number;
  ratingBefore: number;
  ratingAfter: number;
  onBackToStart: () => void;
}

export default function FinalResultView({
  correctCount,
  totalQuestions,
  ratingBefore,
  ratingAfter,
  onBackToStart,
}: FinalResultViewProps) {
  const delta = ratingAfter - ratingBefore;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">結果</h2>
        <p className="text-gray-600 text-center mb-6">
          {totalQuestions}問中{correctCount}問正解
        </p>
        <p className="text-center mb-2">
          <span className="text-gray-600">レート: </span>
          <span className="font-bold text-blue-600 text-xl">
            {ratingAfter} ({delta >= 0 ? "+" : ""}
            {delta})
          </span>
        </p>
      </div>

      <button
        type="button"
        onClick={onBackToStart}
        className="w-full max-w-sm py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors mt-8"
      >
        <span aria-hidden>▶</span>
        スタートに戻る
      </button>
    </div>
  );
}
