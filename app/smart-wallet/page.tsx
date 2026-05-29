"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

const EXAMPLES = [
  { label: "Coinbase Wallet user", address: "0x7838493a6522C4c1Fb6D6dF4Db4E0A08F5B4AcB2" },
  { label: "Try your own", address: "" },
];

export default function SmartWalletPage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const a = address.trim().toLowerCase();
    if (!a) { setError("Enter an Ethereum address"); return; }
    if (!/^0x[a-fA-F0-9]{40}$/.test(a)) { setError("Must be an Ethereum address (0x…)"); return; }
    setError("");
    router.push(`/smart-wallet/${a}`);
  }

  return (
    <main style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px 80px", position: "relative",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400,
        background: "radial-gradient(ellipse, rgba(34,197,94,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <button
        onClick={() => router.push("/")}
        style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", marginBottom: 40 }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #06C2D9 0%, #0897B0 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 16px rgba(6,194,217,0.35)",
        }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <path d="M10 2.5L15 8.5H11.5V17.5H8.5V8.5H5L10 2.5Z" fill="white" />
          </svg>
        </div>
        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>OnchainAI</span>
      </button>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 32, marginBottom: 10 }}>🤖</div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Smart Wallet Explorer
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0, maxWidth: 440, lineHeight: 1.6 }}>
          Is this a Coinbase Smart Wallet, Safe, or plain EOA? See paymasters, sponsored gas, UserOps, and factory — all decoded.
        </p>
      </div>

      {/* Form */}
      <div style={{
        width: "100%", maxWidth: 560,
        background: "linear-gradient(135deg, rgba(12,31,52,0.97) 0%, rgba(7,22,39,0.95) 100%)",
        border: "0.5px solid rgba(34,197,94,0.20)",
        borderRadius: 20, padding: "32px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <form onSubmit={handleSubmit}>
          <label style={{
            display: "block", fontSize: 10, fontWeight: 600,
            color: "rgba(34,197,94,0.8)", textTransform: "uppercase",
            letterSpacing: "0.10em", marginBottom: 8,
          }}>
            Base / Ethereum Address
          </label>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError(""); }}
              placeholder="0x…"
              spellCheck={false}
              style={{
                flex: 1, fontFamily: "var(--font-mono)", fontSize: 13,
                padding: "11px 16px",
                border: `0.5px solid ${error ? "var(--red)" : "rgba(34,197,94,0.30)"}`,
                borderRadius: 10,
                background: "rgba(3,15,28,0.6)", color: "var(--text)", outline: "none",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#22c55e"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--red)" : "rgba(34,197,94,0.30)"; }}
            />
            <button
              type="submit"
              style={{
                padding: "11px 20px",
                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "white", border: "none", borderRadius: 10,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "var(--font-body)",
                boxShadow: "0 0 20px rgba(34,197,94,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              Inspect →
            </button>
          </div>
          {error && <p style={{ fontSize: 12, color: "var(--red)", margin: "4px 0 0" }}>{error}</p>}
        </form>

        {/* Feature pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20 }}>
          {["ERC-4337 detection", "Paymaster decoding", "Gas sponsorship", "Factory ID"].map((f) => (
            <span key={f} style={{
              fontSize: 11, padding: "3px 10px",
              background: "rgba(34,197,94,0.07)",
              border: "0.5px solid rgba(34,197,94,0.18)",
              borderRadius: 20, color: "var(--text-3)",
            }}>{f}</span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <p style={{
        position: "absolute", bottom: 24, left: 0, right: 0,
        fontSize: 12, color: "var(--text-3)", textAlign: "center",
        pointerEvents: "none",
      }}>
        Powered by Alchemy · Helius · Claude AI · CoinGecko · DeFiLlama
      </p>
    </main>
  );
}
