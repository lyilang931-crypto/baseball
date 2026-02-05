/**
 * Google Play 収益化の下準備
 * =====================================================================
 *
 * 【現在の実装状態】
 * - SDK未導入（設計・フラグ管理のみ）
 * - 実際の広告表示・課金処理は将来実装
 *
 * 【収益化モデル】
 * 1. 無料版: 1日3回まで（5問×3回=15問/日）
 * 2. 広告視聴: 追加プレイや特典獲得
 * 3. 月額課金: 広告非表示 + 無制限プレイ + 詳細分析
 *
 * 【広告ポイント（将来実装）】
 * - リザルト画面: インタースティシャル広告（セッション完了時）
 * - デイリーボーナス: リワード広告（追加プレイ獲得）
 * - スタート画面: バナー広告（控えめに）
 *
 * =====================================================================
 */

// =====================================================================
// 無料版制限の設定
// =====================================================================

/** 無料ユーザーの1日あたりの最大セッション数 */
export const FREE_DAILY_SESSIONS = 3;

/** 1セッションあたりの問題数 */
export const QUESTIONS_PER_SESSION = 5;

/** 無料ユーザーの1日あたりの最大問題数 */
export const FREE_DAILY_QUESTIONS = FREE_DAILY_SESSIONS * QUESTIONS_PER_SESSION;

// =====================================================================
// 広告ポイントの定義（SDK導入時に使用）
// =====================================================================

/** 広告表示タイミングの種類 */
export type AdPlacement =
  | "result_interstitial"    // リザルト画面（インタースティシャル）
  | "daily_bonus_rewarded"   // デイリーボーナス（リワード広告）
  | "start_banner"           // スタート画面（バナー）
  | "extra_play_rewarded";   // 追加プレイ獲得（リワード広告）

/** 広告ポイントの設定 */
export const AD_PLACEMENTS: Record<AdPlacement, {
  type: "interstitial" | "rewarded" | "banner";
  frequency?: number; // 何回に1回表示するか（インタースティシャル用）
  reward?: string;    // 報酬の説明（リワード用）
}> = {
  result_interstitial: {
    type: "interstitial",
    frequency: 2, // 2セッションに1回
  },
  daily_bonus_rewarded: {
    type: "rewarded",
    reward: "追加1セッション",
  },
  start_banner: {
    type: "banner",
  },
  extra_play_rewarded: {
    type: "rewarded",
    reward: "本日の制限リセット",
  },
};

// =====================================================================
// 課金フラグ・プレミアム機能の定義
// =====================================================================

/** プレミアム機能の種類 */
export type PremiumFeature =
  | "ad_free"           // 広告非表示
  | "unlimited_play"    // 無制限プレイ
  | "detailed_stats"    // 詳細な成績分析
  | "priority_support"; // 優先サポート

/** プレミアムプランの定義 */
export interface PremiumPlan {
  id: string;
  name: string;
  price: number; // 円
  period: "monthly" | "yearly" | "lifetime";
  features: PremiumFeature[];
}

/** 利用可能なプレミアムプラン */
export const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: "monthly_basic",
    name: "配球マスター（月額）",
    price: 480,
    period: "monthly",
    features: ["ad_free", "unlimited_play"],
  },
  {
    id: "monthly_pro",
    name: "配球プロ（月額）",
    price: 980,
    period: "monthly",
    features: ["ad_free", "unlimited_play", "detailed_stats"],
  },
  {
    id: "yearly_pro",
    name: "配球プロ（年額）",
    price: 7800, // 約2ヶ月分お得
    period: "yearly",
    features: ["ad_free", "unlimited_play", "detailed_stats"],
  },
];

// =====================================================================
// ユーザーの課金状態管理（LocalStorage）
// =====================================================================

const MONETIZATION_KEY = "baseball_quiz_monetization";

export interface MonetizationState {
  /** プレミアム購読中か */
  isPremium: boolean;
  /** 購読プランID */
  planId?: string;
  /** 購読開始日（ISO文字列） */
  subscribedAt?: string;
  /** 購読終了日（ISO文字列） */
  expiresAt?: string;
  /** 今日の広告視聴による追加セッション数 */
  adBonusSessions: number;
  /** 最後に広告ボーナスを取得した日付（YYYY-MM-DD） */
  lastAdBonusDate?: string;
}

const DEFAULT_STATE: MonetizationState = {
  isPremium: false,
  adBonusSessions: 0,
};

/** 収益化状態を取得 */
export function getMonetizationState(): MonetizationState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const s = localStorage.getItem(MONETIZATION_KEY);
    if (!s) return DEFAULT_STATE;
    const parsed = JSON.parse(s) as Partial<MonetizationState>;
    return { ...DEFAULT_STATE, ...parsed };
  } catch {
    return DEFAULT_STATE;
  }
}

/** 収益化状態を保存 */
export function setMonetizationState(state: MonetizationState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(MONETIZATION_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

// =====================================================================
// ユーティリティ関数
// =====================================================================

/** ユーザーがプレミアムかどうか */
export function isPremiumUser(): boolean {
  const state = getMonetizationState();
  if (!state.isPremium) return false;
  // 有効期限チェック
  if (state.expiresAt) {
    const expires = new Date(state.expiresAt);
    if (expires < new Date()) {
      // 期限切れの場合は状態を更新
      setMonetizationState({ ...state, isPremium: false });
      return false;
    }
  }
  return true;
}

/** 特定のプレミアム機能が有効かどうか */
export function hasFeature(feature: PremiumFeature): boolean {
  const state = getMonetizationState();
  if (!state.isPremium || !state.planId) return false;
  const plan = PREMIUM_PLANS.find(p => p.id === state.planId);
  return plan?.features.includes(feature) ?? false;
}

/** JST の YYYY-MM-DD を返す（daily.ts と同じロジック） */
function getTodayJST(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** 今日のボーナスセッション数を取得 */
export function getTodayBonusSessions(): number {
  const state = getMonetizationState();
  const today = getTodayJST();
  return state.lastAdBonusDate === today ? state.adBonusSessions : 0;
}

/** 今日の残りプレイ回数を取得（広告ボーナス含む） */
export function getRemainingPlays(usedAttempts: number): number {
  if (isPremiumUser()) return Infinity;

  const bonusSessions = getTodayBonusSessions();
  return Math.max(0, FREE_DAILY_SESSIONS + bonusSessions - usedAttempts);
}

/** 広告視聴でボーナスセッションを追加（将来実装用） */
export function addAdBonusSession(): void {
  const state = getMonetizationState();
  const today = getTodayJST();

  setMonetizationState({
    ...state,
    adBonusSessions: state.lastAdBonusDate === today
      ? state.adBonusSessions + 1
      : 1,
    lastAdBonusDate: today,
  });
}

/** 広告を表示すべきかどうか判定 */
export function shouldShowAd(placement: AdPlacement): boolean {
  if (isPremiumUser() || hasFeature("ad_free")) return false;

  // TODO: 実際の広告SDK導入時にロジックを実装
  // 現在はフラグのみ
  return true;
}

// =====================================================================
// 抽象 API（UIはこれを呼ぶだけ）
// =====================================================================

/**
 * リワード広告が利用可能か（SDK導入前はfalse固定）。
 * 将来: AdMob の isReady() をラップする想定。
 */
export function adsRewardedAvailable(): boolean {
  // TODO: AdMob SDK 導入後に isLoaded / isReady を確認
  // 開発環境ではシミュレーション用に true
  if (typeof process !== "undefined" && process.env?.NODE_ENV === "development") {
    return true;
  }
  return false;
}

/**
 * 追加プレイ付与（広告視聴完了コールバックから呼ぶ）。
 * addAdBonusSession の semantic alias。
 */
export function grantExtraAttempt(): void {
  addAdBonusSession();
}

/**
 * インタースティシャル広告を表示すべきセッション完了か判定。
 * frequency 設定に基づくカウンタ管理。
 */
export function shouldShowInterstitial(completedSessionCount: number): boolean {
  if (isPremiumUser() || hasFeature("ad_free")) return false;
  const config = AD_PLACEMENTS.result_interstitial;
  const freq = config.frequency ?? 2;
  return completedSessionCount > 0 && completedSessionCount % freq === 0;
}

// =====================================================================
// プレミアム購読シミュレーション（テスト用）
// =====================================================================

/** テスト用: プレミアムを有効化 */
export function _testEnablePremium(planId: string): void {
  if (process.env.NODE_ENV !== "development") return;
  const plan = PREMIUM_PLANS.find(p => p.id === planId);
  if (!plan) return;

  const now = new Date();
  const expiresAt = new Date(now);
  if (plan.period === "monthly") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (plan.period === "yearly") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  } else {
    expiresAt.setFullYear(expiresAt.getFullYear() + 100);
  }

  setMonetizationState({
    isPremium: true,
    planId,
    subscribedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    adBonusSessions: 0,
  });
}

/** テスト用: プレミアムを無効化 */
export function _testDisablePremium(): void {
  if (process.env.NODE_ENV !== "development") return;
  setMonetizationState(DEFAULT_STATE);
}
