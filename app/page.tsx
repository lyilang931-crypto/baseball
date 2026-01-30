"use client";

import { useState, useEffect, useCallback } from "react";
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

  const handleSelect = (choiceId: string) => {
    clearTimer();
    const q = sessionQuestions[currentIndex];
    if (!q) return;
    const isCorrect = q.answerChoiceId === choiceId;
    const { newRating, delta } = isCorrect
      ? eloAfterCorrect(rating, q.difficulty)
      : eloAfterIncorrect(rating, q.difficulty);
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

  if (screen === "start") {
    return <StartView onStart={handleStart} />;
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
