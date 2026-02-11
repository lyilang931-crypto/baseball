/**
 * GA4 カスタムイベント送信
 * - window.gtag が無い場合は安全にスキップ（広告ブロッカー等）
 * - 重複送信防止に once(key) を提供
 * - ?debug_panel=true 時は console.log + window.__lastEvents に保存
 */

const GA_ONCE_PREFIX = "ga_once_";
const SESSION_ID_KEY = "ga_session_id";
const MAX_DEBUG_EVENTS = 20;

export interface DebugEvent {
  eventName: string;
  params: Record<string, unknown>;
  timestamp: number;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * セッションIDを取得（同一タブ内で共通。sessionStorage に保持）
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id) {
      id = generateId();
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return id;
  } catch {
    return generateId();
  }
}

/**
 * 同一キーで1回だけ true を返す。2回目以降は false（sessionStorage 使用）
 */
export function once(key: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    const storageKey = GA_ONCE_PREFIX + key;
    if (sessionStorage.getItem(storageKey) === "1") return false;
    sessionStorage.setItem(storageKey, "1");
    return true;
  } catch {
    return true;
  }
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    __lastEvents?: DebugEvent[];
  }
}

/** debug_panel=true がクエリに含まれているか（一度判定したらキャッシュ） */
let _debugMode: boolean | null = null;
function isDebugMode(): boolean {
  if (typeof window === "undefined") return false;
  if (_debugMode !== null) return _debugMode;
  try {
    _debugMode = new URLSearchParams(window.location.search).has("debug_panel");
  } catch {
    _debugMode = false;
  }
  return _debugMode;
}

/**
 * GA4 にカスタムイベントを送信
 * - gtag が無い場合は何もしない（アプリは落ちない）
 * - debug_panel=true 時は console.log でイベント名と params を表示
 * - window.__lastEvents に直近20件を保存（デバッグ用）
 */
export function track(
  eventName: string,
  params: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  const debug =
    isDebugMode() ||
    (typeof process !== "undefined" && process.env?.NODE_ENV !== "production");

  // デバッグバッファに保存（debug_panel=true 時のみ）
  if (isDebugMode()) {
    if (!window.__lastEvents) window.__lastEvents = [];
    window.__lastEvents.push({
      eventName,
      params,
      timestamp: Date.now(),
    });
    if (window.__lastEvents.length > MAX_DEBUG_EVENTS) {
      window.__lastEvents = window.__lastEvents.slice(-MAX_DEBUG_EVENTS);
    }
    // カスタムイベントで DebugPanel に通知
    window.dispatchEvent(new CustomEvent("__debug_event"));
  }

  if (debug) {
    console.log(
      "%c[GA4]%c " + eventName,
      "background:#4285f4;color:#fff;padding:1px 4px;border-radius:3px;font-weight:bold",
      "color:#333;font-weight:bold",
      params
    );
  }

  const gtag = window.gtag;
  if (typeof gtag !== "function") {
    if (debug) {
      console.warn("[GA4] window.gtag is not available – event NOT sent to GA4:", eventName);
    }
    return;
  }
  try {
    gtag("event", eventName, params);
  } catch {
    // 広告ブロッカー等で落ちないように握りつぶす
  }
}
