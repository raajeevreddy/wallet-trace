import type { WalletProfile, AIAnalysis, WalletTag } from "@/lib/types";

const TAG_STYLES: Record<string, { bg: string; color: string }> = {
  "Yield Farmer":     { bg: "var(--green-bg)",  color: "var(--green-dim)" },
  "Treasury Wallet":  { bg: "var(--blue-bg)",   color: "var(--blue)" },
  "Whale":            { bg: "var(--amber-bg)",  color: "var(--amber)" },
  "DeFi Power User":  { bg: "var(--green-bg)",  color: "var(--green-dim)" },
  "Bridge User":      { bg: "var(--blue-bg)",   color: "var(--blue)" },
  "Long-Term Holder": { bg: "var(--amber-bg)",  color: "var(--amber)" },
  "Retail Trader":    { bg: "var(--surface-2)", color: "var(--text-2)" },
  "Market Maker":     { bg: "var(--red-bg)",    color: "var(--red)" },
};

const SOPHISTICATION_COLOR: Record<string, string> = {
  Novice:        "var(--text-3)",
  Intermediate:  "var(--amber)",
  Advanced:      "var(--blue)",
  Institutional: "var(--green)",
};

const BREAKDOWN_LABELS: Record<string, string> = {
  walletAge:            "Wallet Age",
  protocolDiversity:    "Protocols",
  transactionFrequency: "Tx Frequency",
  multiChainActivity:   "Multi-chain",
};

interface Props {
  profile: WalletProfile;
  narrative: AIAnalysis;
}

export default function WalletHeader({ profile, narrative }: Props) {
  const { identity, tags, sophistication } = profile;
  const short = `${identity.address.slice(0, 6)}...${identity.address.slice(-4)}`;
  const scoreColor = SOPHISTICATION_COLOR[sophistication.label] ?? "var(--green)";

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: 14,
        padding: "22px 24px",
      }}
    >
      {/* ── Top row: avatar + identity + sophistication badge ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
        {/* Avatar */}
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--green) 0%, var(--blue) 100%)",
            flexShrink: 0,
            marginTop: 2,
          }}
        />

        {/* Identity */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {identity.ens && (
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {identity.ens}
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: identity.ens ? 12 : 16,
              color: identity.ens ? "var(--text-3)" : "var(--text)",
              marginTop: identity.ens ? 2 : 0,
            }}
          >
            {short}
          </div>

          {/* Archetype badge */}
          <div
            style={{
              display: "inline-block",
              marginTop: 8,
              fontSize: 12,
              color: "var(--green-dim)",
              background: "var(--green-bg)",
              padding: "3px 10px",
              borderRadius: 20,
              fontStyle: "italic",
              fontWeight: 500,
            }}
          >
            {narrative.behaviorType}
          </div>

          {/* Wallet tags */}
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
              {tags.map((tag: WalletTag) => {
                const style = TAG_STYLES[tag] ?? { bg: "var(--surface-2)", color: "var(--text-2)" };
                return (
                  <span
                    key={tag}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      padding: "2px 9px",
                      borderRadius: 20,
                      background: style.bg,
                      color: style.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {tag}
                  </span>
                );
              })}
            </div>
          )}
        </div>

        {/* Sophistication score — compact, top-right */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
            Sophistication
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 3, justifyContent: "flex-end" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 34,
                fontWeight: 700,
                color: scoreColor,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}
            >
              {sophistication.score}
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>/100</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: scoreColor,
              fontWeight: 500,
              marginTop: 2,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            {sophistication.label}
          </div>
        </div>
      </div>

      {/* ── Breakdown bars — 2×2 grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px 24px",
          marginTop: 18,
          paddingTop: 16,
          borderTop: "0.5px solid var(--border)",
        }}
      >
        {Object.entries(sophistication.breakdown).map(([key, val]) => {
          const maxVal = 35;
          const pct = Math.min((val / maxVal) * 100, 100);
          const label = BREAKDOWN_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").trim();
          return (
            <div key={key}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</span>
                <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500, fontFamily: "var(--font-mono)" }}>{val}</span>
              </div>
              <div
                style={{
                  height: 3,
                  background: "var(--surface-3)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: scoreColor,
                    borderRadius: 2,
                    opacity: 0.65,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
