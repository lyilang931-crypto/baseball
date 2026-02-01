"use client";

import { useEffect, useRef } from "react";

const CORRECT_URL = "/sfx/correct.mp3";
const WRONG_URL = "/sfx/wrong.mp3";

/**
 * 正解/不正解の効果音を即再生する（タップ直後に呼ぶ＝0遅延体感）。
 * API通信とは完全に分離。ファイルが無くてもエラーにしない。
 */
export function playResultSound(isCorrect: boolean): void {
  const url = isCorrect ? CORRECT_URL : WRONG_URL;
  const audio = new Audio(url);
  audio.play().catch(() => {
    // ファイル未配置・再生不可時は何もしない
  });
}

/**
 * Result画面表示時に正解/不正解の効果音を1回だけ再生する（フォールバック用）。
 * 通常は playResultSound をタップ直後に呼ぶため、こちらは使わない。
 */
export function useResultSound(isCorrect: boolean) {
  const played = useRef(false);

  useEffect(() => {
    if (played.current) return;
    played.current = true;
    playResultSound(isCorrect);
  }, [isCorrect]);
}
