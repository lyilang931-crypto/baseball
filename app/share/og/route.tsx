import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const score = url.searchParams.get("score") ?? "0";
  const total = url.searchParams.get("total") ?? "5";
  const rating = url.searchParams.get("rating") ?? "";

  const scoreNum = parseInt(score, 10) || 0;
  const totalNum = parseInt(total, 10) || 5;
  const accuracy =
    totalNum > 0 ? Math.round((scoreNum / totalNum) * 100) : 0;

  return new ImageResponse(
    (
      <div
        style={{
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#f3f4f6",
            borderRadius: 24,
            padding: "56px 72px",
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 12,
            }}
          >
            ⚾ 今日の1球
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#6b7280",
              marginBottom: 24,
            }}
          >
            野球IQクイズ
          </div>
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 8,
            }}
          >
            {scoreNum} / {totalNum} 正解
          </div>
          <div
            style={{
              fontSize: 32,
              color: "#374151",
              marginBottom: rating ? 8 : 0,
            }}
          >
            正答率 {accuracy}%
          </div>
          {rating ? (
            <div
              style={{
                fontSize: 28,
                color: "#6b7280",
              }}
            >
              レート {rating}
            </div>
          ) : null}
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: "#374151",
              marginTop: 24,
            }}
          >
            あなたならどうする？
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
