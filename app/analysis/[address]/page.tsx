"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import type { AnalysisResponse, SmartWalletResponse, CompareResponse } from "@/lib/types";
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
import TimeMachine from "@/components/TimeMachine";
import SmartWalletView from "@/components/SmartWalletView";
import CompareView from "@/components/CompareView";
import DashboardSkeleton from "@/components/DashboardSkeleton";

type Tab = "portfolio" | "smart-wallet" | "compare";

// ─── Nav Search ───────────────────────────────────────────────────────────────

function NavSearch({ current }: { current?: string }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/analysis/${encodeURIComponent(q)}`);
    setValue("");
  }

  const placeholder = !focused && current ? current : "Search address or ENS…";

  return (
    <form onSubmit={handleSubmit} style={{ flex: 1, maxWidth: 420, margin: "0 16px" }}>
      <div style={{ position: "relative" }}>
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none"
          style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", opacity: 0.4 }}>
          <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input type="text" value={value} onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", boxSizing: "border-box",
            background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.10)",
            borderRadius: 8, padding: "7px 12px 7px 30px",
            fontSize: 12, color: "var(--text)", fontFamily: "var(--font-mono)",
            outline: "none", transition: "border-color 0.15s",
          }}
          onFocus={(e) => { setFocused(true); e.currentTarget.style.borderColor = "rgba(6,194,217,0.4)"; }}
          onBlur={(e) => { setFocused(false); e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; }}
        />
      </div>
    </form>
  );
}

// ─── Tweet Button ─────────────────────────────────────────────────────────────

function TweetButton({ address, data }: { address: string; data: AnalysisResponse }) {
  function handleTweet() {
    const { behaviorType } = data.narrative;
    const { netWorthUsd, risk, identity } = data.profile;
    const worth = netWorthUsd >= 1_000_000 ? `$${(netWorthUsd / 1_000_000).toFixed(1)}M`
      : netWorthUsd >= 1_000 ? `$${(netWorthUsd / 1_000).toFixed(0)}K` : `$${netWorthUsd.toFixed(0)}`;
    const display = identity.ens ?? `${address.slice(0, 6)}…${address.slice(-4)}`;
    const text = `🔥 AI just roasted my wallet\n\n"${behaviorType}"\n\n${display} · ${worth} · Risk ${risk.overallScore}/100\n\n`;
    const url = `${window.location.origin}/analysis/${address}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank", "width=560,height=400");
  }
  return (
    <button onClick={handleTweet} title="Share on X / Twitter"
      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-3)", background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.10)", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.15s", whiteSpace: "nowrap" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(29,161,242,0.12)"; e.currentTarget.style.borderColor = "rgba(29,161,242,0.35)"; e.currentTarget.style.color = "#1DA1F2"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"; e.currentTarget.style.color = "var(--text-3)"; }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
      Post
    </button>
  );
}

// ─── Share Button ─────────────────────────────────────────────────────────────

function ShareButton({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    try { await navigator.clipboard.writeText(`${window.location.origin}/analysis/${address}`); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  }
  return (
    <button onClick={handleCopy} title="Copy link"
      style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: copied ? "var(--green)" : "var(--text-3)", background: copied ? "rgba(6,194,217,0.10)" : "rgba(255,255,255,0.04)", border: `0.5px solid ${copied ? "rgba(6,194,217,0.35)" : "rgba(255,255,255,0.10)"}`, borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.15s", whiteSpace: "nowrap" }}>
      {copied ? (<><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>Copied!</>) : (<><svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" /><path d="M2 8V2a1 1 0 011-1h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>Share</>)}
    </button>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabBar({ active, onChange, isSolana }: { active: Tab; onChange: (t: Tab) => void; isSolana: boolean }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "portfolio",    label: "Portfolio",     icon: "📊" },
    { id: "smart-wallet", label: "Smart Wallet",  icon: "🤖" },
    { id: "compare",      label: "Compare",       icon: "⚔️" },
  ];

  return (
    <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "0.5px solid var(--border)", paddingBottom: 0 }}>
      {tabs.map((tab) => {
        const disabled = tab.id === "smart-wallet" && isSolana;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => !disabled && onChange(tab.id)}
            disabled={disabled}
            title={disabled ? "Smart Wallet detection is ETH/Base only" : undefined}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 18px",
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              color: isActive ? "var(--green)" : disabled ? "var(--text-3)" : "var(--text-2)",
              background: "none", border: "none",
              borderBottom: `2px solid ${isActive ? "var(--green)" : "transparent"}`,
              marginBottom: -1,
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.4 : 1,
              transition: "all 0.15s",
              fontFamily: "var(--font-body)",
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Inline Compare ───────────────────────────────────────────────────────────

function InlineCompare({ address }: { address: string }) {
  const [addr2, setAddr2] = useState("");
  const [compareData, setCompareData] = useState<CompareResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    const b = addr2.trim().toLowerCase();
    if (!b) { setError("Enter a second wallet address"); return; }
    if (b === address.toLowerCase()) { setError("Enter a different wallet"); return; }
    setError(""); setLoading(true); setCompareData(null);
    try {
      const res = await fetch("/api/compare", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address1: address, address2: b }),
      });
      const json = await res.json();
      if (json.error) setError(json.error);
      else setCompareData(json as CompareResponse);
    } catch { setError("Network error. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Input */}
      <div style={{ background: "var(--surface)", border: "0.5px solid rgba(153,69,255,0.25)", borderRadius: 14, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 3, height: 18, borderRadius: 2, background: "rgba(153,69,255,0.7)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(153,69,255,0.9)", textTransform: "uppercase", letterSpacing: "0.10em" }}>
            Compare with another wallet
          </span>
        </div>
        <form onSubmit={handleCompare} style={{ display: "flex", gap: 8 }}>
          <input
            type="text" value={addr2} onChange={(e) => { setAddr2(e.target.value); setError(""); }}
            placeholder="0x… or ENS name" spellCheck={false}
            style={{ flex: 1, fontFamily: "var(--font-mono)", fontSize: 13, padding: "10px 14px", border: `0.5px solid ${error ? "var(--red)" : "rgba(153,69,255,0.30)"}`, borderRadius: 10, background: "rgba(3,15,28,0.6)", color: "var(--text)", outline: "none" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#9945FF"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = error ? "var(--red)" : "rgba(153,69,255,0.30)"; }}
          />
          <button type="submit" disabled={loading}
            style={{ padding: "10px 20px", background: loading ? "rgba(153,69,255,0.10)" : "linear-gradient(135deg, #9945FF 0%, #6B21A8 100%)", color: loading ? "var(--text-3)" : "white", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", whiteSpace: "nowrap" }}>
            {loading ? "Comparing…" : "Compare →"}
          </button>
        </form>
        {error && <p style={{ fontSize: 12, color: "var(--red)", margin: "8px 0 0" }}>{error}</p>}
      </div>

      {compareData && <CompareView data={compareData} />}
    </div>
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
  const [activeTab, setActiveTab] = useState<Tab>("portfolio");

  // Smart Wallet tab — lazy loaded
  const [swData, setSwData] = useState<SmartWalletResponse | null>(null);
  const [swLoading, setSwLoading] = useState(false);
  const [swError, setSwError] = useState<string | null>(null);

  const isSolana = address ? !/^0x/.test(address) : false;

  // ── ENS resolution ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!rawParam) return;
    let cancelled = false;
    const decoded = decodeURIComponent(rawParam);
    if (decoded.includes(".")) {
      setStatusMsg("Resolving ENS…");
      fetch(`/api/ens?name=${encodeURIComponent(decoded.toLowerCase())}`)
        .then((r) => r.json())
        .then((json) => {
          if (cancelled) return;
          if (json.address) setAddress(json.address.toLowerCase());
          else { setError(`Could not resolve ENS name "${decoded}"`); setLoading(false); }
        })
        .catch(() => { if (cancelled) return; setError("Failed to resolve ENS name."); setLoading(false); });
    } else {
      setAddress(rawParam.startsWith("0x") ? rawParam.toLowerCase() : rawParam);
    }
    return () => { cancelled = true; };
  }, [rawParam]);

  // ── Main analysis ────────────────────────────────────────────────────────
  const fetchAnalysis = useCallback(async (addr: string) => {
    setLoading(true); setError(null); setStatusMsg("Analyzing…");
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address: addr }) });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? "Analysis failed"); return; }
      setData(json as AnalysisResponse);
      saveRecentWallet(addr, (json as AnalysisResponse).profile?.identity?.ens ?? undefined);
    } catch (err) { setError("Network error. Please try again."); console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (address) fetchAnalysis(address); }, [address, fetchAnalysis]);

  // ── Smart Wallet — lazy fetch on tab click ────────────────────────────────
  useEffect(() => {
    if (activeTab !== "smart-wallet" || !address || isSolana || swData || swLoading) return;
    setSwLoading(true); setSwError(null);
    fetch("/api/smart-wallet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ address }) })
      .then((r) => r.json())
      .then((json) => { if (json.error) setSwError(json.error); else setSwData(json as SmartWalletResponse); })
      .catch(() => setSwError("Network error. Please try again."))
      .finally(() => setSwLoading(false));
  }, [activeTab, address, isSolana, swData, swLoading]);

  return (
    <div className="dashboard-content" style={{ minHeight: "100vh", padding: "24px 16px 64px", position: "relative" }}>
      {/* Nav */}
      <nav className="dashboard-nav" style={{ maxWidth: 1080, margin: "0 auto 28px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => router.push("/")}
          style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #06C2D9 0%, #0897B0 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(6,194,217,0.35)" }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L15 8.5H11.5V17.5H8.5V8.5H5L10 2.5Z" fill="white" /></svg>
          </div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>OnchainAI</span>
        </button>

        <NavSearch />

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {data && address && <TweetButton address={address} data={data} />}
          {data && address && <ShareButton address={address} />}
        </div>
      </nav>

      {/* Main */}
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {loading && (
          <>
            <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginBottom: 20, letterSpacing: "0.04em" }}>{statusMsg}</p>
            <DashboardSkeleton />
          </>
        )}

        {error && !loading && (
          <div style={{ background: "rgba(240,112,112,0.08)", border: "0.5px solid rgba(240,112,112,0.25)", borderRadius: 14, padding: "28px 32px", textAlign: "center" }}>
            <p style={{ color: "var(--red)", fontSize: 15, margin: 0 }}>{error}</p>
            <button onClick={() => router.push("/")} style={{ marginTop: 14, fontSize: 13, color: "var(--red)", background: "none", border: "0.5px solid var(--red)", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontFamily: "var(--font-body)" }}>
              Try again
            </button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Always visible header + metrics */}
            <WalletHeader profile={data.profile} narrative={data.narrative} />
            <div style={{ marginTop: 18 }}>
              <MetricGrid profile={data.profile} />
            </div>

            {/* Tabs */}
            <div style={{ marginTop: 24 }}>
              <TabBar active={activeTab} onChange={setActiveTab} isSolana={isSolana} />

              {/* ── Portfolio tab ── */}
              {activeTab === "portfolio" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <RiskTable risk={data.profile.risk} />
                  <AIInsightCard narrative={data.narrative} />
                  <TimeMachine timeMachine={data.timeMachine} />
                  <NetWorthChart history={data.profile.netWorthHistory} chain={data.profile.chains[0]?.chain ?? "ethereum"} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }} className="grid-stack">
                    <ProtocolChart protocols={data.profile.protocols} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <StablecoinPanel stablecoins={data.profile.stablecoins} />
                      <ChainBreakdown chains={data.profile.chains} />
                    </div>
                  </div>
                  <DeFiPositions defi={data.profile.defiPositions} />
                  <TokenHoldings tokens={data.profile.tokens} netWorthUsd={data.profile.netWorthUsd} />
                  <NftHoldings nfts={data.profile.nfts} />
                  <TransactionTimeline transactions={data.profile.recentTransactions} walletAddress={data.profile.identity.address} chain={data.profile.chains[0]?.chain ?? "ethereum"} />
                </div>
              )}

              {/* ── Smart Wallet tab ── */}
              {activeTab === "smart-wallet" && (
                <div>
                  {swLoading && <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginTop: 40 }}>Decoding smart wallet on Base…</p>}
                  {swError && <p style={{ textAlign: "center", fontSize: 13, color: "var(--red)", marginTop: 40 }}>{swError}</p>}
                  {swData && <SmartWalletView data={swData.data} />}
                </div>
              )}

              {/* ── Compare tab ── */}
              {activeTab === "compare" && address && (
                <InlineCompare address={address} />
              )}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 48, fontSize: 12, color: "var(--text-3)", textAlign: "center", pointerEvents: "none" }}>
        Powered by Alchemy · Helius · Claude AI · CoinGecko · DeFiLlama
      </p>
    </div>
  );
}
