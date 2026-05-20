"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { AnalysisResponse } from "@/lib/types";
import { saveRecentWallet } from "@/lib/recentWallets";
import WalletHeader from "@/components/WalletHeader";
import MetricGrid from "@/components/MetricGrid";
import ProtocolChart from "@/components/ProtocolChart";
import StablecoinPanel from "@/components/StablecoinPanel";
import RiskTable from "@/components/RiskTable";
import ChainBreakdown from "@/components/ChainBreakdown";
import AIInsightCard from "@/components/AIInsightCard";
import DashboardSkeleton from "@/components/DashboardSkeleton";

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      const url = `${window.location.origin}/analysis/${address}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable — fallback to selecting text
    }
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy link to this analysis"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 13,
        color: copied ? "var(--green)" : "var(--text-2)",
        background: "none",
        border: `0.5px solid ${copied ? "var(--green)" : "var(--border-strong)"}`,
        borderRadius: 6,
        padding: "5px 12px",
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        transition: "all 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 8V2a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          Share
        </>
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

  // ── Step 1: Resolve ENS names in the URL param ───────────────────────────
  useEffect(() => {
    if (!rawParam) return;

    if (rawParam.includes(".")) {
      // ENS name in URL — resolve to hex address and redirect
      setStatusMsg("Resolving ENS…");
      fetch(`/api/ens?name=${encodeURIComponent(rawParam.toLowerCase())}`)
        .then((r) => r.json())
        .then((json) => {
          if (json.address) {
            router.replace(`/analysis/${json.address}`);
          } else {
            setError(`Could not resolve ENS name "${rawParam}"`);
            setLoading(false);
          }
        })
        .catch(() => {
          setError("Failed to resolve ENS name. Please try again.");
          setLoading(false);
        });
    } else {
      setAddress(rawParam.toLowerCase());
    }
  }, [rawParam, router]);

  // ── Step 2: Fetch analysis once we have a hex address ───────────────────
  const fetchAnalysis = useCallback(async (addr: string) => {
    setLoading(true);
    setError(null);
    setStatusMsg("Analyzing…");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Analysis failed");
        return;
      }

      const analysisData = json as AnalysisResponse;
      setData(analysisData);

      // Persist to recent searches
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
    <div
      style={{
        minHeight: "100vh",
        background: "var(--surface-3)",
        padding: "24px 16px 64px",
      }}
    >
      {/* Top nav */}
      <nav
        style={{
          maxWidth: 1080,
          margin: "0 auto 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 14,
            color: "var(--text-2)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            fontFamily: "var(--font-body)",
            flexShrink: 0,
          }}
        >
          <span>←</span> New analysis
        </button>

        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 15,
            fontWeight: 700,
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          Wallet Trace
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {data && address && <ShareButton address={address} />}
          {data && (
            <span style={{ fontSize: 12, color: "var(--text-3)", flexShrink: 0 }}>
              {(data.analysisMs / 1000).toFixed(1)}s
            </span>
          )}
          {!data && <span style={{ width: 80 }} />}
        </div>
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {loading && (
          <>
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "var(--text-3)",
                marginBottom: 16,
              }}
            >
              {statusMsg}
            </p>
            <DashboardSkeleton />
          </>
        )}

        {error && !loading && (
          <div
            style={{
              background: "var(--red-bg)",
              border: "0.5px solid var(--red)",
              borderRadius: 12,
              padding: "24px 28px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "var(--red)", fontSize: 15, margin: 0 }}>{error}</p>
            <button
              onClick={() => router.push("/")}
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "var(--red)",
                background: "none",
                border: "0.5px solid var(--red)",
                borderRadius: 6,
                padding: "6px 16px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              Try again
            </button>
          </div>
        )}

        {data && !loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Row 1: Wallet header (full width) */}
            <WalletHeader profile={data.profile} narrative={data.narrative} />

            {/* Row 2: 4 metrics */}
            <MetricGrid profile={data.profile} />

            {/* Row 3: Protocol chart + Stablecoin panel */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
              className="grid-stack"
            >
              <ProtocolChart protocols={data.profile.protocols} />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <StablecoinPanel stablecoins={data.profile.stablecoins} />
                <ChainBreakdown chains={data.profile.chains} />
              </div>
            </div>

            {/* Row 4: Risk table */}
            <RiskTable risk={data.profile.risk} />

            {/* Row 5: AI Insight (full width) */}
            <AIInsightCard narrative={data.narrative} />
          </div>
        )}
      </div>
    </div>
  );
}
