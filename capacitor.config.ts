import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.baseball.quiz',
  appName: '今日の1球',
  webDir: 'out',
  // 本番: Vercel デプロイURLを設定してWebViewで読み込む
  // server: {
  //   url: 'https://your-app.vercel.app',
  //   cleartext: false,
  // },
  android: {
    // スプラッシュスクリーン表示時間（ms）
    // splashScreenDuration: 2000,
  },
};

export default config;
