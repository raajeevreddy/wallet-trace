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
        padding: "24px 28px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      {/* Left: identity */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flex: 1, minWidth: 240 }}>
        {/* Identicon avatar */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: `linear-gradient(135deg, var(--green) 0%, var(--blue) 100%)`,
            flexShrink: 0,
          }}
        />
        <div>
          {identity.ens && (
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 20,
                fontWeight: 700,
                color: "var(--text)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {identity.ens}
            </div>
          )}
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: identity.ens ? 12 : 15,
              color: identity.ens ? "var(--text-3)" : "var(--text)",
              marginTop: identity.ens ? 2 : 0,
            }}
          >
            {short}
          </div>

          {/* Behavior type from AI */}
          <div
            style={{
              fontSize: 13,
              color: "var(--text-2)",
              marginTop: 6,
              fontStyle: "italic",
            }}
          >
            {narrative.behaviorType}
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
            {tags.map((tag: WalletTag) => {
              const style = TAG_STYLES[tag] ?? { bg: "var(--surface-2)", color: "var(--text-2)" };
              return (
                <span
                  key={tag}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    padding: "3px 10px",
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
        </div>
      </div>

      {/* Right: sophistication score */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
          Sophistication
        </div>
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 52,
            fontWeight: 700,
            color: scoreColor,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          {sophistication.score}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>
          / 100 · {sophistication.label}
        </div>

        {/* Score breakdown mini-bars */}
        <div style={{ marginTop: 12, width: 160 }}>
          {Object.entries(sophistication.breakdown).map(([key, val]) => (
            <div key={key} style={{ marginBottom: 5 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10,
                  color: "var(--text-3)",
                  marginBottom: 2,
                  textTransform: "capitalize",
                }}
              >
                <span>{key.replace(/([A-Z])/g, " $1").trim()}</span>
                <span>{val}</span>
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
                    width: `${(val / 35) * 100}%`,
                    background: scoreColor,
                    borderRadius: 2,
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
