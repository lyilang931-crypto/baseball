# 野球クイズ（今日の1球）

Next.js (App Router) + TypeScript + Tailwind CSS で作った iOS 風の野球クイズ Web アプリです。

## 機能

- **Start 画面**: タイトル・サブタイトル・「今日の1球に挑戦」ボタン
- **Question 画面**: 1セッション5問（全10問プールからランダム）、30秒タイマー、3択（角丸・枠線・白背景）
- **Result 画面**: 正解/不正解・効果音・解説・出典リンク・レート変動・「次の1球へ」
- **最終結果**: 5問中正答数・レート変動・「スタートに戻る」
- **Elo レーティング**: 初期1500・K=24、難易度で期待勝率を調整し、localStorage に保存

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
