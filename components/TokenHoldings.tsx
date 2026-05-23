import type { TokenBalance } from "@/lib/types";

interface Props {
  tokens: TokenBalance[];
  netWorthUsd: number;
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `<$0.01`;
}

function formatBalance(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return n.toFixed(4);
  if (n >= 0.0001) return n.toFixed(6);
  return "<0.0001";
}

// Deterministic color from symbol string
function symbolColor(symbol: string): string {
  const colors = [
    "#06C2D9", "#7B8CDE", "#F4A629", "#A78BFA",
    "#34D399", "#F87171", "#7FB3CC", "#FB923C",
  ];
  let h = 0;
  for (let i = 0; i < symbol.length; i++) h = (h * 31 + symbol.charCodeAt(i)) & 0xffff;
  return colors[h % colors.length];
}

function TokenRow({
  token,
  rank,
  portfolioPct,
}: {
  token: TokenBalance;
  rank: number;
  portfolioPct: number;
}) {
  const color = symbolColor(token.symbol);
  const isEth = token.contractAddress === "native";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderBottom: "0.5px solid var(--border)",
      }}
    >
      {/* Rank */}
      <div style={{ fontSize: 11, color: "var(--text-3)", minWidth: 18, textAlign: "right" }}>
        {rank}
      </div>

      {/* Token avatar */}
      <div style={{
        width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
        background: `linear-gradient(135deg, ${color}33, ${color}66)`,
        border: `1px solid ${color}44`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color,
        fontFamily: "var(--font-display)",
      }}>
        {token.symbol.slice(0, 2).toUpperCase()}
      </div>

      {/* Name + symbol */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 500, color: "var(--text)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          {token.symbol}
          {isEth && (
            <span style={{
              fontSize: 9, padding: "1px 6px",
              background: "rgba(6,194,217,0.12)",
              border: "0.5px solid rgba(6,194,217,0.25)",
              borderRadius: 10, color: "var(--green)",
              fontWeight: 500, letterSpacing: "0.04em",
            }}>NATIVE</span>
          )}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
          {token.name || token.symbol}
        </div>
      </div>

      {/* Balance */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 12, color: "var(--text-2)", fontFamily: "var(--font-mono)" }}>
          {formatBalance(token.balance)}
        </div>
        <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>
          {token.symbol}
        </div>
      </div>

      {/* USD value */}
      <div style={{ textAlign: "right", minWidth: 80, flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", fontFamily: "var(--font-display)" }}>
          {formatUsd(token.usdValue)}
        </div>
        {portfolioPct > 0 && (
          <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 1 }}>
            {portfolioPct.toFixed(1)}%
          </div>
        )}
      </div>
    </div>
  );
}

export default function TokenHoldings({ tokens, netWorthUsd }: Props) {
  // Show tokens with value first, then dust
  const withValue = tokens
    .filter((t) => t.usdValue >= 0.01)
    .sort((a, b) => b.usdValue - a.usdValue);
  const dust = tokens.filter((t) => t.usdValue < 0.01 && t.usdValue >= 0);

  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 14,
      padding: "20px 24px",
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between", marginBottom: 4,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 3, height: 14, borderRadius: 2, background: "rgba(6,194,217,0.7)" }} />
          <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
            Token Holdings
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)" }}>
          {tokens.length} asset{tokens.length !== 1 ? "s" : ""}
          {dust.length > 0 && ` · ${dust.length} dust`}
        </div>
      </div>

      {/* Column headers */}
      {withValue.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          paddingBottom: 8, borderBottom: "0.5px solid var(--border)",
          marginBottom: 0,
        }}>
          <div style={{ minWidth: 18 }} />
          <div style={{ width: 32 }} />
          <div style={{ flex: 1, fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Asset</div>
          <div style={{ textAlign: "right", minWidth: 80, fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Balance</div>
          <div style={{ textAlign: "right", minWidth: 80, fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Value</div>
        </div>
      )}

      {/* Token rows */}
      {withValue.length === 0 && dust.length === 0 && (
        <div style={{
          padding: "32px 0", textAlign: "center",
          color: "var(--text-3)", fontSize: 13,
        }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>◈</div>
          No token holdings found
        </div>
      )}

      {withValue.map((token, i) => (
        <TokenRow
          key={token.contractAddress}
          token={token}
          rank={i + 1}
          portfolioPct={netWorthUsd > 0 ? (token.usdValue / netWorthUsd) * 100 : 0}
        />
      ))}

      {/* Dust summary */}
      {dust.length > 0 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 10, fontSize: 12, color: "var(--text-3)",
        }}>
          <span>+ {dust.length} dust token{dust.length !== 1 ? "s" : ""}</span>
          <span style={{ fontSize: 11 }}>&lt; $0.01 each</span>
        </div>
      )}
    </div>
  );
}
