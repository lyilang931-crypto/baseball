/**
 * シェア用「成果カード」画像を Canvas で生成（画像保存・作成して共有専用）
 * 1080x1080 正方形・カード型・情報密度高・数値強調
 * X/LINE の OGP は別なので触らない
 */

export interface ShareImageParams {
  correctCount: number;
  totalQuestions: number;
  accuracy: number;
  rating: number;
  ratingDelta?: number;
  streak?: number;
  levelLabel?: string;
  url?: string;
}

const SIZE = 1080;
const PADDING = 56;
const CARD_PADDING_V = 44;
const CARD_PADDING_H = 48;
const BG = "#f7f9fb";
const CARD_BG = "#ffffff";
const TEXT_MAIN = "#111827";
const TEXT_SUB = "#4b5563";
const TEXT_MUTED = "#6b7280";
const BADGE_BG = "#2563eb"; // レベルバッジ（青）
const RATING_UP = "#059669"; // 成長＋緑
const RATING_DOWN = "#dc2626"; // マイナス赤

export function generateShareImage(params: ShareImageParams): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Canvas not supported"));
      return;
    }

    const {
      correctCount,
      totalQuestions,
      accuracy,
      rating,
      ratingDelta = 0,
      levelLabel = "",
      url = "",
    } = params;

    // 背景
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, SIZE, SIZE);

    const centerX = SIZE / 2;

    // レート行テキスト（成長を明示）
    const ratingDeltaStr =
      ratingDelta > 0 ? `（+${ratingDelta}）` : ratingDelta < 0 ? `（${ratingDelta}）` : "";

    // カード内の高さを先に計算（タイトル・サブは小さめ、成績ブロック最優先）
    const titleH = 32;
    const subH = 28;
    const lineHeights = [72, 52, 52, 52]; // 正解・正答率・レート・レベル
    const cardInnerH = lineHeights[0] + lineHeights[1] + lineHeights[2] + (levelLabel ? lineHeights[3] : 0);
    const cardH = cardInnerH + CARD_PADDING_V * 2;
    const cardW = SIZE - PADDING * 2;
    const cardX = PADDING;
    const gapTitleSub = 24;
    const gapSubCard = 36;
    const gapCardFooter = 40;
    const footerH = url ? 32 : 0;
    const totalContentH =
      titleH + gapTitleSub + subH + gapSubCard + cardH + gapCardFooter + footerH;
    // カードを縦方向中央よりやや上に（上の余白を減らす）
    const offsetUp = 48;
    let y = (SIZE - totalContentH) / 2 - offsetUp;

    // タイトル（小さめ・成績ブロックが最優先で目に入る構成）
    ctx.font = "26px sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("⚾ 今日の1球", centerX, y);
    y += titleH + gapTitleSub;

    ctx.font = "22px sans-serif";
    ctx.fillStyle = TEXT_SUB;
    ctx.fillText("あなたなら、どうする？", centerX, y);
    y += subH + gapSubCard;

    const cardY = y;

    // 角丸カード
    const radius = 24;
    ctx.fillStyle = CARD_BG;
    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardW - radius, cardY);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
    ctx.lineTo(cardX + cardW, cardY + cardH - radius);
    ctx.quadraticCurveTo(
      cardX + cardW,
      cardY + cardH,
      cardX + cardW - radius,
      cardY + cardH
    );
    ctx.lineTo(cardX + radius, cardY + cardH);
    ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
    ctx.lineTo(cardX, cardY + radius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
    ctx.closePath();
    ctx.fill();

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let ly = cardY + CARD_PADDING_V;

    // 1行目: 4 / 5 正解
    ctx.font = "bold 56px sans-serif";
    ctx.fillStyle = TEXT_MAIN;
    ctx.fillText(
      `${correctCount} / ${totalQuestions} 正解`,
      centerX,
      ly
    );
    ly += lineHeights[0];

    // 2行目: 正答率 80%
    ctx.font = "bold 44px sans-serif";
    ctx.fillStyle = TEXT_MAIN;
    const accuracyRounded = Math.round(accuracy);
    ctx.fillText(`正答率 ${accuracyRounded}%`, centerX, ly);
    ly += lineHeights[1];

    // 3行目: 📈 レート 1585（+10） 成長を明示・（+10）を色で強調
    ctx.font = "bold 44px sans-serif";
    const rateLabel = ratingDeltaStr
      ? `📈 レート ${rating}${ratingDeltaStr}`
      : `レート ${rating}`;
    const rateMain = ratingDeltaStr
      ? `📈 レート ${rating}`
      : rateLabel;
    const rateDeltaPart = ratingDeltaStr;
    ctx.fillStyle = TEXT_MAIN;
    if (rateDeltaPart) {
      const wMain = ctx.measureText(rateMain).width;
      const wDelta = ctx.measureText(rateDeltaPart).width;
      const totalW = wMain + wDelta;
      const startX = centerX - totalW / 2;
      ctx.fillText(rateMain, startX, ly);
      ctx.fillStyle = ratingDelta > 0 ? RATING_UP : ratingDelta < 0 ? RATING_DOWN : TEXT_MAIN;
      ctx.fillText(rateDeltaPart, startX + wMain, ly);
    } else {
      ctx.fillText(rateLabel, centerX, ly);
    }
    ly += lineHeights[2];

    // 4行目: 経験者クラス → バッジ（色付きラベル）で強調
    if (levelLabel) {
      const badgeFont = "bold 36px sans-serif";
      ctx.font = badgeFont;
      const badgePaddingH = 32;
      const textW = ctx.measureText(levelLabel).width;
      const badgeW = textW + badgePaddingH * 2;
      const badgeH = 48;
      const badgeX = centerX - badgeW / 2;
      const badgeY = ly;
      const badgeR = 24;
      ctx.fillStyle = BADGE_BG;
      ctx.beginPath();
      ctx.moveTo(badgeX + badgeR, badgeY);
      ctx.lineTo(badgeX + badgeW - badgeR, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY, badgeX + badgeW, badgeY + badgeR);
      ctx.lineTo(badgeX + badgeW, badgeY + badgeH - badgeR);
      ctx.quadraticCurveTo(badgeX + badgeW, badgeY + badgeH, badgeX + badgeW - badgeR, badgeY + badgeH);
      ctx.lineTo(badgeX + badgeR, badgeY + badgeH);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - badgeR);
      ctx.lineTo(badgeX, badgeY + badgeR);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + badgeR, badgeY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = badgeFont;
      ctx.fillText(levelLabel, centerX, badgeY + (badgeH - 40) / 2 + 2);
      ly += lineHeights[3];
    }

    y = cardY + cardH + gapCardFooter;

    // フッター（URL 小さく）
    if (url) {
      ctx.font = "22px sans-serif";
      ctx.fillStyle = TEXT_MUTED;
      ctx.fillText(url, centerX, y);
    }

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      "image/png",
      0.92
    );
  });
}
