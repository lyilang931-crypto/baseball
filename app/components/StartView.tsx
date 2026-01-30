"use client";

export default function StartView({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
        ⚾ 今日の1球
      </h1>
      <p className="text-gray-600 text-center mb-12">あなたなら、どうする？</p>
      <button
        type="button"
        onClick={onStart}
        className="w-full max-w-sm py-4 px-6 rounded-2xl bg-blue-500 text-white font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-600 active:bg-blue-700 transition-colors"
      >
        <span aria-hidden>▶</span>
        今日の1球に挑戦
      </button>
      <p className="text-sm text-gray-400 mt-4">※30秒で終わります</p>
    </div>
  );
}
