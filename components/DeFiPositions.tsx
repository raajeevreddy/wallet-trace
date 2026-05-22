"use client";

import type { DeFiPortfolio, DeFiPosition } from "@/lib/types";

function fmt(usd: number) {
  if (usd >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (usd >= 1_000) return `$${(usd / 1_000).toFixed(1)}K`;
  return `$${usd.toFixed(2)}`;
}

function fmtAmount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  if (n >= 1) return n.toFixed(2);
  return n.toPrecision(3);
}

const TYPE_COLOR: Record<DeFiPosition["positionType"], string> = {
  supply: "var(--green)",
  borrow: "#F07070",
  lp: "#B48EFF",
};

const TYPE_LABEL: Record<DeFiPosition["positionType"], string> = {
  supply: "Supply",
  borrow: "Borrow",
  lp: "LP",
};

function PositionRow({ pos }: { pos: DeFiPosition }) {
  const color = TYPE_COLOR[pos.positionType];
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "10px 0",
      borderBottom: "0.5px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{
          fontSize: 10, fontWeight: 600, padding: "2px 7px",
          borderRadius: 4, background: `${color}18`,
          color, letterSpacing: "0.04em",
        }}>
          {TYPE_LABEL[pos.positionType]}
        </span>
        <div>
          <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
            {pos.positionType === "lp"
              ? `${pos.asset} / ${pos.asset2}`
              : pos.asset}
          </div>
          <div style={{ fontSize: 11, color: "var(--text-3)" }}>{pos.protocol}</div>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
          {pos.usdValue > 0 ? fmt(pos.usdValue) : "—"}
        </div>
        <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          {pos.positionType === "lp"
            ? `${fmtAmount(pos.amount)} / ${fmtAmount(pos.amount2 ?? 0)}`
            : fmtAmount(pos.amount)}
          {" "}{pos.positionType !== "lp" && pos.asset}
        </div>
      </div>
    </div>
  );
}

export default function DeFiPositions({ defi }: { defi: DeFiPortfolio }) {
  if (defi.positions.length === 0) return null;

  const totalDeFiUsd = defi.totalSuppliedUsd + defi.totalBorrowedUsd + defi.totalLpUsd;

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(12,31,52,0.97) 0%, rgba(7,22,39,0.95) 100%)",
      border: "0.5px solid var(--border)",
      borderRadius: 16, padding: "22px 24px",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", margin: 0 }}>
            DeFi Positions
          </h3>
          <p style={{ fontSize: 11, color: "var(--text-3)", margin: "2px 0 0" }}>
            Via The Graph · Aave V3 &amp; Uniswap V3
          </p>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "var(--green)" }}>
          {fmt(totalDeFiUsd)}
        </span>
      </div>

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {defi.totalSuppliedUsd > 0 && (
          <span style={{
            fontSize: 11, padding: "3px 10px",
            background: "rgba(6,194,217,0.08)", border: "0.5px solid rgba(6,194,217,0.20)",
            borderRadius: 20, color: "var(--green)",
          }}>
            Supplied {fmt(defi.totalSuppliedUsd)}
          </span>
        )}
        {defi.totalBorrowedUsd > 0 && (
          <span style={{
            fontSize: 11, padding: "3px 10px",
            background: "rgba(240,112,112,0.08)", border: "0.5px solid rgba(240,112,112,0.20)",
            borderRadius: 20, color: "#F07070",
          }}>
            Borrowed {fmt(defi.totalBorrowedUsd)}
          </span>
        )}
        {defi.totalLpUsd > 0 && (
          <span style={{
            fontSize: 11, padding: "3px 10px",
            background: "rgba(180,142,255,0.08)", border: "0.5px solid rgba(180,142,255,0.20)",
            borderRadius: 20, color: "#B48EFF",
          }}>
            LP {fmt(defi.totalLpUsd)}
          </span>
        )}
      </div>

      {/* Position rows */}
      <div>
        {defi.positions.map((pos, i) => (
          <PositionRow key={`${pos.protocol}-${pos.positionType}-${pos.asset}-${i}`} pos={pos} />
        ))}
      </div>
    </div>
  );
}
