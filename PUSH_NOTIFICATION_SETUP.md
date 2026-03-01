# プッシュ通知セットアップ手順

## 概要
Web Push API を使って毎日0時(JST)に全購読者へ通知を送信します。
Capacitor の Android アプリ公開前でも、ブラウザだけで動作します。

---

## Step 1: `web-push` パッケージをインストール

```bash
npm install web-push
npm install --save-dev @types/web-push
```

---

## Step 2: VAPID キーを生成

```bash
npx web-push generate-vapid-keys
```

出力例:
```
Public Key:
BxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxA=

Private Key:
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 3: 環境変数を設定

### .env.local（ローカル開発用）

```env
# 既存
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 追加: VAPID キー（Step2で生成したもの）
VAPID_PUBLIC_KEY=BxxxxxxxxxxxxxxxxxxxxA=
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
VAPID_SUBJECT=mailto:your-email@gmail.com

# 追加: Cron認証シークレット（任意の長い文字列）
PUSH_SECRET=your-random-secret-string-here

# 追加: クライアント側で使うVAPID公開鍵（VAPID_PUBLIC_KEYと同じ値）
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BxxxxxxxxxxxxxxxxxxxxA=
```

### Vercel ダッシュボード（本番用）

Vercel → Project → Settings → Environment Variables に同じキーを追加してください。

---

## Step 4: Supabase テーブルを作成

Supabase の **SQL Editor** で以下を実行：

```sql
-- プッシュ購読情報テーブル
create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- RLS 有効化
alter table push_subscriptions enable row level security;

-- anon で insert のみ許可（購読登録）
create policy "anon_insert_push_subscriptions" on push_subscriptions
  for insert to anon with check (true);

-- anon で update のみ許可（endpoint重複時のupsert）
create policy "anon_update_push_subscriptions" on push_subscriptions
  for update to anon using (true);

-- anon で delete のみ許可（購読解除）
create policy "anon_delete_push_subscriptions" on push_subscriptions
  for delete to anon using (true);

-- サーバー側（API route）から select するためのポリシー
-- NOTE: anon key を使うので anon ロールに select を許可
create policy "anon_select_push_subscriptions" on push_subscriptions
  for select to anon using (true);
```

---

## Step 5: アイコン画像を配置（任意）

通知に表示するアイコンを `public/icons/` に配置してください。

```
public/icons/
├── icon-192x192.png   ← 通知アイコン（192x192px）
└── badge-72x72.png    ← Androidバッジアイコン（72x72px）
```

ない場合は `public/sw.js` の `icon` / `badge` の行を削除してもOKです。

---

## Step 6: デプロイして確認

```bash
npm run build
# Vercel へ push
```

### 動作確認
1. アプリをブラウザで開く
2. 1セッションプレイし、最終結果画面へ進む
3. 「通知をオンにする」ボタンをタップ
4. ブラウザの通知許可ダイアログで「許可」
5. Supabase の `push_subscriptions` テーブルにレコードが追加されることを確認

### 手動で通知をテスト送信

```bash
curl -X POST https://baseball-ecru.vercel.app/api/push/send \
  -H "Authorization: Bearer your-random-secret-string-here" \
  -H "Content-Type: application/json" \
  -d '{"title": "テスト通知", "body": "動作確認です"}'
```

---

## Vercel Cron の動作タイミング

`vercel.json` の設定:
```json
{ "crons": [{ "path": "/api/push/send", "schedule": "0 15 * * *" }] }
```

- `0 15 * * *` = 毎日 15:00 UTC = 毎日 **0:00 JST**
- Vercel の Hobby プランでも1日1回のCronは無料で使えます
- Vercel ダッシュボードの「Cron Jobs」タブで実行履歴を確認できます

---

## ファイル構成

```
public/
└── sw.js                            ← Service Worker（プッシュ受信）

src/lib/
└── pushNotification.ts              ← クライアント側ライブラリ

app/
├── components/
│   ├── ClientInitializer.tsx        ← SW登録（変更）
│   ├── FinalResultView.tsx          ← 通知ボタン追加（変更）
│   └── NotificationButton.tsx       ← 通知オプトインUI
└── api/push/
    ├── subscribe/route.ts           ← 購読情報の保存・削除API
    └── send/route.ts                ← 通知送信API（Cronから呼ばれる）

vercel.json                          ← Cron設定
```
