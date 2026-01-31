# 野球クイズ（今日の1球）

Next.js (App Router) + TypeScript + Tailwind CSS で作った iOS 風の野球クイズ Web アプリです。

## 機能

- **Start 画面**: タイトル・サブタイトル・「今日の1球に挑戦」ボタン
- **Question 画面**: 1セッション5問（全10問プールからランダム）、30秒タイマー、3択（角丸・枠線・白背景）
- **Result 画面**: 正解/不正解・効果音・解説・出典リンク・レート変動・「次の1球へ」
- **最終結果**: 5問中正答数・レート変動・「スタートに戻る」
- **Elo レーティング**: 初期1500・K=24、難易度で期待勝率を調整し、localStorage に保存
- **みんなの正答率**: 問題ごとの回答数・正解数をサーバで永続集計し、結果画面に「みんなの正答率: xx%（n人中m人正解）」を表示（DB 未設定時は in-memory フォールバック／「集計中」表示）
- **連続日数 Streak**: デイリー1日1回プレイで連続日数をカウント。トップ・結果画面に「連続: n日」を表示（localStorage 保存）
- **シェア用カード画像**: 結果画面で Canvas により 1080x1920 のカード画像を生成。ダウンロード or Web Share API で共有可能
- **OGP画像**: トップは固定OGP（1200x630）。結果シェア用は `/share?score=4&total=5&rating=1523` で動的OGP（匿名のみ）

## OGP画像（X/LINEで拡散されやすいカード）

| 種別 | URL | 内容 |
|------|-----|------|
| 固定OGP | トップ（/） | 今日の1球・野球IQクイズ・「あなたならどうする？」（1200x630） |
| 動的OGP | `/share?score=4&total=5&rating=1523` | 正解数/問題数・正答率・レートを画像に表示 |

**ローカルでOGPを確認する手順**

1. `npm run dev` で起動
2. 固定OGP: ブラウザで `http://localhost:3000/opengraph-image` を開く（画像が表示される）
3. 動的OGP: `http://localhost:3000/share/og?score=4&total=5&rating=1523` を開く（画像が表示される）
4. メタタグ確認: 開発者ツールで `<meta property="og:image" ...>` を確認するか、[Open Graph Debugger](https://www.opengraph.xyz/) 等で本番URLを入力（ローカルURLは外部ツールでは取得できない場合あり）

**変更・追加ファイル（OGP / 統計問題）**

| 種別 | ファイル | 内容 |
|------|----------|------|
| 追加 | `app/opengraph-image.tsx` | 固定OGP（1200x630・白背景・角丸カード風） |
| 追加 | `app/share/page.tsx` | 結果シェア用ページ（クエリで score/total/rating を受け取り、動的 metadata） |
| 追加 | `app/share/og/route.tsx` | 動的OGP画像生成（GET /share/og?score=...&total=...&rating=...） |
| 変更 | `app/layout.tsx` | metadata に title/description/openGraph/twitter を整備 |
| 変更 | `src/data/questions.ts` | 統計ベース問題3問の文言を指定どおりに更新（id 11, 12, 13） |

## 環境変数（正答率集計用）

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | Postgres 接続文字列（Vercel Postgres / Neon 等）。未設定時は **in-memory フォールバック**（再起動でリセット） |

**設定方法**

- **ローカル**: プロジェクト直下に `.env.local` を作成し、`DATABASE_URL=postgres://...` を記載
- **Vercel**: ダッシュボードの Project → Settings → Environment Variables で `DATABASE_URL` を追加（Vercel Postgres または Neon の接続文字列）

**ローカルで DB なしで動かす場合**

- `DATABASE_URL` を設定しなければ、正答率集計は **in-memory フォールバック** になります（再起動でリセット）。結果画面では「集計中」またはデータ取得後に「みんなの正答率」が表示されます。その他の機能（Streak・シェア画像・デイリー）は DB なしで動作します。

## 環境変数（Supabase・回答ログ用）

**※ Service Role Key は使用しません。anon key のみで RLS により制御します。**

### .env.local 例

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Vercel Environment Variables

| 変数名 | 説明 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクトの URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon（公開）キー |

- **Service Role Key は使用しない** ことを明記します。anon key と RLS で insert/select のみ許可しています。

---

## Supabase：answer_logs / question_stats（SQL）

Supabase の **SQL Editor** で以下を **そのまま実行** してください。

### テーブル・トリガー・RLS

```sql
-- 生ログ
create table if not exists answer_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  user_id text not null,
  question_id text not null,
  selected_option text not null,
  is_correct boolean not null,
  source_url text null,
  rating_before int null,
  rating_after int null,
  meta jsonb null
);

-- 集計用（問題ごと）
create table if not exists question_stats (
  question_id text primary key,
  answered_count int not null default 0,
  correct_count int not null default 0,
  updated_at timestamptz default now() not null
);

-- answer_logs insert 時に question_stats を upsert
create or replace function sync_question_stats_on_answer_log()
returns trigger as $$
begin
  insert into question_stats (question_id, answered_count, correct_count, updated_at)
  values (new.question_id, 1, case when new.is_correct then 1 else 0 end, now())
  on conflict (question_id) do update set
    answered_count = question_stats.answered_count + 1,
    correct_count = question_stats.correct_count + case when new.is_correct then 1 else 0 end,
    updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_sync_question_stats_on_answer_log on answer_logs;
create trigger tr_sync_question_stats_on_answer_log
  after insert on answer_logs
  for each row execute function sync_question_stats_on_answer_log();

-- RLS 有効化
alter table answer_logs enable row level security;
alter table question_stats enable row level security;

-- answer_logs: anon で insert のみ許可
create policy "anon_insert_answer_logs" on answer_logs
  for insert to anon with check (true);

-- question_stats: anon で select のみ許可
create policy "anon_select_question_stats" on question_stats
  for select to anon using (true);
```

（既存の `answers` テーブルがある場合は、上記と別テーブルとして `answer_logs` を追加してください。）

### 回答確定時の Supabase 保存（フック箇所）

| 箇所 | 内容 |
|------|------|
| **app/page.tsx** | `handleSelect(choiceId)` … ユーザーが選択肢を押した直後に `getOrCreateUserId()` で userId を取得し、`POST /api/answers` を 1 回だけ送信（`answerLogSentForIndex` で二重送信防止）。失敗時は `console.error` のみで画面遷移は継続。 |
| **app/page.tsx** | タイムアウト用 `useEffect`（`secondsLeft === 0`）… 時間切れ時も同様に `POST /api/answers` を 1 回だけ送信（`selectedOption: ""`）。 |
| **app/api/answers/route.ts** | `POST` … body を検証し、Supabase の `answer_logs` に 1 行 insert。成功時 `{ ok: true }`、失敗時 500。 |
| **src/lib/userId.ts** | `getOrCreateUserId()` … localStorage の `baseball_user_id` が無ければ `crypto.randomUUID()` で生成して保存し、返す。 |

**変更・追加ファイル一覧（回答確定時の Supabase 保存）**

| 種別 | ファイル | 内容 |
|------|----------|------|
| 追加 | `src/lib/userId.ts` | `getOrCreateUserId()`（localStorage + crypto.randomUUID） |
| 追加 | `app/api/answers/route.ts` | `POST /api/answers`（answer_logs に insert） |
| 変更 | `app/page.tsx` | `handleSelect` とタイムアウト `useEffect` に `/api/answers` 送信・二重送信防止を追加 |
| 変更 | `README.md` | .env.local 例・Vercel 環境変数・Supabase SQL（answer_logs / question_stats / trigger / RLS）・フック箇所を追記 |

## 起動手順

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてください。

## ビルド・本番起動

```bash
npm run build
npm start
```

## 構成

```
野球クイズ/
├── app/
│   ├── components/     # Start / Question / Result / FinalResult 画面
│   ├── hooks/          # useResultSound（正解/不正解効果音）
│   ├── layout.tsx
│   ├── page.tsx        # 画面状態・セッション・Elo 更新の集約
│   └── globals.css
├── public/
│   └── sfx/            # correct.mp3 / wrong.mp3 を置くと効果音再生（任意）
├── src/
│   ├── data/
│   │   └── questions.ts  # 型（Question, Choice）と10問データ・getSessionQuestions()
│   └── lib/
│       ├── elo.ts       # Elo 計算（初期1500, K=24, 難易度で期待勝率）
│       └── storage.ts   # localStorage（baseball_quiz_rating, baseball_quiz_history）
├── package.json
├── tailwind.config.ts
└── tsconfig.json       # @/data/* → src/data/*, @/lib/* → src/lib/*
```

### 主要ファイルの役割

| ファイル | 役割 |
|----------|------|
| `app/page.tsx` | 画面遷移（Start → Question → Result → Final）、セッション5問、タイマー、Elo 更新・保存・履歴追加 |
| `src/data/questions.ts` | `Question` / `Choice` 型、10問のプール、`getSessionQuestions()` でランダム5問取得 |
| `src/lib/elo.ts` | 正解/不正解時のレート計算（難易度1〜5で期待勝率を調整） |
| `src/lib/storage.ts` | レート・履歴の読み書き（キー: `baseball_quiz_rating`, `baseball_quiz_history`） |
| `app/hooks/useResultSound.ts` | Result 表示時に `/sfx/correct.mp3` または `wrong.mp3` を1回再生（ファイルが無くても落ちない） |
| `app/components/ResultView.tsx` | 正解/不正解・解説・出典リンク・レート表示 |

### 効果音（任意）

`public/sfx/` に次のファイルを置くと、Result 画面で再生されます。無くても動作します。

- `correct.mp3` … 正解時
- `wrong.mp3` … 不正解時

## Vercel へのデプロイ

1. リポジトリを GitHub に push
2. [Vercel](https://vercel.com) で「Import Project」→ リポジトリを選択
3. フレームワークは Next.js のまま「Deploy」で完了

`package.json` と `next.config.js` がそのまま使える構成です。

### 正答率集計まわりの変更・追加ファイル

| 種別 | ファイル | 内容 |
|------|----------|------|
| 追加 | `src/lib/stats-db.ts` | 集計の永続化（Postgres / in-memory フォールバック）、`recordAnswer` / `getStats` |
| 追加 | `app/api/stats/answer/route.ts` | `POST /api/stats/answer`（body: `questionId`, `isCorrect`） |
| 追加 | `app/api/stats/question/route.ts` | `GET /api/stats/question?questionId=...` |
| 変更 | `app/page.tsx` | 解答時に POST、Result に `questionId` を渡す |
| 変更 | `app/components/ResultView.tsx` | `questionId` を受け取り、正答率を取得・表示 |
| 変更 | `package.json` | `pg` / `@types/pg` 追加 |

**DB テーブル（Postgres 使用時）**

- テーブル名: `stats_question_aggregate`
- カラム: `question_id` (TEXT PK), `total_attempts` (INTEGER), `total_correct` (INTEGER), `updated_at` (TIMESTAMP)
- 初回 API 呼び出し時に `CREATE TABLE IF NOT EXISTS` で自動作成されます。

### 今回の追加・変更ファイル（A/B/C）

| 種別 | ファイル | 内容 |
|------|----------|------|
| 変更 | `app/components/ResultView.tsx` | 「みんなの正答率」文言・「集計中」フォールバック |
| 追加 | `src/utils/streak.ts` | 連続日数 Streak（getStreakCount / updateStreakAndReturn） |
| 変更 | `app/page.tsx` | セッション完了時に updateStreakAndReturn 呼び出し |
| 変更 | `app/components/StartView.tsx` | 連続日数表示 |
| 変更 | `app/components/FinalResultView.tsx` | 連続日数表示・ShareCard 組み込み |
| 追加 | `src/utils/generateShareImage.ts` | Canvas で 1080x1920 シェア画像生成 |
| 追加 | `app/components/ShareCard.tsx` | シェア画像作成・ダウンロード・Web Share API |
