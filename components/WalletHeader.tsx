import type { WalletProfile, AIAnalysis, WalletTag } from "@/lib/types";

interface AvatarConfig { emoji: string; gradient: string; glow: string }

function getAvatarConfig(behaviorType: string): AvatarConfig {
  const t = behaviorType.toLowerCase();

  if (/stable|usdc|usdt|safe|bottom.wait|bunker|harbor|savings|bottom.water|inflationary|sideways|perpetual.safe|maximum.caution|pre.entry|liquid.courage|dry.powder/i.test(t))
    return { emoji: "🏦", gradient: "135deg, #F4A629 0%, #B87213 100%", glow: "rgba(244,166,41,0.35)" };

  if (/ghost|museum|sleeper|dormant|exhibit|amnesia|web3.one.night|minimalist|mission.pause|time.capsule|patience|monk|observer|spectator|lurker|philosophical|abandoned|missing/i.test(t))
    return { emoji: "👻", gradient: "135deg, #64748B 0%, #334155 100%", glow: "rgba(100,116,139,0.35)" };

  if (/jpeg|nft|archaeologist|collector|art|gallery|pfp|profile.picture|digital.art|curator/i.test(t))
    return { emoji: "🖼️", gradient: "135deg, #9945FF 0%, #6B21C8 100%", glow: "rgba(153,69,255,0.35)" };

  if (/chain|tourist|omni|multichain|bridge|attention.deficit|world.tour|passport|ecosystem/i.test(t))
    return { emoji: "🌍", gradient: "135deg, #3B82F6 0%, #1D4ED8 100%", glow: "rgba(59,130,246,0.35)" };

  if (/gas|philanthropist|benefactor|ethereum.gas|volume|transaction|busy|1[0-9]{3}|power.user|hyperactive/i.test(t))
    return { emoji: "⛽", gradient: "135deg, #F97316 0%, #C2410C 100%", glow: "rgba(249,115,22,0.35)" };

  if (/whale|mega|institutional|fund|treasury|8.figure|9.figure|7.figure/i.test(t))
    return { emoji: "🐋", gradient: "135deg, #06C2D9 0%, #0564A8 100%", glow: "rgba(6,194,217,0.35)" };

  if (/veteran|scarred|battle|og\b|war.story|experienced|long.game|survivor|years.in|decade|early/i.test(t))
    return { emoji: "🦕", gradient: "135deg, #84CC16 0%, #3F6212 100%", glow: "rgba(132,204,22,0.35)" };

  if (/degen|ape|rekt|yolo|gambl|leverage|perp|risk/i.test(t))
    return { emoji: "🎰", gradient: "135deg, #EC4899 0%, #9D174D 100%", glow: "rgba(236,72,153,0.35)" };

  if (/yield|farm|harvest|compost|liquidity|lp\b|pool/i.test(t))
    return { emoji: "🌾", gradient: "135deg, #22C55E 0%, #15803D 100%", glow: "rgba(34,197,94,0.35)" };

  // default
  return { emoji: "🎯", gradient: "135deg, #06C2D9 0%, #0897B0 100%", glow: "rgba(6,194,217,0.35)" };
}

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
  const avatar = getAvatarConfig(narrative.behaviorType);

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
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: `linear-gradient(${avatar.gradient})`,
            boxShadow: `0 0 20px ${avatar.glow}, 0 0 40px ${avatar.glow.replace("0.35", "0.12")}`,
            flexShrink: 0,
            marginTop: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 24,
          }}
        >
          {avatar.emoji}
        </div>

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
