"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { AnalysisResponse } from "@/lib/types";
import { saveRecentWallet } from "@/lib/recentWallets";
import WalletHeader from "@/components/WalletHeader";
import MetricGrid from "@/components/MetricGrid";
import TokenHoldings from "@/components/TokenHoldings";
import TransactionTimeline from "@/components/TransactionTimeline";
import ProtocolChart from "@/components/ProtocolChart";
import StablecoinPanel from "@/components/StablecoinPanel";
import RiskTable from "@/components/RiskTable";
import ChainBreakdown from "@/components/ChainBreakdown";
import AIInsightCard from "@/components/AIInsightCard";
import NftHoldings from "@/components/NftHoldings";
import DeFiPositions from "@/components/DeFiPositions";
import NetWorthChart from "@/components/NetWorthChart";
import DashboardSkeleton from "@/components/DashboardSkeleton";

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/analysis/${address}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy link to this analysis"
      style={{
        display: "flex", alignItems: "center", gap: 5,
        fontSize: 12,
        color: copied ? "var(--green)" : "var(--text-3)",
        background: copied ? "rgba(6,194,217,0.10)" : "rgba(255,255,255,0.04)",
        border: `0.5px solid ${copied ? "rgba(6,194,217,0.35)" : "rgba(255,255,255,0.10)"}`,
        borderRadius: 6, padding: "5px 12px",
        cursor: "pointer", fontFamily: "var(--font-body)",
        transition: "all 0.15s", whiteSpace: "nowrap",
      }}
    >
      {copied ? (
        <><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied!</>
      ) : (
        <><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" /><path d="M2 8V2a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>Share</>
      )}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const rawParam = params.address as string;

  const [address, setAddress] = useState<string | null>(null);
  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState("Analyzing…");

  // ── Step 1: Resolve ENS names in URL param ────────────────────────────────
  useEffect(() => {
    if (!rawParam) return;
    let cancelled = false;
    if (rawParam.includes(".")) {
      setStatusMsg("Resolving ENS…");
      fetch(`/api/ens?name=${encodeURIComponent(rawParam.toLowerCase())}`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json.address) router.replace(`/analysis/${json.address}`);
          else { setError(`Could not resolve ENS name "${rawParam}"`); setLoading(false); }
        })
        .catch(() => {
          if (cancelled) return;
          setError("Failed to resolve ENS name."); setLoading(false);
        });
    } else {
      // Ethereum addresses are case-insensitive; Solana addresses are case-sensitive base58
      setAddress(rawParam.startsWith("0x") ? rawParam.toLowerCase() : rawParam);
    }
    return () => { cancelled = true; };
  }, [rawParam, router]);

  // ── Step 2: Fetch analysis once we have a hex address ────────────────────
  const fetchAnalysis = useCallback(async (addr: string) => {
    setLoading(true); setError(null); setStatusMsg("Analyzing…");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Analysis failed"); return; }
      const analysisData = json as AnalysisResponse;
      setData(analysisData);
      saveRecentWallet(addr, analysisData.profile?.identity?.ens ?? undefined);
    } catch (err) {
      setError("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!address) return;
    fetchAnalysis(address);
  }, [address, fetchAnalysis]);

  return (
    <div className="dashboard-content" style={{ minHeight: "100vh", padding: "24px 16px 64px", position: "relative" }}>
      {/* Top nav */}
      <nav className="dashboard-nav" style={{
        maxWidth: 1080, margin: "0 auto 28px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12,
      }}>
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            fontSize: 13, color: "var(--text-3)",
            background: "none", border: "none",
            cursor: "pointer", padding: 0,
            fontFamily: "var(--font-body)",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--green)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
        >
          ← New analysis
        </button>

        {/* Wordmark */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
        }}>
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
          <span style={{
            fontFamily: "var(--font-display)", fontSize: 15,
            fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em",
          }}>
            Wallet Trace
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {data && address && <ShareButton address={address} />}
          {data && (
            <span style={{ fontSize: 11, color: "var(--text-3)" }}>
              {(data.analysisMs / 1000).toFixed(1)}s
            </span>
          )}
          {!data && <span style={{ width: 64 }} />}
        </div>
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>

        {loading && (
          <>
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginBottom: 20, letterSpacing: "0.04em" }}>
              {statusMsg}
            </p>
            <DashboardSkeleton />
          </>
        )}

        {error && !loading && (
          <div style={{
            background: "rgba(240,112,112,0.08)",
            border: "0.5px solid rgba(240,112,112,0.25)",
            borderRadius: 14, padding: "28px 32px", textAlign: "center",
          }}>
            <p style={{ color: "var(--red)", fontSize: 15, margin: 0 }}>{error}</p>
            <button
              onClick={() => router.push("/")}
              style={{
                marginTop: 14, fontSize: 13, color: "var(--red)",
                background: "none", border: "0.5px solid var(--red)",
                borderRadius: 8, padding: "7px 18px",
                cursor: "pointer", fontFamily: "var(--font-body)",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {data && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <WalletHeader profile={data.profile} narrative={data.narrative} />
            <MetricGrid profile={data.profile} />
            {/* Net worth trend chart */}
            <NetWorthChart
              history={data.profile.netWorthHistory}
              chain={data.profile.chains[0]?.chain ?? "ethereum"}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="grid-stack">
              <ProtocolChart protocols={data.profile.protocols} />
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <StablecoinPanel stablecoins={data.profile.stablecoins} />
                <ChainBreakdown chains={data.profile.chains} />
              </div>
            </div>
            {/* DeFi positions (only shown when positions exist) */}
            <DeFiPositions defi={data.profile.defiPositions} />
            {/* Token holdings + Transaction timeline */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }} className="grid-stack">
              <TokenHoldings tokens={data.profile.tokens} netWorthUsd={data.profile.netWorthUsd} />
              <TransactionTimeline transactions={data.profile.recentTransactions} walletAddress={data.profile.identity.address} chain={data.profile.chains[0]?.chain ?? "ethereum"} />
            </div>

            <NftHoldings nfts={data.profile.nfts} />
            <RiskTable risk={data.profile.risk} />
            <AIInsightCard narrative={data.narrative} />
          </div>
        )}
      </div>
    </div>
  );
}
