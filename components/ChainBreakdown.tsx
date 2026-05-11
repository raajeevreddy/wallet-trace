import type { ChainActivity } from "@/lib/types";

const CHAIN_COLORS: Record<string, string> = {
  ethereum: "#627EEA",
  base:     "#0052FF",
  arbitrum: "#2D374B",
  solana:   "#9945FF",
};

const CHAIN_LABELS: Record<string, string> = {
  ethereum: "Ethereum",
  base:     "Base",
  arbitrum: "Arbitrum",
  solana:   "Solana",
};

interface Props {
  chains: ChainActivity[];
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  if (n > 0) return `$${Math.round(n).toLocaleString()}`;
  return "—";
}

export default function ChainBreakdown({ chains }: Props) {
  const sorted = [...chains].sort((a, b) => b.percentage - a.percentage);

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: 14,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 14,
        }}
      >
        Chain Distribution
      </div>

      {sorted.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
          No multi-chain activity detected
        </p>
      ) : (
        <>
          {/* Stacked bar */}
          <div
            style={{
              height: 8,
              borderRadius: 4,
              overflow: "hidden",
              display: "flex",
              marginBottom: 16,
            }}
          >
            {sorted.map((c) => (
              <div
                key={c.chain}
                style={{
                  width: `${Math.max(c.percentage, 2)}%`,
                  background: CHAIN_COLORS[c.chain] ?? "#888",
                  transition: "width 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* Chain rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((c) => (
              <div
                key={c.chain}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: CHAIN_COLORS[c.chain] ?? "#888",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, color: "var(--text)" }}>
                  {CHAIN_LABELS[c.chain] ?? c.chain}
                </span>
                {c.netWorthUsd > 0 && (
                  <span style={{ color: "var(--text-3)", fontSize: 12 }}>
                    {formatUsd(c.netWorthUsd)}
                  </span>
                )}
                <span style={{ fontWeight: 500, color: "var(--text)", minWidth: 38, textAlign: "right" }}>
                  {Math.round(c.percentage)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
