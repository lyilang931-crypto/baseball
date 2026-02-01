"use client";

/**
 * 上位アプリUXの抽象化:
 * - デイリー体験: daily.ts + StartView 分岐（Duolingo型）
 * - 即体験: QuestionView 最小テキスト・即押せる（TikTok型）
 * - 比較・競争: FinalResultView 判断力レベル名称（Trivia型）
 * - シェア前提: 結果 = シェア画面（shareText + X/LINE）
 */

import { useState, useEffect, useCallback, useRef } from "react";
import StartView from "./components/StartView";
import QuestionView from "./components/QuestionView";
import ResultView from "./components/ResultView";
import FinalResultView from "./components/FinalResultView";
import {
  getSessionQuestions,
  QUESTIONS_PER_SESSION,
} from "@/data/questions";
import type { Question } from "@/data/questions";
import {
  eloAfterCorrect,
  eloAfterIncorrect,
  getInitialRating,
} from "@/lib/elo";
import {
  getRating as getStoredRating,
  setRating as persistRating,
  appendHistory,
} from "@/lib/storage";
import {
  hasPlayedToday,
  setLastPlayedToday,
  setTodayResult,
  getTodayResult,
  getLastPlayedDate,
} from "@/lib/daily";
import { updateStreakAndReturn } from "@/utils/streak";
import { getOrCreateUserId } from "@/lib/userId";

type Screen = "start" | "question" | "result" | "final";

const TIMER_SECONDS = 30;

export default function Home() {
  const [screen, setScreen] = useState<Screen>("start");
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [rating, setRatingState] = useState(getInitialRating());
  const [ratingAtSessionStart, setRatingAtSessionStart] = useState(
    getInitialRating()
  );
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastRatingDelta, setLastRatingDelta] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(TIMER_SECONDS);
  const [timerId, setTimerId] = useState<ReturnType<typeof setInterval> | null>(
    null
  );
  const answerLogSentForIndex = useRef<number>(-1);

  useEffect(() => {
    setRatingState(getStoredRating(getInitialRating()));
  }, []);

  const clearTimer = useCallback(() => {
    if (timerId) {
      clearInterval(timerId);
      setTimerId(null);
    }
  }, [timerId]);

  const startTimer = useCallback(() => {
    setSecondsLeft(TIMER_SECONDS);
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerId(id);
  }, []);

  useEffect(() => {
    if (screen !== "question" || sessionQuestions.length === 0) return;
    startTimer();
    return () => clearTimer();
  }, [screen, currentIndex, sessionQuestions.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (screen !== "question" || secondsLeft > 0 || sessionQuestions.length === 0) return;
    const q = sessionQuestions[currentIndex];
    if (!q) return;
    clearTimer();
    const { newRating, delta } = eloAfterIncorrect(rating, q.difficulty);
    if (answerLogSentForIndex.current !== currentIndex) {
      answerLogSentForIndex.current = currentIndex;
      const userId = getOrCreateUserId();
      if (userId) {
        fetch("/api/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            questionId: q.questionId,
            selectedOption: "",
            isCorrect: false,
            sourceUrl: q.sourceUrl || undefined,
            ratingBefore: rating,
            ratingAfter: newRating,
          }),
        }).catch((err) => console.error("[answer log]", err));
      }
    }
    fetch("/api/stats/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: q.questionId, isCorrect: false }),
    }).catch(() => {});
    setRatingState(newRating);
    persistRating(newRating);
    appendHistory({
      questionId: q.id,
      correct: false,
      ratingBefore: rating,
      ratingAfter: newRating,
      difficulty: q.difficulty,
      timestamp: Date.now(),
    });
    setLastCorrect(false);
    setLastRatingDelta(delta);
    setScreen("result");
  }, [screen, secondsLeft, currentIndex, sessionQuestions, rating, clearTimer]);

  const handleStart = () => {
    setSessionQuestions(getSessionQuestions());
    setCurrentIndex(0);
    setCorrectCount(0);
    setRatingAtSessionStart(rating);
    setScreen("question");
  };

  const handleSelect = async (choiceId: string) => {
    clearTimer();
    const q = sessionQuestions[currentIndex];
    if (!q) return;
    const isCorrect = q.answerChoiceId === choiceId;
    const { newRating, delta } = isCorrect
      ? eloAfterCorrect(rating, q.difficulty)
      : eloAfterIncorrect(rating, q.difficulty);
    if (answerLogSentForIndex.current !== currentIndex) {
      answerLogSentForIndex.current = currentIndex;
      const userId = getOrCreateUserId();
      if (userId) {
        fetch("/api/answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            questionId: q.questionId,
            selectedOption: choiceId,
            isCorrect,
            sourceUrl: q.sourceUrl || undefined,
            ratingBefore: rating,
            ratingAfter: newRating,
          }),
        }).catch((err) => console.error("[answer log]", err));
      }
    }
    try {
      await fetch("/api/stats/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.questionId, isCorrect }),
      });
    } catch {
      // 集計送信失敗時もプレイは継続
    }
    setRatingState(newRating);
    persistRating(newRating);
    appendHistory({
      questionId: q.id,
      correct: isCorrect,
      ratingBefore: rating,
      ratingAfter: newRating,
      difficulty: q.difficulty,
      timestamp: Date.now(),
    });
    setLastCorrect(isCorrect);
    setLastRatingDelta(delta);
    setScreen("result");
  };

  const handleNext = () => {
    if (lastCorrect) setCorrectCount((c) => c + 1);
    if (currentIndex + 1 >= QUESTIONS_PER_SESSION) {
      const finalCorrect = lastCorrect ? correctCount + 1 : correctCount;
      updateStreakAndReturn(getLastPlayedDate());
      setLastPlayedToday();
      setTodayResult({
        correctCount: finalCorrect,
        totalQuestions: QUESTIONS_PER_SESSION,
        ratingBefore: ratingAtSessionStart,
        ratingAfter: rating,
      });
      setScreen("final");
    } else {
      setCurrentIndex((i) => i + 1);
      setScreen("question");
    }
  };

  const handleBackToStart = () => {
    setScreen("start");
    setCurrentIndex(0);
    setCorrectCount(0);
  };

  const handleViewTodayResult = () => {
    const r = getTodayResult();
    if (!r) return;
    setCorrectCount(r.correctCount);
    setRatingAtSessionStart(r.ratingBefore);
    setRatingState(r.ratingAfter);
    setScreen("final");
  };

  if (screen === "start") {
    return (
      <StartView
        hasPlayedToday={hasPlayedToday()}
        onStart={handleStart}
        onViewTodayResult={handleViewTodayResult}
      />
    );
  }

  if (screen === "question" && sessionQuestions.length > 0) {
    const q = sessionQuestions[currentIndex];
    if (!q) return null;
    return (
      <QuestionView
        question={q}
        questionNumber={currentIndex + 1}
        totalQuestions={QUESTIONS_PER_SESSION}
        secondsLeft={secondsLeft}
        onSelect={handleSelect}
      />
    );
  }

  if (screen === "result" && sessionQuestions.length > 0) {
    const q = sessionQuestions[currentIndex];
    if (!q) return null;
    return (
      <ResultView
        questionId={q.questionId}
        isCorrect={lastCorrect}
        explanation={q.explanation}
        sourceLabel={q.sourceLabel}
        sourceUrl={q.sourceUrl}
        rating={rating}
        ratingDelta={lastRatingDelta}
        onNext={handleNext}
      />
    );
  }

  return (
    <FinalResultView
      correctCount={correctCount}
      totalQuestions={QUESTIONS_PER_SESSION}
      ratingBefore={ratingAtSessionStart}
      ratingAfter={rating}
      onBackToStart={handleBackToStart}
    />
  );
}
