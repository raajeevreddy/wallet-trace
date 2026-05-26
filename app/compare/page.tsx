"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function ComparePage() {
  const router = useRouter();
  const [addr1, setAddr1] = useState("");
  const [addr2, setAddr2] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const a = addr1.trim();
    const b = addr2.trim();
    if (!a || !b) { setError("Enter both wallet addresses"); return; }
    if (a.toLowerCase() === b.toLowerCase()) { setError("Enter two different wallets"); return; }
    setError("");
    const enc1 = encodeURIComponent(a.startsWith("0x") ? a.toLowerCase() : a);
    const enc2 = encodeURIComponent(b.startsWith("0x") ? b.toLowerCase() : b);
    router.push(`/compare/${enc1}/${enc2}`);
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px 80px",
      position: "relative",
    }}>
      {/* Glow */}
      <div style={{
        position: "absolute", top: "-15%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 400,
        background: "radial-gradient(ellipse, rgba(153,69,255,0.08) 0%, transparent 70%)",
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
        <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em" }}>
          OnchainAI
        </span>
      </button>

      {/* Heading */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Compare Two Wallets
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-3)", margin: 0, maxWidth: 420 }}>
          Risk tolerance · NFT taste · DeFi behavior · Chain preferences — head-to-head AI breakdown
        </p>
      </div>

      {/* Form */}
      <div style={{
        width: "100%", maxWidth: 580,
        background: "linear-gradient(135deg, rgba(12,31,52,0.97) 0%, rgba(7,22,39,0.95) 100%)",
        border: "0.5px solid rgba(153,69,255,0.25)",
        borderRadius: 20, padding: "32px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <WalletInput
              label="Wallet A"
              accent="#06C2D9"
              value={addr1}
              onChange={setAddr1}
              placeholder="0x… or ENS name"
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
              <span style={{ fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" }}>VS</span>
              <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
            </div>
            <WalletInput
              label="Wallet B"
              accent="#9945FF"
              value={addr2}
              onChange={setAddr2}
              placeholder="0x… or ENS name"
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "var(--red)", margin: "12px 0 0" }}>{error}</p>
          )}

          <button
            type="submit"
            style={{
              marginTop: 20, width: "100%",
              padding: "12px",
              background: "linear-gradient(135deg, #9945FF 0%, #6B21A8 100%)",
              color: "white", border: "none", borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-body)",
              boxShadow: "0 0 20px rgba(153,69,255,0.30)",
              letterSpacing: "0.01em",
            }}
          >
            Compare Wallets →
          </button>
        </form>
      </div>
    </main>
  );
}

function WalletInput({
  label, accent, value, onChange, placeholder,
}: {
  label: string;
  accent: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <label style={{
        display: "block", fontSize: 10, fontWeight: 600,
        color: accent, textTransform: "uppercase",
        letterSpacing: "0.10em", marginBottom: 7,
      }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        style={{
          width: "100%", boxSizing: "border-box",
          fontFamily: "var(--font-mono)", fontSize: 13,
          padding: "11px 16px",
          border: `0.5px solid ${accent}40`,
          borderRadius: 10,
          background: "rgba(3,15,28,0.6)",
          color: "var(--text)", outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = accent; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = `${accent}40`; }}
      />
    </div>
  );
}
