import type { StablecoinSummary } from "@/lib/types";

interface Props {
  stablecoins: StablecoinSummary;
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export default function StablecoinPanel({ stablecoins }: Props) {
  const pct = Math.round(stablecoins.portfolioPercentage);
  const hasStables = stablecoins.totalUsdValue > 0;

  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 14,
      padding: "20px 24px",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 500, color: "var(--text-3)",
        textTransform: "uppercase", letterSpacing: "0.07em",
        marginBottom: 12,
      }}>
        Stablecoin Exposure
      </div>

      {!hasStables ? (
        <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
          <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.4 }}>◎</div>
          No stablecoin positions
        </div>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span style={{
              fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700,
              color: "var(--blue)", lineHeight: 1, letterSpacing: "-0.02em",
            }}>
              {pct}%
            </span>
            <span style={{ fontSize: 13, color: "var(--text-2)" }}>of portfolio</span>
          </div>

          <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14 }}>
            {formatUsd(stablecoins.totalUsdValue)} total
            {stablecoins.isTreasuryLike && (
              <span style={{
                marginLeft: 8, fontSize: 10, padding: "2px 8px",
                borderRadius: 10, background: "var(--blue-bg)",
                color: "var(--blue)", fontWeight: 500,
              }}>Treasury-like</span>
            )}
          </div>

          {/* Progress bar */}
          <div style={{
            height: 6, background: "var(--surface-3)",
            borderRadius: 3, overflow: "hidden", marginBottom: 14,
          }}>
            <div style={{
              height: "100%", width: `${Math.min(pct, 100)}%`,
              background: "linear-gradient(90deg, #7B8CDE, #06C2D9)",
              borderRadius: 3, transition: "width 0.5s ease",
            }} />
          </div>

          {/* Breakdown */}
          {stablecoins.breakdown.length > 0 && (
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {stablecoins.breakdown.slice(0, 4).map((b) => (
                <div key={b.symbol}>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 2 }}>{b.symbol}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>
                    {Math.round(b.percentage)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
