# 野球クイズアプリ 改善レポート (2026-02-05)

## Phase 1: UI/UXをmikan風に改修（1画面1思考）

### QuestionView.tsx
- **タイマー**: 数字表示（`{secondsLeft}秒`）を廃止 → プログレスバーのみ（青→橙→赤で残量表現）
- **進捗表示**: `{n}/{total}` → `{n} / {total}` 形式に統一
- **連続正解バッジ**: `{n}問連続正解中！`（緑テキスト）を画面上部に追加
- **みんなの正解率**: 2行詳細表示 → `正解率 XX%` の1行に簡略化（回答数0件は非表示）
- **カウント説明**: `<details>` 折りたたみUIを完全削除（情報過多の排除）

### app/page.tsx
- `consecutiveCorrect` state を追加
- 正解時 +1 / 不正解・タイムアウト時 0 にリセット
- QuestionView に prop として渡す

---

## Phase 2: 問題品質バリデーション

### src/utils/questionValidation.ts（新規）
- `checkSituationLength()`: 問題文60字超で警告
- `checkDuplicatePhrases()`: 同語重複を検出
- `checkChoiceTone()`: 選択肢の長さばらつき・文末不統一を検出
- `shortenQuestionText()`: 冗長表現の自動短縮ユーティリティ
- `validateAllQuestions()`: 全問一括品質チェック

### src/data/questions.ts
- `runDevValidation()` を追加: 既存検証 + 品質チェックを統合
- app/page.tsx の初回マウントで自動実行（dev only）

---

## Phase 3: 毎日ログイン施策

### 既存機能の確認・改善
- **streak（連続ログイン）**: 既に実装済み（streak.ts）、StartView/FinalResultViewで表示
- **連続正解バッジ**: Phase 1で QuestionView に追加

### ボーナス枠とdailyの接続
- `monetization.ts`: `getTodayBonusSessions()` を追加、JST日付でdaily.tsと一貫性確保
- `getRemainingPlays()`: JST日付（`Intl.DateTimeFormat`）に修正（`toISOString`のUTC問題を解消）
- `StartView.tsx`: `effectiveRemaining`（base + bonus）で制限判定するよう修正
  - ボーナス枠がある場合、`今日 4/4 回目` のように表示
  - base 3回 + 広告ボーナス分が正しく加算される

---

## Phase 4: 収益化の土台

### src/lib/monetization.ts に抽象API追加
- `adsRewardedAvailable()`: リワード広告の準備状態（SDK導入前は dev=true / prod=false）
- `grantExtraAttempt()`: `addAdBonusSession()` のセマンティックエイリアス
- `shouldShowInterstitial(completedSessionCount)`: インタースティシャル広告のfrequency判定

### src/lib/index.ts
- 新規エクスポート: `getTodayBonusSessions`, `adsRewardedAvailable`, `grantExtraAttempt`, `shouldShowInterstitial`

---

## Phase 5: Capacitor導入（Android化の第一歩）

### インストール済みパッケージ
- `@capacitor/core`, `@capacitor/cli`, `@capacitor/android`

### 生成されたファイル
- `capacitor.config.ts`: appId=`com.baseball.quiz`, appName=`今日の1球`, webDir=`out`
- `android/`: Androidプロジェクト一式（Capacitor自動生成）

### 注意事項
- このアプリはAPIルート（`/api/*`）を使用するため、静的エクスポートではなく **Server URL方式**（Vercel URL を WebView で読み込み）を推奨
- 詳細な手順は `GOOGLE_PLAY_TODO.md` に記載

---

## Phase 6: 品質保証

- **TypeScript**: `npx tsc --noEmit` → エラー0件
- **ビルド**: `npm run build` → Compiled successfully（OG画像エラーはディレクトリ名の既存問題、Vercel上は正常）
- **既存ロジック**: クイズ選出/採点/保存/統計/レート変更なし

---

## 修正ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `app/components/QuestionView.tsx` | mikan風UI改修（タイマー・進捗・バッジ・情報削減） |
| `app/components/StartView.tsx` | ボーナス枠考慮の残り回数表示 |
| `app/page.tsx` | consecutiveCorrect追加、dev検証呼び出し |
| `src/data/questions.ts` | runDevValidation() 追加 |
| `src/lib/monetization.ts` | 抽象API追加、JST日付修正 |
| `src/lib/index.ts` | 新規エクスポート追加 |

## 新規ファイル一覧

| ファイル | 内容 |
|---------|------|
| `src/utils/questionValidation.ts` | 問題品質バリデーション |
| `capacitor.config.ts` | Capacitor設定 |
| `android/` | Androidプロジェクト（自動生成） |
| `CHANGELOG_20260205.md` | 本ファイル |

---

## テスト手順（スマホで10-20問連続プレイ確認用）

### 1. ローカル起動
```bash
npm run dev
# ブラウザで http://localhost:3000 を開く
# スマホ実機: 同じWiFi上で http://<PCのIP>:3000
```

### 2. 確認項目

#### スタート画面
- [ ] 連続ログイン日数が表示される（streak > 0 の場合）
- [ ] 「今日 1/3 回目 · 残り 3 回」の表示が正しい
- [ ] 「今日の1球に挑戦」ボタンが動作する

#### クイズ画面（QuestionView）
- [ ] プログレスバーが表示され、秒数の数字は表示されない
- [ ] プログレスバーが青→橙→赤に変化する（30秒→15秒→7秒）
- [ ] 進捗が「1 / 5」形式で表示される
- [ ] 正解すると「○問連続正解中！」バッジが出る
- [ ] 不正解で連続正解カウントがリセットされる
- [ ] 「カウントの説明を表示」が存在しない（削除済み）
- [ ] みんなの正解率が「正解率 XX%」の1行で表示される（データあり時のみ）

#### 結果画面（ResultView）
- [ ] 正解/不正解の表示が正しい
- [ ] 解説・出典が回答後画面にのみ表示される
- [ ] みんなの正答率が詳細表示される（10件以上回答時）
- [ ] 「次の1球へ」ボタンで次の問題に遷移

#### 最終結果画面（FinalResultView）
- [ ] 正答率・レート変動が正しく表示
- [ ] X/LINEシェアボタンが動作
- [ ] 連続ログイン日数が表示される

#### 制限到達時
- [ ] 3回プレイ後「今日の挑戦は完了しました」が表示
- [ ] 「広告を見て追加プレイ」ボタンが表示される
- [ ] 「今日の結果を見る」が動作する

### 3. 開発者コンソール確認
- [ ] `[品質チェック]` の警告が出た場合、問題文の改善を検討
- [ ] `[validateQuestionIds]` がエラーなしで通過
