/**
 * Web Push 通知 - クライアントサイドライブラリ
 * 今日の1球 / DAU改善目的
 *
 * 流れ:
 * 1. registerServiceWorker() でSWを登録
 * 2. subscribeToPush() でブラウザの通知許可を取得し、Supabaseに購読情報を保存
 * 3. サーバー側（Vercel Cron）が毎日0時JSTに全購読者へ通知送信
 */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

/** base64url → Uint8Array 変換（VAPID公開鍵の変換に使用） */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from(Array.from(rawData).map((char) => char.charCodeAt(0)));
}

/** このブラウザがWeb Pushをサポートしているか確認 */
export function isPushSupported(): boolean {
  if (typeof window === "undefined") return false;
  return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
}

/** 現在の通知権限状態を返す */
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

/** Service Worker を登録する（アプリ起動時に呼ぶ） */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("[Push] Service Worker registered:", registration.scope);
    return registration;
  } catch (error) {
    console.error("[Push] Service Worker registration failed:", error);
    return null;
  }
}

/** 現在のプッシュ購読情報を取得する */
export async function getCurrentSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}

/** ユーザーがすでに購読済みかどうか確認 */
export async function isAlreadySubscribed(): Promise<boolean> {
  const sub = await getCurrentSubscription();
  return sub !== null;
}

/**
 * プッシュ通知を購読する
 * - ブラウザの通知許可ダイアログを表示
 * - 許可されたらサーバーに購読情報を送信して保存
 * @returns "subscribed" | "denied" | "already_subscribed" | "error"
 */
export async function subscribeToPush(
  userId: string
): Promise<"subscribed" | "denied" | "already_subscribed" | "error"> {
  if (!isPushSupported()) return "error";
  if (!VAPID_PUBLIC_KEY) {
    console.error("[Push] NEXT_PUBLIC_VAPID_PUBLIC_KEY が設定されていません");
    return "error";
  }

  try {
    // 通知許可を要求
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("[Push] 通知が拒否されました");
      return "denied";
    }

    const registration = await navigator.serviceWorker.ready;

    // すでに購読済みならスキップ
    const existingSub = await registration.pushManager.getSubscription();
    if (existingSub) {
      // エンドポイントが変わっている場合は再登録
      await sendSubscriptionToServer(existingSub, userId);
      return "already_subscribed";
    }

    // 新規購読
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });

    // サーバーに保存
    await sendSubscriptionToServer(subscription, userId);
    console.log("[Push] 購読完了:", subscription.endpoint);
    return "subscribed";
  } catch (error) {
    console.error("[Push] 購読エラー:", error);
    return "error";
  }
}

/**
 * プッシュ通知の購読を解除する
 * @returns true: 成功, false: 失敗
 */
export async function unsubscribeFromPush(userId: string): Promise<boolean> {
  if (!isPushSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return true; // すでに未購読

    // サーバー側から削除
    await fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        userId,
      }),
    });

    // ブラウザ側でも解除
    const result = await subscription.unsubscribe();
    console.log("[Push] 購読解除:", result);
    return result;
  } catch (error) {
    console.error("[Push] 購読解除エラー:", error);
    return false;
  }
}

/** 購読情報をサーバーに送信して保存 */
async function sendSubscriptionToServer(
  subscription: PushSubscription,
  userId: string
): Promise<void> {
  const key = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");

  if (!key || !auth) {
    throw new Error("購読情報のキーが取得できませんでした");
  }

  const response = await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId,
      endpoint: subscription.endpoint,
      p256dh: btoa(String.fromCharCode(...Array.from(new Uint8Array(key)))),
      auth: btoa(String.fromCharCode(...Array.from(new Uint8Array(auth)))),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    // ステータスコードを含めてログ出力（デバッグ用）
    console.error(
      `[Push] sendSubscriptionToServer failed: status=${response.status}, body=${text}, endpoint_length=${subscription.endpoint.length}`
    );
    throw new Error(`サーバーへの保存に失敗しました (${response.status}): ${text}`);
  }
}
