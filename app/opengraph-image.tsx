import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Wallet Trace — AI Ethereum Wallet Analysis";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
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
          background: "linear-gradient(135deg, #030F1C 0%, #0C1F34 60%, #071627 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div style={{
          position: "absolute",
          top: "-20%", left: "50%",
          transform: "translateX(-50%)",
          width: 900, height: 500,
          background: "radial-gradient(ellipse, rgba(6,194,217,0.18) 0%, transparent 70%)",
          display: "flex",
        }} />

        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(6,194,217,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(6,194,217,0.05) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          display: "flex",
        }} />

        {/* Logo */}
        <div style={{
          display: "flex", alignItems: "center", gap: 20,
          marginBottom: 32, position: "relative",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(135deg, #06C2D9 0%, #0897B0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 40px rgba(6,194,217,0.5)",
          }}>
            <svg width="32" height="32" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5L15 8.5H11.5V17.5H8.5V8.5H5L10 2.5Z" fill="white" />
            </svg>
          </div>
          <span style={{
            fontSize: 52, fontWeight: 800,
            color: "#D9F0F7",
            letterSpacing: "-0.03em",
          }}>
            Wallet Trace
          </span>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 24, color: "#6EB5CE",
          margin: 0, textAlign: "center",
          maxWidth: 700, lineHeight: 1.5,
        }}>
          Institutional-grade AI analysis for any Ethereum wallet
        </p>

        {/* Feature chips */}
        <div style={{
          display: "flex", gap: 12, marginTop: 40,
        }}>
          {["ENS Support", "DeFi Protocols", "Risk Scoring", "AI Narrative"].map((f) => (
            <div key={f} style={{
              fontSize: 16, padding: "8px 20px",
              background: "rgba(6,194,217,0.10)",
              border: "1px solid rgba(6,194,217,0.25)",
              borderRadius: 999, color: "#7FB3CC",
            }}>{f}</div>
          ))}
        </div>

        {/* URL */}
        <p style={{
          position: "absolute", bottom: 36,
          fontSize: 18, color: "#3C7A94", margin: 0,
        }}>
          wallet-trace.vercel.app
        </p>
      </div>
    ),
    { ...size }
  );
}
