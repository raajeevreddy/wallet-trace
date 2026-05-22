import type { WalletProfile } from "@/lib/types";

interface Props {
  profile: WalletProfile;
}

function formatUsd(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

function formatAge(years: number): string {
  if (!years) return "—";
  if (years < 1) return `${Math.round(years * 12)}mo`;
  return `${years.toFixed(1)}y`;
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: 12,
        padding: "20px 22px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle top accent line */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: "linear-gradient(90deg, rgba(6,194,217,0.5) 0%, transparent 100%)",
      }} />
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.10em",
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1,
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>{sub}</div>
      )}
    </div>
  );
}

export default function MetricGrid({ profile }: Props) {
  const { identity, netWorthUsd, totalTransactions, protocols } = profile;

  return (
    <div
      className="metric-grid"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 10,
      }}
    >
      <MetricCard
        label="Net Worth"
        value={formatUsd(netWorthUsd)}
        sub="Across all chains"
      />
      <MetricCard
        label="Wallet Age"
        value={formatAge(identity.walletAgeYears ?? 0)}
        sub={identity.walletAgeYears ? "On-chain since " + new Date((identity.firstTxTimestamp ?? 0) * 1000).getFullYear() : undefined}
      />
      <MetricCard
        label="Transactions"
        value={totalTransactions.toLocaleString()}
        sub="Recent 90 days"
      />
      <MetricCard
        label="Protocols"
        value={protocols.length.toString()}
        sub="Unique interactions"
      />
    </div>
  );
}
