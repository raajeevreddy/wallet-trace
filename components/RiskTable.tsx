import type { RiskProfile, RiskLevel } from "@/lib/types";

interface Props {
  risk: RiskProfile;
}

const RISK_STYLE: Record<RiskLevel, { color: string; bg: string; label: string }> = {
  low:    { color: "var(--green-dim)", bg: "var(--green-bg)",  label: "Low" },
  medium: { color: "var(--amber)",     bg: "var(--amber-bg)",  label: "Medium" },
  high:   { color: "var(--red)",       bg: "var(--red-bg)",    label: "High" },
};

function RiskBadge({ level }: { level: RiskLevel }) {
  const s = RISK_STYLE[level];
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 500,
        padding: "3px 10px",
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        whiteSpace: "nowrap",
      }}
    >
      {s.label}
    </span>
  );
}

const RISK_ROWS: { key: keyof RiskProfile; label: string; description: string }[] = [
  {
    key: "concentrationRisk",
    label: "Concentration",
    description: "Portfolio weight of the largest single asset",
  },
  {
    key: "bridgeExposure",
    label: "Bridge exposure",
    description: "Risk from cross-chain bridge protocol dependencies",
  },
  {
    key: "protocolDiversification",
    label: "Protocol diversity",
    description: "Number of distinct DeFi protocols used",
  },
  {
    key: "stablecoinDependence",
    label: "Stablecoin dependency",
    description: "Portfolio allocation to stablecoins",
  },
  {
    key: "leverageIndicators",
    label: "Leverage",
    description: "Presence of leveraged or derivatives positions",
  },
  {
    key: "smartContractRisk",
    label: "Smart contract",
    description: "Exposure from interacting with multiple contracts",
  },
];

export default function RiskTable({ risk }: Props) {
  const overallLevel: RiskLevel =
    risk.overallScore >= 60 ? "high" : risk.overallScore >= 30 ? "medium" : "low";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: 14,
        padding: "20px 24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--text-3)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
          }}
        >
          Risk Profile
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            Overall score: {risk.overallScore}/100
          </span>
          <RiskBadge level={overallLevel} />
        </div>
      </div>

      {/* Risk rows — 2 column grid on wider screens */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2px",
        }}
      >
        {RISK_ROWS.map((row) => {
          const level = risk[row.key] as RiskLevel;
          return (
            <div
              key={row.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "0.5px solid var(--border)",
                gap: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                  {row.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>
                  {row.description}
                </div>
              </div>
              <RiskBadge level={level} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
