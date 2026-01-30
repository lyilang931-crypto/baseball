import { ImageResponse } from "next/og";

export const alt = "今日の1球 - 野球IQクイズ";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
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
            padding: "64px 80px",
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#111827",
              marginBottom: 16,
            }}
          >
            ⚾ 今日の1球
          </div>
          <div
            style={{
              fontSize: 36,
              color: "#6b7280",
              marginBottom: 32,
            }}
          >
            野球IQクイズ
          </div>
          <div
            style={{
              fontSize: 42,
              fontWeight: 600,
              color: "#374151",
            }}
          >
            あなたならどうする？
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
