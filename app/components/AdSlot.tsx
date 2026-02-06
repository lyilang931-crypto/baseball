"use client";

/**
 * 広告枠コンポーネント（結果画面専用）
 * - プレイ中には絶対に表示しない
 * - 頻度制限: N回に1回だけ表示（localStorage で管理）
 * - プレミアムユーザーには非表示
 * - 高さ固定でレイアウト崩れ防止
 *
 * 【広告ネットワーク】
 * Google AdSense を想定。現時点ではプレースホルダ枠のみ設置。
 * 本番タグ設置時は layout.tsx に AdSense script を追加し、
 * このコンポーネント内の <ins> タグに data-ad-client / data-ad-slot を設定する。
 */

import { useState, useEffect } from "react";
import { isPremiumUser } from "@/lib/monetization";

const AD_DISPLAY_KEY = "baseball_quiz_ad_display";
const AD_FREQUENCY = 3; // 3回に1回だけ表示

interface AdDisplayState {
  /** 結果画面表示回数（日付でリセット） */
  count: number;
  /** 最終カウント日（YYYY-MM-DD） */
  date: string;
}

function getTodayJST(): string {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getAdDisplayState(): AdDisplayState {
  if (typeof window === "undefined") return { count: 0, date: "" };
  try {
    const s = localStorage.getItem(AD_DISPLAY_KEY);
    if (!s) return { count: 0, date: getTodayJST() };
    const parsed = JSON.parse(s) as Partial<AdDisplayState>;
    const today = getTodayJST();
    if (parsed.date !== today) return { count: 0, date: today };
    return { count: parsed.count ?? 0, date: today };
  } catch {
    return { count: 0, date: getTodayJST() };
  }
}

function incrementAdDisplay(): AdDisplayState {
  const state = getAdDisplayState();
  const next = { count: state.count + 1, date: state.date };
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(AD_DISPLAY_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }
  return next;
}

function shouldShowAdNow(): boolean {
  if (isPremiumUser()) return false;
  const state = getAdDisplayState();
  // 3回に1回表示（count が 0, 3, 6, ... のとき）
  return state.count % AD_FREQUENCY === 0;
}

interface AdSlotProps {
  /** 広告配置場所（analytics 用） */
  placement?: string;
}

export default function AdSlot({ placement = "result_banner" }: AdSlotProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    const show = shouldShowAdNow();
    setVisible(show);
    // 表示・非表示に関わらずカウントを進める
    incrementAdDisplay();
  }, []);

  if (!mounted || !visible) return null;

  return (
    <div
      className="w-full max-w-sm mx-auto my-4"
      role="complementary"
      aria-label="広告"
    >
      {/* Google AdSense バナー枠（本番タグ設置時に <ins> タグに置き換え）
        * 設置手順:
        * 1. app/layout.tsx の <head> に AdSense script を追加
        *    <Script src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXX" crossOrigin="anonymous" strategy="afterInteractive" />
        * 2. 下記 div 内を AdSense の <ins> タグに置き換え
        * 3. data-ad-client="ca-pub-XXXX" data-ad-slot="YYYYYY" を設定
        */}
      <div
        className="w-full bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center"
        style={{ minHeight: 90 }}
        data-ad-placement={placement}
      >
        <span className="text-xs text-gray-300 select-none">AD</span>
      </div>
    </div>
  );
}
