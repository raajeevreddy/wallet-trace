import type { TimeMachineAnalysis } from "@/lib/types";

interface Props {
  timeMachine: TimeMachineAnalysis;
}

const ENTRIES: {
  key: keyof TimeMachineAnalysis;
  label: string;
  icon: string;
  color: string;
  bg: string;
}[] = [
  { key: "bestTrade",        label: "Best Trade",         icon: "🏆", color: "#22c55e", bg: "rgba(34,197,94,0.08)"   },
  { key: "worstTrade",       label: "Worst Trade",        icon: "💀", color: "#f07070", bg: "rgba(240,112,112,0.08)" },
  { key: "biggestRegret",    label: "Biggest Regret",     icon: "😭", color: "#f4a629", bg: "rgba(244,166,41,0.08)"  },
  { key: "survivalInstincts",label: "Survival Instincts", icon: "🐢", color: "#06C2D9", bg: "rgba(6,194,217,0.08)"   },
];

export default function TimeMachine({ timeMachine }: Props) {
  return (
    <div style={{
      background: "var(--surface)",
      border: "0.5px solid rgba(244,166,41,0.25)",
      borderRadius: 14,
      padding: "24px 28px",
      boxShadow: "0 0 0 1px rgba(244,166,41,0.06), 0 4px 24px rgba(244,166,41,0.06)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
        <div style={{
          position: "relative",
          width: 3, height: 18, borderRadius: 2,
          background: "rgba(244,166,41,0.7)",
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
          ⏳ Wallet Time Machine
        </span>
      </div>

      {/* Grid of 4 entries */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 14,
      }}>
        {ENTRIES.map(({ key, label, icon, color, bg }) => (
          <div key={key} style={{
            background: bg,
            border: `0.5px solid ${color}28`,
            borderRadius: 10,
            padding: "14px 16px",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 7, marginBottom: 8,
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
              <span style={{
                fontSize: 10, fontWeight: 600, color,
                textTransform: "uppercase", letterSpacing: "0.10em",
              }}>
                {label}
              </span>
            </div>
            <p style={{
              fontSize: 13, lineHeight: 1.65,
              color: "var(--text-2)", margin: 0,
            }}>
              {timeMachine[key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
