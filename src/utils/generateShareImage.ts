/**
 * シェア用「挑戦状カード」画像を Canvas で生成
 * 1080×1350（4:5）・ダークネイビー背景・レート数字最大強調
 * SNS拡散に特化したインパクト重視デザイン
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

// --- Canvas size ---
const W = 1080;
const H = 1350;

// --- Colors ---
const BG_TOP = "#080c18";
const BG_BOTTOM = "#0f1629";
const TEXT_WHITE = "#f0f0f0";
const TEXT_MUTED = "#6b7a99";
const DELTA_PLUS = "#34d399";
const DELTA_MINUS = "#f87171";

// --- Rating tier colors ---
export interface RatingTier {
  label: string;
  primary: string;
  glow: string;
}

export function getRatingTier(rating: number): RatingTier {
  if (rating >= 2000) return { label: "レジェンド", primary: "#f87171", glow: "#ef444480" };
  if (rating >= 1800) return { label: "ゴールド",   primary: "#fbbf24", glow: "#f59e0b80" };
  if (rating >= 1400) return { label: "ブルー",     primary: "#60a5fa", glow: "#3b82f680" };
  return                       { label: "シルバー",   primary: "#cbd5e1", glow: "#94a3b880" };
}

// --- Helpers ---
function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function generateShareImage(params: ShareImageParams): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) { reject(new Error("Canvas not supported")); return; }

    const {
      correctCount,
      totalQuestions,
      rating,
      ratingDelta = 0,
      url = "",
    } = params;

    const tier = getRatingTier(rating);
    const cx = W / 2;

    // ── Background gradient ──
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, BG_TOP);
    grad.addColorStop(1, BG_BOTTOM);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Subtle radial glow behind rating
    const glowY = H * 0.38;
    const glowGrad = ctx.createRadialGradient(cx, glowY, 0, cx, glowY, 360);
    glowGrad.addColorStop(0, tier.glow);
    glowGrad.addColorStop(1, "transparent");
    ctx.fillStyle = glowGrad;
    ctx.fillRect(0, glowY - 360, W, 720);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // ── ① Brand ──
    let y = 140;
    ctx.font = "600 32px sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText("⚾ 野球IQクイズ", cx, y);

    // ── ② "野球IQ" label ──
    y += 120;
    ctx.font = "bold 56px sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText("野球IQ", cx, y);

    // ── ③ Rating number (HUGE) ──
    y += 130;
    ctx.font = "bold 200px sans-serif";
    ctx.fillStyle = tier.primary;
    ctx.fillText(String(rating), cx, y);

    // ── ④ Delta ──
    if (ratingDelta !== 0) {
      y += 120;
      const sign = ratingDelta > 0 ? "+" : "";
      ctx.font = "bold 56px sans-serif";
      ctx.fillStyle = ratingDelta > 0 ? DELTA_PLUS : DELTA_MINUS;
      ctx.fillText(`(${sign}${ratingDelta})`, cx, y);
    } else {
      y += 120;
    }

    // ── ⑤ Score ──
    y += 100;
    ctx.font = "bold 52px sans-serif";
    ctx.fillStyle = TEXT_WHITE;
    ctx.fillText(`${correctCount} / ${totalQuestions} 正解`, cx, y);

    // ── ⑥ Percentile placeholder ──
    y += 72;
    ctx.font = "400 36px sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText("全国上位 ??%", cx, y);

    // ── ⑦ Taunt ──
    y += 130;
    // Pill background
    const tauntText = "あなたは超えられる？";
    ctx.font = "bold 52px sans-serif";
    const tw = ctx.measureText(tauntText).width;
    const pillW = tw + 80;
    const pillH = 80;
    roundRect(ctx, cx - pillW / 2, y - pillH / 2, pillW, pillH, pillH / 2);
    ctx.fillStyle = tier.primary + "18"; // very subtle tint
    ctx.fill();
    ctx.strokeStyle = tier.primary + "40";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = TEXT_WHITE;
    ctx.fillText(tauntText, cx, y);

    // ── ⑧ Footer URL ──
    if (url) {
      const footerUrl = url.replace(/^https?:\/\//, "");
      ctx.font = "400 28px sans-serif";
      ctx.fillStyle = TEXT_MUTED;
      ctx.fillText(footerUrl, cx, H - 60);
    }

    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      "image/png",
      0.95,
    );
  });
}
