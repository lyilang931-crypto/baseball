"use client";

import { useEffect, useRef } from "react";

const CORRECT_URL = "/sfx/correct.mp3";
const WRONG_URL = "/sfx/wrong.mp3";

/**
 * Result画面表示時に正解/不正解の効果音を1回だけ再生する。
 * ファイルが無くてもエラーにしない。
 */
export function useResultSound(isCorrect: boolean) {
  const played = useRef(false);

  useEffect(() => {
    if (played.current) return;
    played.current = true;
    const url = isCorrect ? CORRECT_URL : WRONG_URL;
    const audio = new Audio(url);
    audio.play().catch(() => {
      // ファイル未配置・再生不可時は何もしない
    });
  }, [isCorrect]);
}
