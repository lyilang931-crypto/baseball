import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.baseball.quiz',
  appName: '今日の1球',
  webDir: 'out',
  // Android実機開発用: PCのローカルIPアドレスを指定
  server: {
    url: 'https://baseball-ecru.vercel.app',
    cleartext: true, // HTTP接続を許可（Android 9以降で必要）
  },
  android: {
    // スプラッシュスクリーン表示時間（ms）
    // splashScreenDuration: 2000,
    allowMixedContent: true, // HTTP/HTTPS混在コンテンツを許可
  },
};

export default config;
