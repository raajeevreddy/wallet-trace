"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { AnalysisResponse } from "@/lib/types";
import WalletHeader from "@/components/WalletHeader";
import MetricGrid from "@/components/MetricGrid";
import ProtocolChart from "@/components/ProtocolChart";
import StablecoinPanel from "@/components/StablecoinPanel";
import RiskTable from "@/components/RiskTable";
import ChainBreakdown from "@/components/ChainBreakdown";
import AIInsightCard from "@/components/AIInsightCard";
import DashboardSkeleton from "@/components/DashboardSkeleton";

export default function AnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const address = params.address as string;

  const [data, setData] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!address) return;

    async function fetchAnalysis() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });

        const json = await res.json();

        if (!res.ok) {
          setError(json.error ?? "Analysis failed");
          return;
        }

        setData(json as AnalysisResponse);
      } catch (err) {
        setError("Network error. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalysis();
  }, [address]);

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
        {data && (
          <span style={{ fontSize: 12, color: "var(--text-3)" }}>
            Analyzed in {(data.analysisMs / 1000).toFixed(1)}s
          </span>
        )}
        {!data && <span style={{ width: 80 }} />}
      </nav>

      {/* Main content */}
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {loading && <DashboardSkeleton />}

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
