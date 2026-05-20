"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ProtocolInteraction } from "@/lib/types";

// Ocean-themed protocol colors (hex values required by Recharts)
const CATEGORY_COLORS: Record<string, string> = {
  lending: "#06C2D9", // bioluminescent teal
  dex:     "#7B8CDE", // deep-water indigo
  yield:   "#F4A629", // amber sunlight
  bridge:  "#7FB3CC", // muted ocean blue
  staking: "#A78BFA", // purple bioluminescence
  perps:   "#F87171", // coral red
  other:   "#4A7A93", // deep muted teal
};

interface Props {
  protocols: ProtocolInteraction[];
}

export default function ProtocolChart({ protocols }: Props) {
  const sorted = [...protocols]
    .sort((a, b) => b.interactionCount - a.interactionCount)
    .slice(0, 8);

  const data = sorted.map((p) => ({
    name: p.protocol.replace(/ V\d$/, ""),
    interactions: p.interactionCount,
    category: p.category,
  }));

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
        marginBottom: 16,
      }}>
        Protocol Activity
      </div>

      {data.length === 0 ? (
        <div style={{ padding: "28px 0", textAlign: "center", color: "var(--text-3)", fontSize: 13 }}>
          <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>⬡</div>
          <div style={{ marginBottom: 4 }}>No DeFi protocol interactions detected</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>
            This wallet hasn&apos;t interacted with any tracked protocols
          </div>
        </div>
      ) : (
        <>
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 0, bottom: 0 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "#3C7A94" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 12, fill: "#6EB5CE" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(6,194,217,0.05)" }}
                  contentStyle={{
                    background: "#0C1F34",
                    border: "0.5px solid rgba(6,194,217,0.25)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "#D9F0F7",
                  }}
                  formatter={(value: number) => [value, "Interactions"]}
                />
                <Bar dataKey="interactions" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {data.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={CATEGORY_COLORS[entry.category] ?? CATEGORY_COLORS.other}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
            {Object.entries(CATEGORY_COLORS)
              .filter(([key]) => data.some((d) => d.category === key))
              .map(([cat, color]) => (
                <div key={cat} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                  <span style={{ color: "#3C7A94", textTransform: "capitalize" }}>{cat}</span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
