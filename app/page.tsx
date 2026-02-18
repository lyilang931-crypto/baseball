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
  getAllQuestions,
  QUESTIONS_PER_SESSION,
  getDataSourceShort,
  getQuestionType,
  runDevValidation,
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
  getYesterdayDate,
  getTodayDate,
  consumeOneAttempt,
  getTodayAttemptsUsed,
  MAX_DAILY_ATTEMPTS,
  getDailyUsedQuestionIds,
  addDailyUsedQuestionIds,
} from "@/lib/daily";
import { updateStreakAndReturn, ensureTodayStreak } from "@/utils/streak";
import { getOrCreateUserId } from "@/lib/userId";
import { playResultSound } from "@/app/hooks/useResultSound";
import { tracker, logger } from "@/lib/monitoring";
import { reportError } from "@/lib/error-handler";
import {
  getPitchingDailyChallengeQuestions,
  saveDailyChallengeResult,
  isDailyChallengeCompleted,
} from "@/lib/dailyChallenge";
import { track, getSessionId, once } from "@/lib/analytics";
import { addWeeklySession } from "@/lib/weeklyChallenge";

type Screen = "start" | "question" | "result" | "final";

const TIMER_SECONDS = 30;
/** 正解/不正解UI表示後にSFXを鳴らすベース遅延（ms）。現行値をここで固定。 */
const BASE_SFX_DELAY_MS = 120;
/**
 * 実際に使用するSFX遅延（ms）。
 * 現在より100msだけ早くしつつ、早くなりすぎないよう最低100msは必ず残す。
 * newDelayMs = Math.max(100, BASE_SFX_DELAY_MS - 100)
 * 例: BASE_SFX_DELAY_MS = 120ms → SFX_DELAY_MS = 100ms（20msだけ遅延を残す）
 */
const SFX_DELAY_MS = Math.max(100, BASE_SFX_DELAY_MS - 100);

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
  /** SFXを1問につき1回だけ鳴らすためのキー（二重再生・rerender防止） */
  const lastSfxPlayedKeyRef = useRef<string | null>(null);
  /** 回答送信中は選択肢を無効化（連打防止） */
  const [isAnswering, setIsAnswering] = useState(false);
  /** 現在のセッション内での連続正解数 */
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  /** デイリーチャレンジモードか */
  const [isDailyChallenge, setIsDailyChallenge] = useState(false);
  /** GA4: 同一ランで challenge_start / challenge_complete を1回だけ送る用 */
  const challengeStartFiredRef = useRef(false);
  const challengeCompleteFiredRef = useRef(false);
  /** 初回セッション判定フラグ（difficulty cap + delta 圧縮用） */
  const isFirstSessionRef = useRef(false);

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
    // 開発時のみ問題品質バリデーションを実行
    runDevValidation();
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

  /** 結果画面表示後にSFXを1回だけ遅延再生（二重再生・rerender防止） */
  useEffect(() => {
    if (screen !== "result" || sessionQuestions.length === 0) return;
    const q = sessionQuestions[currentIndex];
    if (!q) return;
    const key = `${q.questionId}:feedback`;
    if (lastSfxPlayedKeyRef.current === key) return;
    lastSfxPlayedKeyRef.current = key;
    const t = setTimeout(() => {
      playResultSound(lastCorrect);
    }, SFX_DELAY_MS);
    return () => clearTimeout(t);
  }, [screen, currentIndex, sessionQuestions, lastCorrect]);

  /** 問題画面に戻ったら回答中フラグをリセット */
  useEffect(() => {
    if (screen === "question") setIsAnswering(false);
  }, [screen]);

  // GA4: 最初の問題表示時に challenge_start を1回だけ送る
  useEffect(() => {
    if (
      screen !== "question" ||
      sessionQuestions.length === 0 ||
      currentIndex !== 0 ||
      challengeStartFiredRef.current
    )
      return;
    const q = sessionQuestions[0];
    if (!q) return;
    challengeStartFiredRef.current = true;
    const mode = isDailyChallenge ? "daily_pitching" : "daily_normal";
    track("challenge_start", {
      app: "baseball-quiz-web",
      mode,
      question_id: q.id,
      session_id: getSessionId(),
      is_pro: false,
      step: 1,
    });
  }, [screen, sessionQuestions, currentIndex, isDailyChallenge]);

  useEffect(() => {
    // タイムアウト判定: タイマーが動作中で0秒になった場合のみ（遷移中の誤発火を防止）
    if (screen !== "question" || secondsLeft > 0 || sessionQuestions.length === 0) return;
    // タイマーがセットされていない場合は遷移中と判断してスキップ
    if (timerId === null) return;
    // 既にこのインデックスで回答ログを送信済みなら処理済み
    if (answerLogSentForIndex.current === currentIndex) return;
    const q = sessionQuestions[currentIndex];
    if (!q) return;
    clearTimer();

    // タイムアウトをトラッキング
    tracker.event("answer_timeout", {
      questionId: q.questionId,
      questionIndex: currentIndex,
    });

    const { newRating, delta } = eloAfterIncorrect(rating, q.difficulty);
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
      }).catch((err) => reportError(err, { context: "answer_log", questionId: q.questionId }));
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
    setConsecutiveCorrect(0); // タイムアウトで連続正解リセット
    setScreen("result");
  }, [screen, secondsLeft, currentIndex, sessionQuestions, rating, clearTimer, timerId]);

  const handleStart = (options?: StartOptions) => {
    lastSfxPlayedKeyRef.current = null;
    challengeStartFiredRef.current = false;
    challengeCompleteFiredRef.current = false;

    // セッション開始 = 今日参加した → streak を即更新（1問でも維持）
    ensureTodayStreak();

    // デイリーチャレンジモード（配球チャレンジ）
    if (options?.dailyChallenge) {
      if (isDailyChallengeCompleted()) {
        if (typeof window !== "undefined") {
          window.alert("今日のデイリーチャレンジは完了済みです。");
        }
        return;
      }
      const allQ = getAllQuestions();
      // 配球チャレンジ用：mode === "pitching" の問題のみ
      const dailyQuestions = getPitchingDailyChallengeQuestions(allQ, 5);
      if (dailyQuestions.length === 0) {
        logger.warn("No pitching questions available for daily challenge");
        return;
      }
      setIsDailyChallenge(true);
      setSessionQuestions(dailyQuestions);
      setCurrentIndex(0);
      setCorrectCount(0);
      setConsecutiveCorrect(0);
      setRatingAtSessionStart(rating);
      setCurrentAttemptIndex(null);
      setScreen("question");
      tracker.event("session_started", {
        questionCount: dailyQuestions.length,
        dailyChallenge: true,
        initialRating: rating,
      });
      return;
    }

    setIsDailyChallenge(false);
    const used = getDailyUsedQuestionIds();

    // ① 初回セッション: difficulty ≤ 3 に制限（成功体験を保証）
    const isFirstEver = getStoredRating(getInitialRating()) === getInitialRating();
    const isFirstToday = getTodayAttemptsUsed() === 0;
    isFirstSessionRef.current = isFirstEver && isFirstToday;

    let questions: Question[];
    if (isFirstSessionRef.current) {
      const allQ = getAllQuestions();
      const easyPool = allQ.filter(
        (q) => q.difficulty <= 3 && !used.includes(q.questionId)
      );
      if (easyPool.length >= QUESTIONS_PER_SESSION) {
        const shuffled = [...easyPool].sort(() => Math.random() - 0.5);
        questions = shuffled.slice(0, QUESTIONS_PER_SESSION);
      } else {
        // フォールバック: easy が足りなければ通常選択
        questions = getSessionQuestions({
          dataOnly: options?.dataOnly ?? false,
          excludeQuestionIds: used,
        });
      }
    } else {
      questions = getSessionQuestions({
        dataOnly: options?.dataOnly ?? false,
        excludeQuestionIds: used,
      });
    }

    if (questions.length === 0) {
      logger.warn("No questions available for session", { dataOnly: options?.dataOnly });
      if (typeof window !== "undefined") {
        window.alert("今日の出題が不足しています（問題追加中）。明日またお試しください。");
      }
      return;
    }
    addDailyUsedQuestionIds(questions.map((q) => q.questionId));
    setSessionQuestions(questions);
    setCurrentIndex(0);
    setCorrectCount(0);
    setConsecutiveCorrect(0);
    setRatingAtSessionStart(rating);
    setCurrentAttemptIndex(options?.attemptIndex ?? null);
    setScreen("question");

    // セッション開始をトラッキング
    tracker.event("session_started", {
      questionCount: questions.length,
      dataOnly: options?.dataOnly ?? false,
      attemptIndex: options?.attemptIndex,
      initialRating: rating,
    });
  };

  const handleSelect = async (choiceId: string) => {
    if (isAnswering) return;
    setIsAnswering(true);
    clearTimer();
    const q = sessionQuestions[currentIndex];
    if (!q) {
      setIsAnswering(false);
      return;
    }
    const isCorrect = q.answerChoiceId === choiceId;
    try {
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
          }).catch((err) => reportError(err, { context: "answer_log", questionId: q.questionId }));
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
      // 連続正解数を更新
      if (isCorrect) {
        setConsecutiveCorrect((c) => c + 1);
      } else {
        setConsecutiveCorrect(0);
      }
      setScreen("result");
    } finally {
      setIsAnswering(false);
    }
  };

  const handleNext = () => {
    if (lastCorrect) setCorrectCount((c) => c + 1);
    if (currentIndex + 1 >= sessionQuestions.length) {
      const finalCorrect = lastCorrect ? correctCount + 1 : correctCount;
      const lastPlayed = getLastPlayedDate();

      if (isDailyChallenge) {
        saveDailyChallengeResult(finalCorrect, rating - ratingAtSessionStart);
        const newStreak = updateStreakAndReturn(lastPlayed);
        if (
          lastPlayed === getYesterdayDate() &&
          newStreak >= 2 &&
          once("streak_continue_" + getTodayDate())
        ) {
          track("streak_continue", {
            app: "baseball-quiz-web",
            mode: "daily_pitching",
            question_id: sessionQuestions[sessionQuestions.length - 1]?.id ?? 0,
            session_id: getSessionId(),
            is_pro: false,
            streak_days: newStreak,
            source: "daily",
          });
        }
      } else {
        consumeOneAttempt();
        const newStreak = updateStreakAndReturn(lastPlayed);
        if (
          lastPlayed === getYesterdayDate() &&
          newStreak >= 2 &&
          once("streak_continue_" + getTodayDate())
        ) {
          track("streak_continue", {
            app: "baseball-quiz-web",
            mode: "daily_normal",
            question_id: sessionQuestions[sessionQuestions.length - 1]?.id ?? 0,
            session_id: getSessionId(),
            is_pro: false,
            streak_days: newStreak,
            source: "daily",
          });
        }
      }

      // ① 初回セッション: マイナスを50%圧縮（心理ダメージ緩和）
      let finalRating = rating;
      if (isFirstSessionRef.current && !isDailyChallenge) {
        const sessionDelta = rating - ratingAtSessionStart;
        if (sessionDelta < 0) {
          const compressed = Math.round(sessionDelta * 0.5);
          finalRating = ratingAtSessionStart + compressed;
          setRatingState(finalRating);
          persistRating(finalRating);
        }
        isFirstSessionRef.current = false;
      }

      // ③ セッション履歴を localStorage に保存（成長表示用・最大10件）
      try {
        const logKey = "bq_session_log";
        const raw = localStorage.getItem(logKey);
        const log: Array<{ c: number; t: number; r: number; ts: number }> =
          raw ? JSON.parse(raw) : [];
        log.push({
          c: finalCorrect,
          t: sessionQuestions.length,
          r: finalRating,
          ts: Date.now(),
        });
        if (log.length > 10) log.splice(0, log.length - 10);
        localStorage.setItem(logKey, JSON.stringify(log));
      } catch {
        // ignore
      }

      // 週間チャレンジに今回のセッション結果を加算
      addWeeklySession(finalCorrect, sessionQuestions.length);

      setTodayResult({
        correctCount: finalCorrect,
        totalQuestions: sessionQuestions.length,
        ratingBefore: ratingAtSessionStart,
        ratingAfter: finalRating,
      });

      if (!challengeCompleteFiredRef.current) {
        challengeCompleteFiredRef.current = true;
        const mode = isDailyChallenge ? "daily_pitching" : "daily_normal";
        track("challenge_complete", {
          app: "baseball-quiz-web",
          mode,
          question_id: sessionQuestions[sessionQuestions.length - 1]?.id ?? 0,
          session_id: getSessionId(),
          is_pro: false,
          total_questions: 5,
          correct_count: finalCorrect,
        });
      }

      tracker.event("session_completed", {
        correctCount: finalCorrect,
        totalQuestions: sessionQuestions.length,
        ratingBefore: ratingAtSessionStart,
        ratingAfter: finalRating,
        ratingDelta: finalRating - ratingAtSessionStart,
        dailyChallenge: isDailyChallenge,
      });

      setScreen("final");
    } else {
      // タイマーを先にクリアしてから状態をリセット（二重タイムアウト防止）
      clearTimer();
      // 回答ログ送信済みフラグをリセット
      answerLogSentForIndex.current = -1;
      // 秒数を先にリセット（useEffectのタイムアウト判定より前に）
      setSecondsLeft(TIMER_SECONDS);
      setCurrentIndex((i) => i + 1);
      setScreen("question");
      setLastCorrect(false);
      setLastRatingDelta(0);
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
        consecutiveCorrect={consecutiveCorrect}
        onSelect={handleSelect}
        optionsDisabled={isAnswering}
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
        correctChoiceText={
          q.choices.find((c) => c.id === q.answerChoiceId)?.text ?? ""
        }
        explanation={q.explanation}
        alternativeNote={q.alternativeNote}
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
      analyticsMode={isDailyChallenge ? "daily_pitching" : "daily_normal"}
      analyticsQuestionId={sessionQuestions[sessionQuestions.length - 1]?.id ?? 0}
      isDailyChallenge={isDailyChallenge}
    />
  );
}
