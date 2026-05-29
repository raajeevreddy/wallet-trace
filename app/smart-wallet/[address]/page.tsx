"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { SmartWalletResponse } from "@/lib/types";
import SmartWalletView from "@/components/SmartWalletView";

export default function SmartWalletResultPage() {
  const params = useParams();
  const router = useRouter();
  const address = decodeURIComponent(params.address as string).toLowerCase();

  const [data, setData] = useState<SmartWalletResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;
    fetch("/api/smart-wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json as SmartWalletResponse);
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <div style={{ minHeight: "100vh", padding: "24px 16px 64px" }}>
      {/* Nav */}
      <nav style={{ maxWidth: 900, margin: "0 auto 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #06C2D9 0%, #0897B0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 12px rgba(6,194,217,0.35)",
          }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5L15 8.5H11.5V17.5H8.5V8.5H5L10 2.5Z" fill="white" />
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            OnchainAI
          </span>
        </button>

        <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginLeft: 4 }}>
          / smart-wallet / {address.slice(0, 10)}…
        </span>

        <button
          onClick={() => router.push("/smart-wallet")}
          style={{
            marginLeft: "auto", fontSize: 12, color: "var(--text-3)",
            background: "rgba(34,197,94,0.08)",
            border: "0.5px solid rgba(34,197,94,0.22)",
            borderRadius: 6, padding: "5px 12px",
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          ← New inspection
        </button>
      </nav>

      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        {loading && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginTop: 60, letterSpacing: "0.04em" }}>
            Decoding smart wallet on Base…
          </p>
        )}

        {error && !loading && (
          <div style={{
            background: "rgba(240,112,112,0.08)", border: "0.5px solid rgba(240,112,112,0.25)",
            borderRadius: 14, padding: "28px 32px", textAlign: "center",
          }}>
            <p style={{ color: "var(--red)", fontSize: 15, margin: 0 }}>{error}</p>
            <button
              onClick={() => router.push("/smart-wallet")}
              style={{ marginTop: 14, fontSize: 13, color: "var(--red)", background: "none", border: "0.5px solid var(--red)", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontFamily: "var(--font-body)" }}
            >
              Try again
            </button>
          </div>
        )}

        {data && !loading && <SmartWalletView data={data.data} />}
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 48, fontSize: 12, color: "var(--text-3)", textAlign: "center",
        pointerEvents: "none",
      }}>
        Powered by Alchemy · Helius · Claude AI · CoinGecko · DeFiLlama
      </p>
    </div>
  );
}
