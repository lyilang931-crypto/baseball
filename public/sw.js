/**
 * Service Worker - プッシュ通知ハンドラ
 * 今日の1球 Web Push Notifications
 */

const CACHE_NAME = "kyou-no-ikkyuu-v1";

// Service Worker インストール
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Service Worker アクティベート
self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// プッシュ通知を受信したときの処理
self.addEventListener("push", (event) => {
  let data = {
    title: "⚾ 今日の1球",
    body: "今日の1球が届きました。あなたならどうする？",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    url: "/",
  };

  // サーバーからJSONデータが送られてきた場合はそちらを使う
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    // Androidでの通知色（青）
    data: { url: data.url },
    // 通知をタップしたときに既存のものを置き換える
    tag: "daily-push",
    renotify: false,
    // 通知を画面に表示し続ける（ユーザーが閉じるまで）
    requireInteraction: false,
    // バイブレーション（Android）
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// 通知をタップしたときの処理
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";
  const absoluteUrl = new URL(targetUrl, self.location.origin).href;

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // すでにアプリが開いていればそのタブにフォーカス
        for (const client of clientList) {
          if (client.url === absoluteUrl && "focus" in client) {
            return client.focus();
          }
        }
        // 開いていなければ新しいタブで開く
        if (clients.openWindow) {
          return clients.openWindow(absoluteUrl);
        }
      })
  );
});

// 通知を閉じたときの処理（分析用）
self.addEventListener("notificationclose", (event) => {
  // 必要に応じて閉じイベントをトラッキング
  console.log("[SW] Notification closed:", event.notification.tag);
});
