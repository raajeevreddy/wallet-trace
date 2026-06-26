"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Mode = "analyze" | "compare" | "smart-wallet";

const EXAMPLE_WALLETS = [
  { label: "Vitalik.eth", address: "vitalik.eth" },
  { label: "Coinbase", address: "0x503828976d22510aad0201ac7ec88293211d23da" },
  { label: "Aave Treasury", address: "0x25F2226B597E8F9514B3F68F00f494cF4f286491" },
  { label: "Eth Foundation", address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe" },
  { label: "hayden.eth", address: "hayden.eth" },
];

function looksLikeENS(input: string) { return input.includes(".") && !input.startsWith("0x"); }
function looksLikeSolana(input: string) { return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input); }
function isEthAddress(input: string) { return /^0x[a-fA-F0-9]{40}$/.test(input); }

const TABS: { id: Mode; label: string; icon: string; desc: string; accent: string }[] = [
  { id: "analyze",      label: "Analyze",      icon: "🔥", desc: "Roast · Time Machine · Portfolio", accent: "#06C2D9" },
  { id: "compare",      label: "Compare",      icon: "⚔️", desc: "Head-to-head wallet battle",       accent: "#9945FF" },
  { id: "smart-wallet", label: "Smart Wallet", icon: "🤖", desc: "ERC-4337 · Paymasters · UserOps",  accent: "#22c55e" },
];

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("analyze");
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const accent = TABS.find(t => t.id === mode)!.accent;

  function reset() { setError(""); }

  async function resolveToPath(input: string): Promise<string | null> {
    const trimmed = input.trim();
    if (!trimmed) { setError("Enter a wallet address or ENS name"); return null; }
    if (looksLikeENS(trimmed)) {
      const res = await fetch(`/api/ens?name=${encodeURIComponent(trimmed.toLowerCase())}`);
      const json = await res.json();
      if (!json.address) { setError(json.error ?? `Could not resolve "${trimmed}"`); return null; }
      return encodeURIComponent(trimmed.toLowerCase());
    }
    if (looksLikeSolana(trimmed)) return trimmed;
    if (isEthAddress(trimmed)) return trimmed.toLowerCase();
    setError("Enter a valid Ethereum address (0x…), ENS name, or Solana address");
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);

    try {
      if (mode === "analyze") {
        const path = await resolveToPath(addr1);
        if (path) router.push(`/analysis/${path}`);

      } else if (mode === "compare") {
        if (!addr1.trim()) { setError("Enter Wallet A"); return; }
        if (!addr2.trim()) { setError("Enter Wallet B"); return; }
        const path1 = await resolveToPath(addr1);
        if (!path1) return;
        const path2 = await resolveToPath(addr2);
        if (!path2) return;
        if (path1 === path2) { setError("Enter two different wallets"); return; }
        router.push(`/analysis/${path1}?tab=compare&compare=${path2}`);

      } else {
        const trimmed = addr1.trim();
        if (!trimmed) { setError("Enter an Ethereum address or ENS name"); return; }
        if (looksLikeSolana(trimmed)) { setError("Smart Wallet is ETH/Base only — Solana wallets don't use ERC-4337"); return; }
        const path = await resolveToPath(trimmed);
        if (path) router.push(`/analysis/${path}?tab=smart-wallet`);
      }
    } finally {
      setLoading(false);
    }
  }

  function loadExample(addr: string) { setAddr1(addr); reset(); }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px 80px", position: "relative", overflow: "hidden",
    }}>
      {/* Glow */}
      <div style={{ position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)", width: 700, height: 400, background: `radial-gradient(ellipse, ${accent}18 0%, transparent 70%)`, pointerEvents: "none", transition: "background 0.3s" }} />

      {/* Hero */}
      <div style={{ marginBottom: 36, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg, #06C2D9 0%, #0897B0 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(6,194,217,0.35)" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L15 8.5H11.5V17.5H8.5V8.5H5L10 2.5Z" fill="white" /></svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em" }}>OnchainAI</span>
        </div>
        <p style={{ fontSize: 17, color: "var(--text-2)", maxWidth: 480, lineHeight: 1.65, margin: "0 auto", fontWeight: 300 }}>
          Paste any Ethereum or Solana address — get{" "}
          <span style={{ color: "var(--green)", fontWeight: 400 }}>an AI roast, time machine, smart wallet detection, and head-to-head comparisons</span>{" "}
          all in one dashboard.
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 580,
        background: "linear-gradient(135deg, rgba(12,31,52,0.97) 0%, rgba(7,22,39,0.95) 100%)",
        border: `0.5px solid ${accent}35`,
        borderRadius: 20, padding: "28px 28px 24px",
        boxShadow: `0 0 0 3px ${accent}08, 0 20px 60px rgba(0,0,0,0.5)`,
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}>

        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 22, borderBottom: "0.5px solid var(--border)", paddingBottom: 0 }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => { setMode(tab.id); reset(); }}
              style={{
                flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                padding: "8px 4px 10px",
                fontSize: 12, fontWeight: mode === tab.id ? 600 : 400,
                color: mode === tab.id ? tab.accent : "var(--text-3)",
                background: "none", border: "none",
                borderBottom: `2px solid ${mode === tab.id ? tab.accent : "transparent"}`,
                marginBottom: -1, cursor: "pointer",
                transition: "all 0.15s", fontFamily: "var(--font-body)",
              }}>
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Mode description */}
        <p style={{ fontSize: 11, color: "var(--text-3)", textAlign: "center", margin: "0 0 16px", letterSpacing: "0.04em" }}>
          {TABS.find(t => t.id === mode)!.desc}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Analyze / Smart Wallet — single input */}
          {(mode === "analyze" || mode === "smart-wallet") && (
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <input type="text" value={addr1} onChange={(e) => { setAddr1(e.target.value); reset(); }}
                placeholder={mode === "smart-wallet" ? "0x… or ENS name (Ethereum only)" : "0x…, vitalik.eth, or Solana address"}
                spellCheck={false}
                style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 13, padding: "11px 16px", border: `0.5px solid ${error ? "var(--red)" : `${accent}40`}`, borderRadius: 10, background: "rgba(3,15,28,0.6)", color: "var(--text)", outline: "none", transition: "border-color 0.2s" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--red)" : `${accent}40`; }}
              />
              <button type="submit" disabled={loading}
                style={{ padding: "11px 22px", background: loading ? `${accent}18` : `linear-gradient(135deg, ${accent} 0%, ${accent}CC 100%)`, color: loading ? "var(--text-3)" : "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-body)", boxShadow: loading ? "none" : `0 0 20px ${accent}40`, letterSpacing: "0.01em", minWidth: 100 }}>
                {loading ? "…" : mode === "smart-wallet" ? "Inspect →" : "Analyze →"}
              </button>
            </div>
          )}

          {/* Compare — two inputs */}
          {mode === "compare" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.10em", width: 16, flexShrink: 0 }}>A</span>
                <input type="text" value={addr1} onChange={(e) => { setAddr1(e.target.value); reset(); }}
                  placeholder="0x… or ENS name" spellCheck={false}
                  style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 13, padding: "10px 14px", border: `0.5px solid ${accent}40`, borderRadius: 10, background: "rgba(3,15,28,0.6)", color: "var(--text)", outline: "none" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = `${accent}40`; }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#9945FF", textTransform: "uppercase", letterSpacing: "0.10em", width: 16, flexShrink: 0 }}>B</span>
                <input type="text" value={addr2} onChange={(e) => { setAddr2(e.target.value); reset(); }}
                  placeholder="0x… or ENS name" spellCheck={false}
                  style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 13, padding: "10px 14px", border: "0.5px solid rgba(153,69,255,0.35)", borderRadius: 10, background: "rgba(3,15,28,0.6)", color: "var(--text)", outline: "none" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "#9945FF"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(153,69,255,0.35)"; }}
                />
              </div>
              <button type="submit" disabled={loading}
                style={{ padding: "11px", background: loading ? "rgba(153,69,255,0.12)" : "linear-gradient(135deg, #9945FF 0%, #6B21A8 100%)", color: loading ? "var(--text-3)" : "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", boxShadow: loading ? "none" : "0 0 20px rgba(153,69,255,0.35)" }}>
                {loading ? "…" : "Compare Wallets →"}
              </button>
            </div>
          )}

          {error && <p style={{ fontSize: 12, color: "var(--red)", margin: "4px 0 0" }}>{error}</p>}
        </form>

        {/* Examples — only for analyze mode */}
        {mode === "analyze" && (
          <div style={{ marginTop: 18 }}>
            <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 10 }}>Try an example</p>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
              {EXAMPLE_WALLETS.map((w) => (
                <button key={w.address} onClick={() => loadExample(w.address)}
                  style={{ fontSize: 12, padding: "5px 13px", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.09)", borderRadius: 20, color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.15s", whiteSpace: "nowrap", flexShrink: 0 }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(6,194,217,0.10)"; e.currentTarget.style.borderColor = "rgba(6,194,217,0.25)"; e.currentTarget.style.color = "var(--text)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "var(--text-2)"; }}>
                  {w.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p style={{ position: "absolute", bottom: 24, left: 0, right: 0, fontSize: 12, color: "var(--text-3)", textAlign: "center", pointerEvents: "none" }}>
        Powered by Alchemy · Helius · Claude AI · CoinGecko · DeFiLlama
      </p>
    </main>
  );
}
