/**
 * POST /api/push/subscribe  - プッシュ購読情報をSupabaseに保存
 * DELETE /api/push/subscribe - プッシュ購読情報をSupabaseから削除
 *
 * Supabaseテーブル: push_subscriptions
 * （SQLはREADMEまたは PUSH_NOTIFICATION_SETUP.md を参照）
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// サーバー側でのみ使用するSupabaseクライアント
// anon key + RLS で制御（Service Role Keyは使用しない）
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Supabase環境変数が設定されていません");
  }
  return createClient(url, key);
}

/** POST: 購読情報を保存（upsert） */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, endpoint, p256dh, auth } = body;

    if (!userId || !endpoint || !p256dh || !auth) {
      return NextResponse.json(
        { error: "userId, endpoint, p256dh, auth が必要です" },
        { status: 400 }
      );
    }

    // endpointの長さ制限チェック
    // Chrome(FCM)のエンドポイントはトークン部分だけで500文字超えることがあるため
    // 実用上の上限として2048文字を設定する
    if (endpoint.length > 2048) {
      return NextResponse.json(
        { error: "endpointが長すぎます" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // upsert: 同じendpointが既存なら更新、なければ挿入
    const { error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "endpoint",
      }
    );

    if (error) {
      console.error("[Push] Supabase upsert error:", error);
      return NextResponse.json(
        { error: "購読情報の保存に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Push] POST /api/push/subscribe error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}

/** DELETE: 購読情報を削除 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, userId } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: "endpoint が必要です" },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      // user_id が一致する場合のみ削除（他のユーザーの購読を削除できないようにする）
      .eq("user_id", userId || "");

    if (error) {
      console.error("[Push] Supabase delete error:", error);
      return NextResponse.json(
        { error: "購読情報の削除に失敗しました" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Push] DELETE /api/push/subscribe error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
