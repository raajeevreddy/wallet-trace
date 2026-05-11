"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { ProtocolInteraction } from "@/lib/types";

const CATEGORY_COLORS: Record<string, string> = {
  lending: "#1D9E75",
  dex:     "#185FA5",
  yield:   "#BA7517",
  bridge:  "#888780",
  staking: "#7F77DD",
  perps:   "#D85A30",
  other:   "#B4B2A9",
};

interface Props {
  protocols: ProtocolInteraction[];
}

export default function ProtocolChart({ protocols }: Props) {
  const sorted = [...protocols]
    .sort((a, b) => b.interactionCount - a.interactionCount)
    .slice(0, 8);

  const data = sorted.map((p) => ({
    name: p.protocol.replace(/ V\d$/, ""), // trim version
    interactions: p.interactionCount,
    category: p.category,
  }));

  return (
    <div
      style={{
        background: "var(--surface)",
        border: "0.5px solid var(--border-strong)",
        borderRadius: 14,
        padding: "20px 24px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--text-3)",
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          marginBottom: 16,
        }}
      >
        Protocol Activity
      </div>

      {data.length === 0 ? (
        <p style={{ color: "var(--text-3)", fontSize: 13 }}>No protocol data available</p>
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
                  tick={{ fontSize: 11, fill: "var(--text-3)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fontSize: 12, fill: "var(--text-2)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "var(--surface-2)" }}
                  contentStyle={{
                    background: "var(--surface)",
                    border: "0.5px solid var(--border-strong)",
                    borderRadius: 8,
                    fontSize: 12,
                    color: "var(--text)",
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
                <div
                  key={cat}
                  style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11 }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: "var(--text-3)", textTransform: "capitalize" }}>{cat}</span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
