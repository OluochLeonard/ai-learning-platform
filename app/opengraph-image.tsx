import { ImageResponse } from "next/og";

export const alt = "PLATFORM: Learn AI. Earn more.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "#ffffff",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: 6 }}>
          PLATFORM
        </div>
        <div style={{ fontSize: 88, fontWeight: 800, marginTop: 24 }}>
          Learn AI. Earn more.
        </div>
        <div style={{ fontSize: 34, marginTop: 28, opacity: 0.9 }}>
          10 minutes a day. Pay with M-Pesa. Made for Kenya.
        </div>
      </div>
    ),
    size,
  );
}