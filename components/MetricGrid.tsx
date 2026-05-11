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
        background: "var(--surface-2)",
        borderRadius: 10,
        padding: "16px 20px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

export default function MetricGrid({ profile }: Props) {
  const { identity, netWorthUsd, totalTransactions, protocols } = profile;

  return (
    <div
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
