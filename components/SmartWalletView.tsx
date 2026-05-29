"use client";

import type { SmartWalletProfile } from "@/lib/types";

interface Props {
  data: SmartWalletProfile;
}

const ACCENT = "#22c55e"; // green for ERC-4337
const EOA_ACCENT = "#6b7280"; // grey for EOA

function shortAddr(addr: string) {
  if (!addr) return "—";
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function SmartWalletView({ data }: Props) {
  const {
    address, isSmartWallet, isERC4337, totalUserOps, sponsoredOps,
    selfPaidOps, factoryName, factory, paymasters, recentOps, narrative,
  } = data;

  const accent = isERC4337 ? ACCENT : EOA_ACCENT;
  const sponsorRate = totalUserOps > 0 ? Math.round((sponsoredOps / totalUserOps) * 100) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

      {/* ── Verdict banner ──────────────────────────────────────────────────── */}
      <div style={{
        background: "var(--surface)",
        border: `0.5px solid ${accent}40`,
        borderRadius: 14, padding: "24px 28px",
        boxShadow: `0 0 0 1px ${accent}08, 0 4px 24px ${accent}08`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
            background: `${accent}18`,
            border: `1.5px solid ${accent}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>
            {isERC4337 ? "🤖" : "👤"}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.01em" }}>
              {isERC4337
                ? (factoryName || "ERC-4337 Smart Wallet")
                : isSmartWallet
                ? "Smart Contract Wallet (non-4337)"
                : "Standard EOA"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
              {shortAddr(address)}
              {factory ? ` · deployed by ${shortAddr(factory)}` : ""}
            </div>
          </div>
          <div style={{
            marginLeft: "auto",
            padding: "5px 14px",
            background: `${accent}15`,
            border: `0.5px solid ${accent}35`,
            borderRadius: 20,
            fontSize: 11, fontWeight: 700, color: accent,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {isERC4337 ? "ERC-4337" : isSmartWallet ? "Smart Contract" : "EOA"}
          </div>
        </div>

        {/* AI narrative */}
        <p style={{
          fontSize: 14, lineHeight: 1.7, color: "var(--text-2)", margin: 0,
          borderLeft: `2px solid ${accent}`, paddingLeft: 14,
        }}>
          {narrative}
        </p>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────────────── */}
      {isERC4337 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>
          {[
            { label: "Total UserOps", value: totalUserOps.toString(), sub: "on Base" },
            { label: "Sponsored", value: `${sponsoredOps}`, sub: `${sponsorRate}% free gas` },
            { label: "Self-paid", value: `${selfPaidOps}`, sub: "own gas" },
            { label: "Paymasters", value: paymasters.length.toString(), sub: "unique sponsors" },
          ].map(({ label, value, sub }) => (
            <div key={label} style={{
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
              borderRadius: 12, padding: "16px 18px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, ${accent}60 0%, transparent 100%)`,
              }} />
              <div style={{ fontSize: 26, fontWeight: 700, color: accent, letterSpacing: "-0.02em" }}>
                {value}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Paymaster breakdown ─────────────────────────────────────────────── */}
      {paymasters.length > 0 && (
        <div style={{
          background: "var(--surface)", border: "0.5px solid var(--border)",
          borderRadius: 14, padding: "24px 28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <div style={{ width: 3, height: 18, borderRadius: 2, background: `${accent}80`, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: "0.10em" }}>
              Gas Sponsors
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {paymasters.map((pm) => (
              <div key={pm.address}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{pm.name}</span>
                    <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginLeft: 8 }}>
                      {shortAddr(pm.address)}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: accent, fontWeight: 600 }}>
                    {pm.opsCount} ops · {pm.percentage}%
                  </span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
                  <div style={{
                    height: "100%", borderRadius: 2,
                    background: `linear-gradient(90deg, ${accent} 0%, ${accent}80 100%)`,
                    width: `${pm.percentage}%`,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent UserOps ──────────────────────────────────────────────────── */}
      {recentOps.length > 0 && (
        <div style={{
          background: "var(--surface)", border: "0.5px solid var(--border)",
          borderRadius: 14, padding: "24px 28px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <div style={{ width: 3, height: 18, borderRadius: 2, background: `${accent}80`, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: accent, textTransform: "uppercase", letterSpacing: "0.10em" }}>
              Recent UserOperations
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recentOps.slice(0, 10).map((op) => (
              <a
                key={op.userOpHash}
                href={`https://basescan.org/tx/${op.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px",
                  background: "rgba(255,255,255,0.02)",
                  border: "0.5px solid rgba(255,255,255,0.05)",
                  borderRadius: 8, textDecoration: "none",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    fontSize: 10, padding: "2px 8px",
                    background: op.sponsored ? `${ACCENT}18` : "rgba(255,255,255,0.05)",
                    border: `0.5px solid ${op.sponsored ? `${ACCENT}35` : "rgba(255,255,255,0.08)"}`,
                    borderRadius: 20,
                    color: op.sponsored ? ACCENT : "var(--text-3)",
                    fontWeight: 600,
                  }}>
                    {op.sponsored ? `⛽ ${op.paymasterName}` : "Self-paid"}
                  </span>
                  <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
                    {shortAddr(op.userOpHash)}
                  </span>
                </div>
                <span style={{ fontSize: 11, color: "var(--text-3)" }}>
                  block {op.blockNumber.toLocaleString()} ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── EOA upgrade nudge ───────────────────────────────────────────────── */}
      {!isERC4337 && (
        <div style={{
          background: "rgba(34,197,94,0.05)",
          border: "0.5px solid rgba(34,197,94,0.18)",
          borderRadius: 14, padding: "20px 24px",
          display: "flex", gap: 16, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 24, flexShrink: 0 }}>💡</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
              What a smart wallet would unlock
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                "Gas sponsorship — apps pay your fees",
                "Batched calls — multiple actions in one transaction",
                "Session keys — approve once, act many times",
                "Social recovery — no more lost seed phrases",
              ].map((f) => (
                <div key={f} style={{ fontSize: 12, color: "var(--text-3)", display: "flex", gap: 8 }}>
                  <span style={{ color: ACCENT }}>→</span> {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
