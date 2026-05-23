"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { PricePoint } from "@/lib/types";

function fmtUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function fmtDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: PricePoint }[] }) {
  if (!active || !payload?.length) return null;
  const { timestamp, usdValue } = payload[0].payload as PricePoint;
  return (
    <div style={{
      background: "rgba(7,22,39,0.97)",
      border: "0.5px solid rgba(6,194,217,0.25)",
      borderRadius: 8, padding: "8px 14px",
      fontSize: 12, color: "var(--text)",
    }}>
      <div style={{ color: "var(--text-3)", marginBottom: 2 }}>{fmtDate(timestamp)}</div>
      <div style={{ fontWeight: 600, color: "var(--green)" }}>{fmtUsd(usdValue)}</div>
    </div>
  );
}

export default function NetWorthChart({ history, chain }: { history: PricePoint[]; chain: string }) {
  if (history.length < 3) return null;

  const values = history.map((p) => p.usdValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const change = values[values.length - 1] - values[0];
  const changePct = values[0] > 0 ? (change / values[0]) * 100 : 0;
  const isUp = change >= 0;
  const nativeTicker = chain === "solana" ? "SOL" : "ETH";

  const yMin = Math.floor(min * 0.95);
  const yMax = Math.ceil(max * 1.05);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(12,31,52,0.97) 0%, rgba(7,22,39,0.95) 100%)",
      border: "0.5px solid var(--border-strong)",
      borderRadius: 16, padding: "22px 24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 3, height: 14, borderRadius: 2, background: "var(--green)", opacity: 0.8 }} />
            <h3 style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", margin: 0, textTransform: "uppercase", letterSpacing: "0.10em" }}>
              Portfolio Trend
            </h3>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "0 0 0 11px" }}>
            30d · {nativeTicker} price × current holdings (approx.)
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text)" }}>
            {fmtUsd(values[values.length - 1])}
          </div>
          <div style={{
            fontSize: 12, fontWeight: 500,
            color: isUp ? "var(--green)" : "#F07070",
          }}>
            {isUp ? "+" : ""}{changePct.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: 140 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06C2D9" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#06C2D9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              tickFormatter={fmtDate}
              tick={{ fontSize: 10, fill: "var(--text-3)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[yMin, yMax]}
              tickFormatter={fmtUsd}
              tick={{ fontSize: 10, fill: "var(--text-3)" }}
              tickLine={false}
              axisLine={false}
              width={56}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="usdValue"
              stroke="#06C2D9"
              strokeWidth={1.5}
              fill="url(#netWorthGradient)"
              dot={false}
              activeDot={{ r: 3, fill: "#06C2D9", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
