# Google Play 公開・収益化 TODOリスト

## 現在の状態（2026-02-05 時点）

### 完了済み
- [x] **Capacitor 導入**
  - `@capacitor/core`, `@capacitor/cli`, `@capacitor/android` インストール済み
  - `capacitor.config.ts` 作成済み（appId: `com.baseball.quiz`）
  - `android/` プロジェクト生成済み
- [x] **収益化の土台**
  - `src/lib/monetization.ts`: 広告・課金フラグ・抽象API完備
  - `isPremiumUser()`, `shouldShowAd()`, `adsRewardedAvailable()`, `grantExtraAttempt()`, `shouldShowInterstitial()`
  - 広告ボーナスセッション管理（JST日付で一貫性あり）
- [x] **デイリー機能**
  - 1日3回制限 + 広告ボーナス追加枠
  - 連続ログイン streak
  - 連続正解バッジ

---

## 技術タスク

### Step 1: Capacitor ビルド手順

このアプリはAPIルート（`/api/*`）を使用するため、完全な静的エクスポートは不可。
2つのアプローチがある：

#### A) Server URL 方式（推奨・最短）
Vercelにデプロイ済みのURLをCapacitorのWebViewで読み込む。

```bash
# 1. capacitor.config.ts の server.url を有効化
#    url: 'https://your-app.vercel.app'

# 2. Android Studio でビルド
npx cap sync android
npx cap open android
# Android Studio → Build → Generate Signed Bundle / APK
```

**メリット**: Web版と同一コード、更新が即座に反映
**デメリット**: オフライン不可、ネットワーク必須

#### B) ハイブリッド方式（将来）
問題データをローカルバンドル + API呼び出しはネットワーク経由。
Service Worker導入が前提。

### Step 2: Android Studio セットアップ

```bash
# 必要なもの
# - Android Studio（最新版）
# - JDK 17+
# - Android SDK 33+

# プロジェクトを開く
npx cap open android

# ビルド前にwebアセットを同期
npx cap sync android
```

### Step 3: AdMob 導入

```bash
# Capacitor用AdMobプラグイン
npm install @capacitor-community/admob

# capacitor.config.ts に追加:
# plugins: {
#   AdMob: {
#     androidAppId: 'ca-app-pub-XXXX~YYYY',  // AdMobコンソールで取得
#     isTesting: true,  // 開発中はtrue
#   }
# }
```

**テスト広告ID（開発用）**:
- バナー: `ca-app-pub-3940256099942544/6300978111`
- インタースティシャル: `ca-app-pub-3940256099942544/1033173712`
- リワード: `ca-app-pub-3940256099942544/5224354917`

実装箇所（既存コードとの接続点）:
- `src/lib/monetization.ts` の `adsRewardedAvailable()` → AdMob SDK の `isLoaded()` をラップ
- `shouldShowAd()` → 実際の表示判定
- `grantExtraAttempt()` → リワード広告完了コールバックから呼ぶ
- `shouldShowInterstitial(completedSessionCount)` → セッション完了時の判定

### Step 4: Google Play Billing

```bash
# サブスクリプション用
npm install @nicekiwi/capacitor-billing
# または Play Billing Library を直接使用
```

`src/lib/monetization.ts` の接続点:
- `isPremiumUser()` → Billing ライブラリの購読状態チェック
- `hasFeature(feature)` → プラン別機能判定
- `PREMIUM_PLANS` → Play Console の定期購入に対応

---

## Google Play 申請タスク

### 必須準備
- [ ] **Google Play Console アカウント作成**
  - 初回登録料: $25（一度のみ）
  - 本人確認書類

- [ ] **アプリ署名**
  ```bash
  # keystore 生成
  keytool -genkey -v -keystore baseball-quiz.keystore \
    -alias baseball-quiz -keyalg RSA -keysize 2048 -validity 10000

  # android/app/build.gradle の signingConfigs に設定
  ```
  - Google Play App Signing 有効化

- [ ] **プライバシーポリシー作成**
  - ユーザーデータ収集・利用の明記（匿名ID、プレイ履歴）
  - 広告ID使用の説明（AdMob導入時）
  - Supabaseのデータ保存について記載
  - ホスティング先URL準備（Vercel Pages等）

- [ ] **ストア掲載情報**
  - アプリ名: `今日の1球 - 野球配球クイズ`
  - 短い説明（80文字以内）:
    `プロ野球の実データを使った配球判断クイズ。1日3セッション、あなたの野球脳を鍛えよう。`
  - 詳しい説明（4000文字以内）
  - スクリーンショット（2枚以上、1080x1920推奨）
  - フィーチャーグラフィック（1024x500）
  - アイコン（512x512）

### コンテンツレーティング
- [ ] **IARC レーティング質問票**
  - 暴力表現: なし
  - 性的表現: なし
  - 言葉遣い: なし
  - 予想レーティング: 全年齢

### データ安全性（Data Safety）
- [ ] **データ収集の申告**
  - 匿名ID（デバイス識別用）: ローカル生成、サーバー送信あり
  - プレイ履歴（回答ログ）: Supabase保存
  - レーティング（ELO値）: ローカル + サーバー
  - 広告ID: AdMob導入時に申告（Google広告ポリシー準拠）
  - 暗号化: HTTPS通信

### 広告・課金申告
- [ ] **広告を含む**をチェック
- [ ] **アプリ内購入**を設定（サブスクリプション3プラン）
- [ ] 広告SDKのデータ収集を Data Safety で申告

---

## 素材チェックリスト

| 素材 | サイズ | 状態 | 備考 |
|------|--------|------|------|
| アプリアイコン | 512x512 PNG | [ ] 未作成 | 野球ボール + クエスチョンマーク |
| フィーチャーグラフィック | 1024x500 PNG | [ ] 未作成 | ストア掲載ヘッダー |
| スクリーンショット 1 | 1080x1920 | [ ] 未作成 | クイズ画面 |
| スクリーンショット 2 | 1080x1920 | [ ] 未作成 | 結果画面 |
| スクリーンショット 3 | 1080x1920 | [ ] 未作成 | スタート画面（任意） |
| プライバシーポリシー | URL | [ ] 未作成 | Vercel Pages推奨 |

---

## 収益モデル（控えめ予測）

### 前提条件
- カテゴリ: スポーツ/クイズ（ニッチ）
- ターゲット: 野球ファン（日本中心）
- 競合: 野球クイズアプリは少ない

### DL数予測

| 期間 | DL数/月 | 累計 | 備考 |
|------|---------|------|------|
| 1-3ヶ月 | 100-300 | 300-900 | 初期露出、口コミなし |
| 4-6ヶ月 | 300-800 | 1,500-3,500 | ASO最適化後 |
| 7-12ヶ月 | 500-1,500 | 5,000-15,000 | シーズン連動、口コミ |
| 2年目以降 | 1,000-3,000 | 15,000-50,000 | 安定期 |

### 総収益予測

| 時期 | 月間収益 | 年間収益 |
|------|---------|---------|
| 1年目 | ¥10,000-50,000 | ¥120,000-600,000 |
| 2年目 | ¥50,000-150,000 | ¥600,000-1,800,000 |
| 3年目以降 | ¥100,000-300,000 | ¥1,200,000-3,600,000 |

---

## 優先順位

1. **最短公開**: Server URL方式でCapacitorビルド → Play Store申請
2. **収益化**: AdMob導入（テストID→本番ID切替）
3. **改善**: プッシュ通知、オフライン対応
4. **成長**: 課金機能、A/Bテスト
