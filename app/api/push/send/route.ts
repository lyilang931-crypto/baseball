/**
 * POST /api/push/send - 全購読者にプッシュ通知を送信
 *
 * 呼び出し元:
 *   - Vercel Cron Job（毎日 15:00 UTC = 深夜0時 JST）
 *   - 手動テスト時: Authorization: Bearer <PUSH_SECRET>
 *
 * 必要な環境変数:
 *   VAPID_PUBLIC_KEY   - VAPID公開鍵
 *   VAPID_PRIVATE_KEY  - VAPID秘密鍵
 *   VAPID_SUBJECT      - mailto:your@email.com
 *   PUSH_SECRET        - Cronからの呼び出しを認証するシークレット
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

/** VAPID設定を初期化 */
function initWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey || !subject) {
    throw new Error(
      "VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT が設定されていません"
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

/** Supabaseクライアントを取得 */
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase環境変数が設定されていません");
  return createClient(url, key);
}

/** JST で "明日のテーマ" を取得（tomorrowPreview と同じロジック） */
function getTodayThemeMessage(): { title: string; body: string } {
  const themes = [
    { theme: "決め球の選択", teaser: "追い込んだ後、何を投げる？" },
    { theme: "ピンチの配球", teaser: "満塁のマウンドで問われる判断" },
    { theme: "初球の入り方", teaser: "最初の1球が勝負を決める" },
    { theme: "フルカウントの心理戦", teaser: "3-2から投げるべき球は？" },
    { theme: "左右の駆け引き", teaser: "左打者への定石、知ってる？" },
    { theme: "リード時の攻め方", teaser: "勝ってる時こそ難しい配球" },
    { theme: "速球 vs 変化球", teaser: "データが覆す常識がある" },
    { theme: "クリーンナップ攻略", teaser: "強打者を抑える頭脳戦" },
    { theme: "データ野球の真実", teaser: "数字が語る意外な事実" },
    { theme: "名勝負の判断力", teaser: "あの場面、あなたならどうする？" },
    { theme: "カウント別の戦略", teaser: "有利カウントの使い方が問われる" },
    { theme: "投手 vs 打者の読み合い", teaser: "相手の裏をかく1球" },
    { theme: "セオリーの盲点", teaser: "定説を疑えるか？" },
    { theme: "勝負どころの1球", teaser: "ここぞの場面での選択" },
  ];

  // JSTの今日の日付をシードにしてテーマを決定
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  // 日付文字列を数値に変換してシード化（同日は全ユーザー同じ）
  const seed = today.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const theme = themes[seed % themes.length];

  return {
    title: `⚾ 今日の1球 - ${theme.theme}`,
    body: theme.teaser,
  };
}

export async function POST(request: NextRequest) {
  // ── 認証チェック ──────────────────────────────────────────────
  // Vercel Cron は Authorization ヘッダーを自動付与する
  // 手動テスト時は Bearer <PUSH_SECRET> を付ける
  const authHeader = request.headers.get("authorization");
  const secret = process.env.PUSH_SECRET;

  if (!secret) {
    console.error("[Push/Send] PUSH_SECRET が設定されていません");
    return NextResponse.json({ error: "サーバー設定エラー" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── リクエストボディのオプション ──────────────────────────────
  // カスタムメッセージを指定できる（省略時は今日のテーマを使用）
  let customPayload: { title?: string; body?: string } = {};
  try {
    const text = await request.text();
    if (text) customPayload = JSON.parse(text);
  } catch {
    // ボディなしでもOK
  }

  // ── 通知内容を決定 ──────────────────────────────────────────
  const defaultMessage = getTodayThemeMessage();
  const payload = JSON.stringify({
    title: customPayload.title || defaultMessage.title,
    body: customPayload.body || defaultMessage.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    url: "/",
  });

  // ── web-push 初期化 ─────────────────────────────────────────
  try {
    initWebPush();
  } catch (error) {
    console.error("[Push/Send] VAPID初期化エラー:", error);
    return NextResponse.json({ error: "VAPID設定エラー" }, { status: 500 });
  }

  // ── 全購読者を取得 ──────────────────────────────────────────
  const supabase = getSupabaseClient();
  const { data: subscriptions, error: fetchError } = await supabase
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .limit(1000); // 安全のため上限設定

  if (fetchError) {
    console.error("[Push/Send] Supabase fetch error:", fetchError);
    return NextResponse.json({ error: "購読者取得エラー" }, { status: 500 });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "購読者なし" });
  }

  console.log(`[Push/Send] ${subscriptions.length}件に通知送信開始`);

  // ── 通知送信（並列・エラーは個別に処理） ────────────────────
  const expiredEndpoints: string[] = [];
  let successCount = 0;
  let errorCount = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
          {
            TTL: 86400, // 通知の有効期限: 24時間
          }
        );
        successCount++;
      } catch (error: unknown) {
        // 410 Gone: 購読が無効（ブラウザでキャンセルされた等）
        if (
          error instanceof Error &&
          "statusCode" in error &&
          (error as { statusCode: number }).statusCode === 410
        ) {
          expiredEndpoints.push(sub.endpoint);
          console.log("[Push/Send] 期限切れ購読を削除予定:", sub.endpoint.slice(0, 50));
        } else {
          errorCount++;
          console.error("[Push/Send] 送信エラー:", error);
        }
      }
    })
  );

  // ── 期限切れ購読をSupabaseから一括削除 ─────────────────────
  if (expiredEndpoints.length > 0) {
    const { error: deleteError } = await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);

    if (deleteError) {
      console.error("[Push/Send] 期限切れ削除エラー:", deleteError);
    } else {
      console.log(`[Push/Send] ${expiredEndpoints.length}件の期限切れ購読を削除`);
    }
  }

  const result = {
    ok: true,
    total: subscriptions.length,
    sent: successCount,
    expired: expiredEndpoints.length,
    errors: errorCount,
  };

  console.log("[Push/Send] 完了:", result);
  return NextResponse.json(result);
}
