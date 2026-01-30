/**
 * シェア用カード画像を Canvas で生成（外部SDKなし）
 * 1080x1920 縦型・モバイル向け
 * 白背景・太字・中央・角丸カード風
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

const W = 1080;
const H = 1920;
const PADDING = 80;

export function generateShareImage(params: ShareImageParams): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
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
      streak = 0,
      levelLabel = "",
      url = "",
    } = params;

    // 白背景
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, W, H);

    let y = PADDING + 60;

    const drawTitle = (text: string, fontSize: number, bold = true) => {
      ctx.font = `${bold ? "bold " : ""}${fontSize}px sans-serif`;
      ctx.fillStyle = "#111827";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const lines = text.split("\n");
      lines.forEach((line) => {
        ctx.fillText(line, W / 2, y);
        y += fontSize * 1.3;
      });
      y += 20;
    };

    const drawCard = (lines: string[], fontSize: number) => {
      const lineHeight = fontSize * 1.4;
      const cardH = lines.length * lineHeight + 48;
      const cardY = y - 12;
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(PADDING, cardY, W - PADDING * 2, cardH);
      ctx.fillStyle = "#374151";
      ctx.font = `${fontSize}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      let ly = cardY + 24;
      lines.forEach((line) => {
        ctx.fillText(line, W / 2, ly);
        ly += lineHeight;
      });
      y = cardY + cardH + 24;
    };

    // アプリ名
    drawTitle("⚾ 今日の1球", 56);
    drawTitle("あなたなら、どうする？", 36, false);

    y += 20;

    // 結果カード
    const resultLines = [
      `${correctCount} / ${totalQuestions} 正解`,
      `正答率 ${Math.round(accuracy)}%`,
      `レート ${rating}`,
    ];
    if (streak > 0) resultLines.push(`連続 ${streak}日`);
    if (levelLabel) resultLines.push(levelLabel);
    drawCard(resultLines, 42);

    if (url) {
      ctx.font = "28px sans-serif";
      ctx.fillStyle = "#6b7280";
      ctx.fillText(url, W / 2, y);
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
