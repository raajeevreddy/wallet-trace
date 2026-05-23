import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function shortAddr(addr: string) {
  if (addr.includes(".")) return addr; // ENS
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

function chainLabel(addr: string) {
  if (addr.includes(".")) return "Ethereum · ENS";
  if (addr.startsWith("0x")) return "Ethereum";
  return "Solana";
}

function chainColor(addr: string) {
  if (!addr.startsWith("0x") && !addr.includes(".")) return "#9945FF"; // Solana purple
  return "#06C2D9"; // teal
}

export default function WalletOGImage({ params }: { params: { address: string } }) {
  const addr = decodeURIComponent(params.address);
  const display = shortAddr(addr);
  const chain = chainLabel(addr);
  const accent = chainColor(addr);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%",
          display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg, #030F1C 0%, #0A1E33 55%, #071627 100%)",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Grid lines */}
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          backgroundImage: `linear-gradient(${accent}0D 1px, transparent 1px), linear-gradient(90deg, ${accent}0D 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }} />

        {/* Top glow */}
        <div style={{
          position: "absolute", top: -100, left: "50%",
          width: 900, height: 500, display: "flex",
          background: `radial-gradient(ellipse, ${accent}22 0%, transparent 70%)`,
          transform: "translateX(-50%)",
        }} />

        {/* Bottom-right glow */}
        <div style={{
          position: "absolute", bottom: -80, right: -80, display: "flex",
          width: 400, height: 400,
          background: `radial-gradient(ellipse, ${accent}15 0%, transparent 70%)`,
        }} />

        {/* Content */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "space-between", height: "100%",
          padding: "52px 72px 48px",
          position: "relative",
        }}>

          {/* Header — logo + roast badge */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: `linear-gradient(135deg, ${accent} 0%, #0897B0 100%)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 0 32px ${accent}55`,
              }}>
                <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2.5L15 8.5H11.5V17.5H8.5V8.5H5L10 2.5Z" fill="white" />
                </svg>
              </div>
              <span style={{
                fontSize: 34, fontWeight: 800, color: "#D9F0F7",
                letterSpacing: "-0.02em",
              }}>
                WalletIQ
              </span>
            </div>

            {/* Roast badge */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 24px",
              background: "rgba(6,194,217,0.10)",
              border: `1.5px solid ${accent}40`,
              borderRadius: 999,
            }}>
              <span style={{ fontSize: 24 }}>🔥</span>
              <span style={{ fontSize: 20, fontWeight: 700, color: accent, letterSpacing: "0.04em" }}>
                AI WALLET ROAST
              </span>
            </div>
          </div>

          {/* Center — wallet address */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: `${accent}99`,
              textTransform: "uppercase", letterSpacing: "0.14em",
            }}>
              {chain}
            </div>

            <div style={{
              fontSize: display.length > 20 ? 52 : 64,
              fontWeight: 800,
              color: "#EAFAFF",
              letterSpacing: display.startsWith("0x") ? "-0.01em" : "-0.02em",
              fontFamily: "monospace",
              lineHeight: 1.1,
            }}>
              {display}
            </div>

            <div style={{
              fontSize: 22, color: "#4A8FA8", fontWeight: 400,
              maxWidth: 680,
            }}>
              Drop any Ethereum or Solana wallet. Get roasted by AI in seconds.
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{
              display: "flex", gap: 12,
            }}>
              {["Token Balances", "DeFi Positions", "Risk Score", "AI Roast"].map((f) => (
                <div key={f} style={{
                  fontSize: 14, padding: "6px 16px",
                  background: `${accent}12`,
                  border: `1px solid ${accent}28`,
                  borderRadius: 999, color: `${accent}BB`,
                }}>{f}</div>
              ))}
            </div>

            <span style={{ fontSize: 18, color: "#2E6880" }}>
              walletiq.vercel.app
            </span>
          </div>

        </div>
      </div>
    ),
    { ...size }
  );
}
