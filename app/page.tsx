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
  { label: "DeFi Whale", address: "0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE" },
];

function looksLikeENS(input: string): boolean {
  return input.includes(".") && !input.startsWith("0x");
}

export default function HomePage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Analyzing…");
  const [recentWallets, setRecentWallets] = useState<RecentWallet[]>([]);

  // Load recent wallets after mount (localStorage is not available during SSR)
  useEffect(() => {
    setRecentWallets(getRecentWallets());
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = address.trim();

    if (!trimmed) {
      setError("Please enter a wallet address or ENS name");
      return;
    }

    setError("");
    setLoading(true);

    // ── ENS resolution ──────────────────────────────────────────────────────
    if (looksLikeENS(trimmed)) {
      setLoadingMsg("Resolving ENS…");
      try {
        const res = await fetch(
          `/api/ens?name=${encodeURIComponent(trimmed.toLowerCase())}`
        );
        const json = await res.json();

        if (!res.ok || !json.address) {
          setError(json.error ?? `Could not resolve "${trimmed}"`);
          setLoading(false);
          return;
        }

        router.push(`/analysis/${json.address}`);
        return;
      } catch {
        setError("Network error resolving ENS name. Please try again.");
        setLoading(false);
        return;
      }
    }

    // ── Hex address ─────────────────────────────────────────────────────────
    if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
      setError("Enter a valid Ethereum address (0x…) or ENS name (e.g. vitalik.eth)");
      setLoading(false);
      return;
    }

    setLoadingMsg("Analyzing…");
    router.push(`/analysis/${trimmed.toLowerCase()}`);
  }

  function loadExample(addr: string) {
    setAddress(addr);
    setError("");
  }

  function handleClearRecent() {
    clearRecentWallets();
    setRecentWallets([]);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        background: "var(--surface-3)",
      }}
    >
      {/* Logo / wordmark */}
      <div style={{ marginBottom: 48, textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M9 2L14 7H10V16H8V7H4L9 2Z" fill="white" />
            </svg>
          </div>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            Wallet Trace
          </span>
        </div>
        <p
          style={{
            fontSize: 16,
            color: "var(--text-2)",
            maxWidth: 420,
            lineHeight: 1.6,
            margin: "0 auto",
          }}
        >
          Paste any Ethereum wallet address or ENS name. Get institutional-grade AI analysis in seconds.
        </p>
      </div>

      {/* Input card */}
      <div
        style={{
          background: "var(--surface)",
          border: "0.5px solid var(--border-strong)",
          borderRadius: 16,
          padding: "32px 32px 28px",
          width: "100%",
          maxWidth: 560,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}
      >
        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              fontWeight: 500,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Wallet Address or ENS Name
          </label>
          <div className="home-input-row" style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input
              type="text"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError(""); }}
              placeholder="0x… or vitalik.eth"
              spellCheck={false}
              style={{
                flex: 1,
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                padding: "10px 14px",
                border: `0.5px solid ${error ? "var(--red)" : "var(--border-strong)"}`,
                borderRadius: 8,
                background: "var(--surface-2)",
                color: "var(--text)",
                outline: "none",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--green)")}
              onBlur={(e) => (e.target.style.borderColor = error ? "var(--red)" : "var(--border-strong)")}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                background: loading ? "var(--surface-3)" : "var(--green)",
                color: loading ? "var(--text-3)" : "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-body)",
                transition: "background 0.15s",
                minWidth: 100,
              }}
            >
              {loading ? loadingMsg : "Analyze →"}
            </button>
          </div>
          {error && (
            <p style={{ fontSize: 12, color: "var(--red)", margin: "4px 0 0" }}>{error}</p>
          )}
        </form>

        {/* Recent Searches */}
        {recentWallets.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  color: "var(--text-3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  margin: 0,
                }}
              >
                Recent
              </p>
              <button
                onClick={handleClearRecent}
                style={{
                  fontSize: 11,
                  color: "var(--text-3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "var(--font-body)",
                }}
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
                    fontSize: 12,
                    padding: "5px 12px",
                    background: "var(--surface-2)",
                    border: "0.5px solid var(--border)",
                    borderRadius: 20,
                    color: "var(--text-2)",
                    cursor: "pointer",
                    fontFamily: "var(--font-mono)",
                    transition: "background 0.1s",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "var(--surface-2)")
                  }
                >
                  {w.ens ? (
                    <>
                      <span style={{ color: "var(--green)", fontSize: 10 }}>◆</span>
                      {w.ens}
                    </>
                  ) : (
                    shortAddress(w.address)
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Examples */}
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontSize: 11,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Try an example
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {EXAMPLE_WALLETS.map((w) => (
              <button
                key={w.address}
                onClick={() => loadExample(w.address)}
                style={{
                  fontSize: 12,
                  padding: "5px 12px",
                  background: "var(--surface-2)",
                  border: "0.5px solid var(--border)",
                  borderRadius: 20,
                  color: "var(--text-2)",
                  cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface-3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--surface-2)")
                }
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 32,
          justifyContent: "center",
          maxWidth: 560,
        }}
      >
        {[
          "ENS support",
          "Protocol analysis",
          "Risk scoring",
          "Stablecoin exposure",
          "AI narrative",
          "Multi-chain",
        ].map((f) => (
          <span
            key={f}
            style={{
              fontSize: 12,
              padding: "4px 12px",
              background: "var(--surface)",
              border: "0.5px solid var(--border)",
              borderRadius: 20,
              color: "var(--text-3)",
            }}
          >
            {f}
          </span>
        ))}
      </div>
    </main>
  );
}
