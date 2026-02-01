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
      levelLabel = "",
      url = "",
    } = params;

    // 背景
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, SIZE, SIZE);

    let y = PADDING;

    const centerX = SIZE / 2;

    // タイトル（小さめ）
    ctx.font = "28px sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText("⚾ 今日の1球", centerX, y);
    y += 36;

    // サブ
    ctx.font = "24px sans-serif";
    ctx.fillStyle = TEXT_SUB;
    ctx.fillText("あなたなら、どうする？", centerX, y);
    y += 52;

    // メインブロック（カード・最大4行・数値強調）
    const accuracyRounded = Math.round(accuracy);
    const line1 = `${correctCount} / ${totalQuestions} 正解`;
    const line2 = `正答率 ${accuracyRounded}%`;
    const line3 = `レート ${rating}`;
    const line4 = levelLabel || "";

    const mainLines = [line1, line2, line3].filter(Boolean);
    if (line4) mainLines.push(line4);

    const lineHeights = [72, 52, 52, 44]; // 1行目だけ大きく
    const fonts = [
      "bold 56px sans-serif",
      "bold 44px sans-serif",
      "bold 44px sans-serif",
      "36px sans-serif",
    ];
    const cardInnerH = mainLines.reduce(
      (acc, _, i) => acc + (lineHeights[i] ?? 44),
      0
    );
    const cardH = cardInnerH + CARD_PADDING_V * 2;
    const cardW = SIZE - PADDING * 2;
    const cardX = PADDING;
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

    ctx.fillStyle = TEXT_MAIN;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    let ly = cardY + CARD_PADDING_V;

    mainLines.forEach((line, i) => {
      ctx.font = fonts[i] ?? "36px sans-serif";
      ctx.fillText(line, centerX, ly);
      ly += lineHeights[i] ?? 44;
    });

    y = cardY + cardH + 40;

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
