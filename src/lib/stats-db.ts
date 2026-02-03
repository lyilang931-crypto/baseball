/**
 * 問題ごとの正答率集計（永続化層）
 * - DATABASE_URL が設定されていれば Postgres を使用
 * - 未設定なら in-memory フォールバック（ローカル・再起動でリセット）
 */

import { logger, errorToContext } from "./monitoring";

export interface QuestionStats {
  questionId: string;
  total_attempts: number;
  total_correct: number;
  accuracy: number;
}

const TABLE_NAME = "stats_question_aggregate";

/** in-memory フォールバック用 */
const memoryStore = new Map<
  string,
  { total_attempts: number; total_correct: number }
>();

let _pool: import("pg").Pool | null = null;
let _poolInitialized = false;

function pool(): import("pg").Pool | null {
  if (_poolInitialized) return _pool;
  _poolInitialized = true;

  if (!process.env.DATABASE_URL) {
    logger.info("DATABASE_URL not set, using in-memory stats store", {}, "stats-db");
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Pool } = require("pg");
    _pool = new Pool({ connectionString: process.env.DATABASE_URL });
    logger.info("PostgreSQL pool initialized", {}, "stats-db");
    return _pool;
  } catch (e) {
    logger.error("Failed to initialize PostgreSQL pool", errorToContext(e), "stats-db");
    return null;
  }
}

/** テーブルが無ければ作成（Postgres 時のみ） */
export async function ensureTable(): Promise<void> {
  const p = pool();
  if (!p) return;

  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (
        question_id TEXT PRIMARY KEY,
        total_attempts INTEGER NOT NULL DEFAULT 0,
        total_correct INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
  } catch (e) {
    logger.error("Failed to ensure stats table", errorToContext(e), "stats-db");
    throw e;
  }
}

/** 1件の回答を記録し、更新後の統計を返す */
export async function recordAnswer(
  questionId: string,
  isCorrect: boolean
): Promise<QuestionStats> {
  const p = pool();

  if (p) {
    try {
      await ensureTable();
      await p.query(
        `
        INSERT INTO ${TABLE_NAME} (question_id, total_attempts, total_correct)
        VALUES ($1, 1, $2)
        ON CONFLICT (question_id) DO UPDATE SET
          total_attempts = ${TABLE_NAME}.total_attempts + 1,
          total_correct = ${TABLE_NAME}.total_correct + EXCLUDED.total_correct,
          updated_at = NOW()
        `,
        [questionId, isCorrect ? 1 : 0]
      );
      return await getStats(questionId);
    } catch (e) {
      logger.error("Failed to record answer in PostgreSQL", {
        ...errorToContext(e),
        questionId,
        isCorrect,
      }, "stats-db");
      throw e;
    }
  }

  // In-memory fallback
  const key = questionId;
  const cur = memoryStore.get(key) ?? {
    total_attempts: 0,
    total_correct: 0,
  };
  cur.total_attempts += 1;
  if (isCorrect) cur.total_correct += 1;
  memoryStore.set(key, cur);

  return {
    questionId,
    total_attempts: cur.total_attempts,
    total_correct: cur.total_correct,
    accuracy:
      cur.total_attempts === 0
        ? 0
        : Math.round((cur.total_correct / cur.total_attempts) * 100) / 100,
  };
}

/** 問題IDの統計を取得 */
export async function getStats(questionId: string): Promise<QuestionStats> {
  const p = pool();

  if (p) {
    try {
      await ensureTable();
      const res = await p.query(
        `SELECT question_id, total_attempts, total_correct FROM ${TABLE_NAME} WHERE question_id = $1`,
        [questionId]
      );
      const row = res.rows[0];
      if (!row) {
        return {
          questionId,
          total_attempts: 0,
          total_correct: 0,
          accuracy: 0,
        };
      }
      const attempts = Number(row.total_attempts);
      const correct = Number(row.total_correct);
      return {
        questionId: row.question_id,
        total_attempts: attempts,
        total_correct: correct,
        accuracy: attempts === 0 ? 0 : Math.round((correct / attempts) * 100) / 100,
      };
    } catch (e) {
      logger.error("Failed to get stats from PostgreSQL", {
        ...errorToContext(e),
        questionId,
      }, "stats-db");
      throw e;
    }
  }

  // In-memory fallback
  const cur = memoryStore.get(questionId) ?? {
    total_attempts: 0,
    total_correct: 0,
  };
  return {
    questionId,
    total_attempts: cur.total_attempts,
    total_correct: cur.total_correct,
    accuracy:
      cur.total_attempts === 0
        ? 0
        : Math.round((cur.total_correct / cur.total_attempts) * 100) / 100,
  };
}

/** in-memory ストアをクリア（テスト用） */
export function clearMemoryStore(): void {
  memoryStore.clear();
}

/** in-memory ストアの内容を取得（デバッグ用） */
export function getMemoryStoreSnapshot(): Map<string, { total_attempts: number; total_correct: number }> {
  return new Map(memoryStore);
}
