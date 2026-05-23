"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getRecentWallets,
  clearRecentWallets,
  shortAddress,
  type RecentWallet,
} from "@/lib/recentWallets";

const EXAMPLE_WALLETS = [
  { label: "Vitalik.eth", address: "vitalik.eth" },
  { label: "Aave Treasury", address: "0x25F2226B597E8F9514B3F68F00f494cF4f286491" },
  { label: "Binance Hot", address: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE" },
  { label: "Eth Foundation", address: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe" },
  { label: "hayden.eth", address: "hayden.eth" },
];

function looksLikeENS(input: string): boolean {
  return input.includes(".") && !input.startsWith("0x");
}

function looksLikeSolana(input: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input);
}

export default function HomePage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Analyzing…");
  const [recentWallets, setRecentWallets] = useState<RecentWallet[]>([]);
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    setRecentWallets(getRecentWallets());
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();
    if (!trimmed) { setError("Please enter a wallet address or ENS name"); return; }

    setError("");
    setLoading(true);

    if (looksLikeENS(trimmed)) {
      setLoadingMsg("Resolving ENS…");
      try {
        const res = await fetch(`/api/ens?name=${encodeURIComponent(trimmed.toLowerCase())}`);
        const json = await res.json();
        if (!res.ok || !json.address) { setError(json.error ?? `Could not resolve "${trimmed}"`); setLoading(false); return; }
        router.push(`/analysis/${encodeURIComponent(trimmed.toLowerCase())}`);
        return;
      } catch {
        setError("Network error resolving ENS name. Please try again.");
        setLoading(false);
        return;
      }
    }

    if (looksLikeSolana(trimmed)) {
      setLoadingMsg("Analyzing…");
      router.push(`/analysis/${trimmed}`);
      return;
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError("Enter a valid Ethereum address (0x…), ENS name, or Solana address");
      setLoading(false);
      return;
    }

    setLoadingMsg("Analyzing…");
    router.push(`/analysis/${trimmed.toLowerCase()}`);
  }

  function loadExample(addr: string) { setAddress(addr); setError(""); }
  function handleClearRecent() { clearRecentWallets(); setRecentWallets([]); }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 80px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ── Decorative deep-sea glow orbs ──────────────────────────────────── */}
      <div style={{
        position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400,
        background: "radial-gradient(ellipse, rgba(6,194,217,0.10) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-10%",
        width: 400, height: 400,
        background: "radial-gradient(ellipse, rgba(8,151,176,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 40, textAlign: "center", position: "relative" }}>
        {/* Logo mark */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 42, height: 42, borderRadius: "50%",
            background: "linear-gradient(135deg, #06C2D9 0%, #0897B0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 24px rgba(6,194,217,0.35), 0 0 48px rgba(6,194,217,0.12)",
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5L15 8.5H11.5V17.5H8.5V8.5H5L10 2.5Z" fill="white" />
            </svg>
          </div>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: 26, fontWeight: 800,
            color: "var(--text)",
            letterSpacing: "-0.03em",
          }}>
            Wallet Trace
          </span>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 17, color: "var(--text-2)",
          maxWidth: 480, lineHeight: 1.65, margin: "0 auto",
          fontWeight: 300,
        }}>
          Paste any Ethereum or Solana address and instantly see{" "}
          <span style={{ color: "var(--green)", fontWeight: 400 }}>token balances, DeFi positions, risk score, and an AI-written summary</span>{" "}
          of the wallet.
        </p>

        {/* Feature pills */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 8,
          marginTop: 20, justifyContent: "center",
        }}>
          {["ENS support", "Protocol analysis", "Risk scoring", "AI narrative", "Multi-chain"].map((f) => (
            <span key={f} style={{
              fontSize: 11, padding: "3px 11px",
              background: "rgba(6,194,217,0.08)",
              border: "0.5px solid rgba(6,194,217,0.18)",
              borderRadius: 20, color: "var(--text-3)",
              letterSpacing: "0.02em",
            }}>{f}</span>
          ))}
        </div>
      </div>

      {/* ── Input card ────────────────────────────────────────────────────────── */}
      <div style={{
        width: "100%", maxWidth: 580,
        background: "linear-gradient(135deg, rgba(12,31,52,0.97) 0%, rgba(7,22,39,0.95) 100%)",
        border: `0.5px solid ${inputFocused ? "rgba(6,194,217,0.40)" : "rgba(6,194,217,0.18)"}`,
        borderRadius: 20,
        padding: "32px 32px 28px",
        boxShadow: inputFocused
          ? "0 0 0 3px rgba(6,194,217,0.08), 0 20px 60px rgba(0,0,0,0.5)"
          : "0 20px 60px rgba(0,0,0,0.4)",
        transition: "border-color 0.25s, box-shadow 0.25s",
      }}>
        <form onSubmit={handleSubmit}>
          <label style={{
            display: "block", fontSize: 11, fontWeight: 500,
            color: "var(--text-3)", textTransform: "uppercase",
            letterSpacing: "0.10em", marginBottom: 10,
          }}>
            Ethereum · Solana · ENS
          </label>

          <div className="home-input-row" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError(""); }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="0x…, vitalik.eth, or Solana address"
              spellCheck={false}
              style={{
                flex: 1,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                padding: "11px 16px",
                border: `0.5px solid ${error ? "var(--red)" : "rgba(6,194,217,0.22)"}`,
                borderRadius: 10,
                background: "rgba(3,15,28,0.6)",
                color: "var(--text)",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "11px 22px",
                background: loading
                  ? "rgba(6,194,217,0.10)"
                  : "linear-gradient(135deg, #06C2D9 0%, #0897B0 100%)",
                color: loading ? "var(--text-3)" : "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-body)",
                transition: "all 0.2s",
                minWidth: 108,
                boxShadow: loading ? "none" : "0 0 20px rgba(6,194,217,0.30)",
                letterSpacing: "0.01em",
              }}
            >
              {loading ? loadingMsg : "Analyze →"}
            </button>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "var(--red)", margin: "4px 0 0" }}>{error}</p>
          )}
        </form>

        {/* ── Recent Searches ──────────────────────────────────────────────── */}
        {recentWallets.length > 0 && (
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: "0.5px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
                Recent
              </span>
              <button
                onClick={handleClearRecent}
                style={{ fontSize: 11, color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "var(--font-body)" }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {recentWallets.map((w) => (
                <button
                  key={w.address}
                  onClick={() => router.push(`/analysis/${w.address}`)}
                  title={w.address}
                  style={{
                    fontSize: 12, padding: "5px 12px",
                    background: "rgba(6,194,217,0.07)",
                    border: "0.5px solid rgba(6,194,217,0.18)",
                    borderRadius: 20, color: "var(--text-2)",
                    cursor: "pointer", fontFamily: "var(--font-mono)",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", gap: 5,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(6,194,217,0.14)"; e.currentTarget.style.color = "var(--green)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(6,194,217,0.07)"; e.currentTarget.style.color = "var(--text-2)"; }}
                >
                  {w.ens ? (
                    <><span style={{ color: "var(--green)", fontSize: 9 }}>◆</span>{w.ens}</>
                  ) : shortAddress(w.address)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Examples ─────────────────────────────────────────────────────── */}
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 10, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 10 }}>
            Try an example
          </p>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, WebkitOverflowScrolling: "touch" } as React.CSSProperties}>
            {EXAMPLE_WALLETS.map((w) => (
              <button
                key={w.address}
                onClick={() => loadExample(w.address)}
                style={{
                  fontSize: 12, padding: "5px 13px",
                  background: "rgba(255,255,255,0.04)",
                  border: "0.5px solid rgba(255,255,255,0.09)",
                  borderRadius: 20, color: "var(--text-2)",
                  cursor: "pointer", fontFamily: "var(--font-body)",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap", flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(6,194,217,0.10)"; e.currentTarget.style.borderColor = "rgba(6,194,217,0.25)"; e.currentTarget.style.color = "var(--text)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)"; e.currentTarget.style.color = "var(--text-2)"; }}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer caption ────────────────────────────────────────────────────── */}
      <p style={{
        position: "absolute", bottom: 24, left: 0, right: 0,
        fontSize: 12, color: "var(--text-3)", textAlign: "center",
        pointerEvents: "none",
      }}>
        Powered by Alchemy · Helius · Claude AI · CoinGecko
      </p>
    </main>
  );
}
