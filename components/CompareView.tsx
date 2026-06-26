"use client";

import type { CompareResponse } from "@/lib/types";

interface Props {
  data: CompareResponse;
}

const COMPARE_ROWS: {
  key: keyof CompareResponse["comparison"];
  label: string;
  icon: string;
}[] = [
  { key: "riskTolerance",   label: "Risk Tolerance",   icon: "⚡" },
  { key: "nftTaste",        label: "NFT Taste",        icon: "🖼️" },
  { key: "defiBehavior",    label: "DeFi Behavior",    icon: "🏦" },
  { key: "chainPreferences",label: "Chain Preferences",icon: "🔗" },
];

function shortAddr(addr: string) {
  if (addr.includes(".")) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function formatWorth(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export default function CompareView({ data }: Props) {
  const { wallet1, wallet2, comparison } = data;
  const p1 = wallet1.profile;
  const p2 = wallet2.profile;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Header: side-by-side wallet cards ─────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center",
      }}>
        {/* Wallet 1 */}
        <WalletSummaryCard profile={p1} narrative={wallet1.narrative} accent="#06C2D9" />

        {/* VS badge */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg, rgba(6,194,217,0.2) 0%, rgba(153,69,255,0.2) 100%)",
          border: "0.5px solid rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 13, fontWeight: 800, color: "var(--text-3)",
          letterSpacing: "0.04em",
        }}>
          VS
        </div>

        {/* Wallet 2 */}
        <WalletSummaryCard profile={p2} narrative={wallet2.narrative} accent="#9945FF" />
      </div>

      {/* ── Comparison breakdown ───────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: "0.5px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "24px 28px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: "rgba(153,69,255,0.7)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(153,69,255,0.9)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
            Head-to-Head
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {COMPARE_ROWS.map(({ key, label, icon }) => (
            <div key={key} style={{
              padding: "14px 16px",
              background: "rgba(255,255,255,0.02)",
              border: "0.5px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
                  {label}
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: "var(--text-2)", margin: 0 }}>
                {comparison[key]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Verdict ───────────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: "0.5px solid rgba(244,166,41,0.25)",
        borderRadius: 14,
        padding: "24px 28px",
        boxShadow: "0 0 0 1px rgba(244,166,41,0.06), 0 4px 24px rgba(244,166,41,0.06)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: "rgba(244,166,41,0.7)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
            🏆 Verdict
          </span>
        </div>
        <p style={{
          fontSize: 15, lineHeight: 1.7, color: "var(--text)", margin: 0,
          borderLeft: "2px solid var(--amber)", paddingLeft: 16,
        }}>
          {comparison.verdict}
        </p>
      </div>
    </div>
  );
}

// ─── Wallet summary card ──────────────────────────────────────────────────────

function WalletSummaryCard({
  profile,
  narrative,
  accent,
}: {
  profile: CompareResponse["wallet1"]["profile"];
  narrative: CompareResponse["wallet1"]["narrative"];
  accent: string;
}) {
  const display = profile.identity.ens ?? shortAddr(profile.identity.address);

  return (
    <div style={{
      background: "var(--surface)",
      border: `0.5px solid ${accent}30`,
      borderRadius: 14,
      padding: "20px 22px",
      boxShadow: `0 0 0 1px ${accent}08`,
    }}>
      {/* Address */}
      <div style={{
        fontSize: 13, fontWeight: 700, color: "var(--text)",
        fontFamily: "var(--font-mono)", marginBottom: 4,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {display}
      </div>

      {/* Behavior type badge */}
      {narrative.behaviorType && (
        <div style={{
          display: "inline-block",
          fontSize: 11, padding: "2px 10px",
          background: `${accent}15`,
          border: `0.5px solid ${accent}30`,
          borderRadius: 20, color: accent,
          marginBottom: 14,
        }}>
          {narrative.behaviorType}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <StatRow label="Net worth" value={formatWorth(profile.netWorthUsd)} accent={accent} />
        <StatRow label="Risk score" value={`${profile.risk.overallScore}/100`} accent={accent} />
        <StatRow label="Transactions" value={profile.totalTransactions.toLocaleString()} accent={accent} />
        <StatRow label="NFTs" value={(profile.nfts?.totalCount ?? 0).toString()} accent={accent} />
        <StatRow label="Protocols" value={profile.protocols.length.toString()} accent={accent} />
        <StatRow label="Chains" value={profile.chains.length.toString()} accent={accent} />
      </div>
    </div>
  );
}

function StatRow({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: accent }}>{value}</span>
    </div>
  );
}
