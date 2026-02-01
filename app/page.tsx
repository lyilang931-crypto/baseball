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
  getDataSourceShort,
} from "@/data/questions";
import type { StartOptions } from "./components/StartView";
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
  setTodayResult,
  getTodayResult,
  getLastPlayedDate,
  consumeOneAttempt,
  MAX_DAILY_ATTEMPTS,
} from "@/lib/daily";
import { updateStreakAndReturn } from "@/utils/streak";
import { getOrCreateUserId } from "@/lib/userId";
import { playResultSound } from "@/app/hooks/useResultSound";

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
  const [currentAttemptIndex, setCurrentAttemptIndex] = useState<number | null>(null);

  /** 回答後に GET で取得した最新 stats（ResultView に渡して即反映） */
  const [latestQuestionStats, setLatestQuestionStats] = useState<{
    questionId: string;
    answered_count: number;
    correct_count: number;
    total_attempts: number;
    total_correct: number;
    accuracy: number;
  } | null>(null);

  const fetchLatestStats = useCallback(async (questionId: string) => {
    const res = await fetch(
      `/api/stats/question?questionId=${encodeURIComponent(questionId)}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data as {
      questionId: string;
      answered_count: number;
      correct_count: number;
      total_attempts: number;
      total_correct: number;
      accuracy: number;
    };
  }, []);

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
    playResultSound(false);
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
    })
      .then(() =>
        fetch(
          `/api/stats/question?questionId=${encodeURIComponent(q.questionId)}`,
          { cache: "no-store" }
        )
      )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setLatestQuestionStats(data);
      })
      .catch(() => {});
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

  const handleStart = (options?: StartOptions) => {
    setSessionQuestions(
      getSessionQuestions(options?.dataOnly ? { dataOnly: true } : undefined)
    );
    setCurrentIndex(0);
    setCorrectCount(0);
    setRatingAtSessionStart(rating);
    setCurrentAttemptIndex(options?.attemptIndex ?? null);
    setScreen("question");
  };

  const handleSelect = async (choiceId: string) => {
    clearTimer();
    const q = sessionQuestions[currentIndex];
    if (!q) return;
    const isCorrect = q.answerChoiceId === choiceId;
    playResultSound(isCorrect);
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
      const stats = await fetchLatestStats(q.questionId);
      if (stats) setLatestQuestionStats(stats);
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
    if (currentIndex + 1 >= sessionQuestions.length) {
      const finalCorrect = lastCorrect ? correctCount + 1 : correctCount;
      consumeOneAttempt();
      updateStreakAndReturn(getLastPlayedDate());
      setTodayResult({
        correctCount: finalCorrect,
        totalQuestions: sessionQuestions.length,
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
        totalQuestions={sessionQuestions.length}
        attemptIndex={currentAttemptIndex ?? undefined}
        maxAttempts={MAX_DAILY_ATTEMPTS}
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
        initialStats={
          latestQuestionStats?.questionId === q.questionId
            ? latestQuestionStats
            : undefined
        }
        isCorrect={lastCorrect}
        explanation={q.explanation}
        sourceLabel={q.sourceLabel}
        sourceUrl={q.sourceUrl}
        sourceType={q.sourceType}
        questionType={getQuestionType(q)}
        sourceDataSourceShort={getDataSourceShort(q) ?? undefined}
        sourceGameId={q.sourceGameId}
        rating={rating}
        ratingDelta={lastRatingDelta}
        onNext={handleNext}
      />
    );
  }

  return (
    <FinalResultView
      correctCount={correctCount}
      totalQuestions={sessionQuestions.length}
      ratingBefore={ratingAtSessionStart}
      ratingAfter={rating}
      onBackToStart={handleBackToStart}
    />
  );
}
