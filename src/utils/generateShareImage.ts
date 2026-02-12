/**
 * シェア用「挑戦状カード」画像を Canvas で生成
 * 1080×1350（4:5）・ダークネイビー背景・上重心レイアウト
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

// ── Canvas size ──
const W = 1080;
const H = 1350;

// ── Colors ──
const BG_DARK = "#06091a";
const BG_MID = "#0c1228";
const TEXT_WHITE = "#f0f2f5";
const TEXT_SUB = "#94a3c0";
const TEXT_MUTED = "#556380";
const DELTA_PLUS = "#34d399";
const DELTA_MINUS = "#f87171";

// ── Rating tier ──
export interface RatingTier {
  rank: string;
  label: string;
  primary: string;
  primaryLight: string;
  glow: string;
  glowStrong: string;
}

export function getRatingTier(rating: number): RatingTier {
  if (rating >= 2000) return {
    rank: "SS", label: "レジェンド",
    primary: "#ef4444", primaryLight: "#fca5a5",
    glow: "#ef444440", glowStrong: "#ef444470",
  };
  if (rating >= 1800) return {
    rank: "S", label: "ゴールド",
    primary: "#f59e0b", primaryLight: "#fde68a",
    glow: "#f59e0b40", glowStrong: "#f59e0b70",
  };
  if (rating >= 1600) return {
    rank: "A", label: "エース",
    primary: "#3b82f6", primaryLight: "#93c5fd",
    glow: "#3b82f640", glowStrong: "#3b82f670",
  };
  if (rating >= 1400) return {
    rank: "B", label: "レギュラー",
    primary: "#6366f1", primaryLight: "#a5b4fc",
    glow: "#6366f140", glowStrong: "#6366f170",
  };
  return {
    rank: "C", label: "ルーキー",
    primary: "#94a3b8", primaryLight: "#cbd5e1",
    glow: "#94a3b840", glowStrong: "#94a3b870",
  };
}

/** 次の節目レートまでの差（上位1%演出用） */
function getGapToNext(rating: number): { target: number; gap: number } {
  const thresholds = [2200, 2000, 1800, 1600, 1400];
  for (const t of thresholds) {
    if (rating < t) return { target: t, gap: t - rating };
  }
  return { target: 2400, gap: 2400 - rating };
}

// ── Helpers ──
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

function drawDivider(
  ctx: CanvasRenderingContext2D,
  y: number,
  color: string,
  width: number = 600,
) {
  const x0 = (W - width) / 2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x0 + width, y);
  ctx.stroke();
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
    const { gap } = getGapToNext(rating);

    // ═══════════════════════════════════════
    // Background
    // ═══════════════════════════════════════
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, BG_DARK);
    bgGrad.addColorStop(0.5, BG_MID);
    bgGrad.addColorStop(1, BG_DARK);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Vertical elliptical glow (scaleY で縦長に)
    ctx.save();
    const glowCY = H * 0.30;
    ctx.translate(cx, glowCY);
    ctx.scale(1, 1.6);
    const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, 320);
    glow.addColorStop(0, tier.glowStrong);
    glow.addColorStop(0.5, tier.glow);
    glow.addColorStop(1, "transparent");
    ctx.fillStyle = glow;
    ctx.fillRect(-540, -540, 1080, 1080);
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // ═══════════════════════════════════════
    // ① Brand (5-8% from top)
    // ═══════════════════════════════════════
    let y = 88;
    ctx.font = "500 30px sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText("🧠 野球IQクイズ", cx, y);

    // ═══════════════════════════════════════
    // ② Main block — upper gravity
    // ═══════════════════════════════════════

    // "野球IQ" label
    y = 200;
    ctx.font = "bold 52px sans-serif";
    ctx.fillStyle = TEXT_SUB;
    ctx.fillText("野球IQ", cx, y);

    // Rating number — 250px with shadow + gradient fill
    y = 370;
    const ratingStr = String(rating);
    ctx.font = "bold 250px sans-serif";

    // Drop shadow
    ctx.save();
    ctx.shadowColor = tier.glow;
    ctx.shadowBlur = 60;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;

    // Gradient text (top: primaryLight → bottom: primary)
    const textTop = y - 125; // approximate for 250px font
    const textBot = y + 125;
    const textGrad = ctx.createLinearGradient(0, textTop, 0, textBot);
    textGrad.addColorStop(0, tier.primaryLight);
    textGrad.addColorStop(1, tier.primary);
    ctx.fillStyle = textGrad;
    ctx.fillText(ratingStr, cx, y);
    ctx.restore();

    // Delta
    y = 510;
    if (ratingDelta !== 0) {
      const sign = ratingDelta > 0 ? "+" : "";
      ctx.font = "bold 54px sans-serif";
      ctx.fillStyle = ratingDelta > 0 ? DELTA_PLUS : DELTA_MINUS;
      ctx.fillText(`(${sign}${ratingDelta})`, cx, y);
    }

    // ═══════════════════════════════════════
    // ③ Stats block
    // ═══════════════════════════════════════

    // Score
    y = 620;
    ctx.font = "bold 50px sans-serif";
    ctx.fillStyle = TEXT_WHITE;
    ctx.fillText(`${correctCount} / ${totalQuestions} 正解`, cx, y);

    // Rank badge
    y = 700;
    const rankText = `${tier.rank}ランク`;
    ctx.font = "bold 42px sans-serif";
    const rankW = ctx.measureText(rankText).width + 60;
    const rankH = 60;
    roundRect(ctx, cx - rankW / 2, y - rankH / 2, rankW, rankH, rankH / 2);
    ctx.fillStyle = tier.primary + "25";
    ctx.fill();
    ctx.strokeStyle = tier.primary + "60";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = tier.primary;
    ctx.fillText(rankText, cx, y);

    // Percentile placeholder
    y = 775;
    ctx.font = "400 34px sans-serif";
    ctx.fillStyle = TEXT_MUTED;
    ctx.fillText("全国上位 ??%", cx, y);

    // ═══════════════════════════════════════
    // ④ Competition line
    // ═══════════════════════════════════════
    y = 860;
    ctx.font = "bold 38px sans-serif";
    ctx.fillStyle = TEXT_SUB;
    ctx.fillText(`🔥 上位1%まであと ${gap}`, cx, y);

    // ═══════════════════════════════════════
    // ⑤ CTA with dividers
    // ═══════════════════════════════════════
    y = 960;
    drawDivider(ctx, y, tier.primary + "50", 680);

    y = 1030;
    ctx.font = "bold 54px sans-serif";
    ctx.fillStyle = TEXT_WHITE;
    ctx.fillText("🔥 このIQ、超えられる？", cx, y);

    y = 1100;
    drawDivider(ctx, y, tier.primary + "50", 680);

    // ═══════════════════════════════════════
    // ⑥ Footer URL
    // ═══════════════════════════════════════
    if (url) {
      const footerUrl = url.replace(/^https?:\/\//, "");
      ctx.font = "400 28px sans-serif";
      ctx.fillStyle = TEXT_MUTED;
      ctx.fillText(footerUrl, cx, 1190);
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
