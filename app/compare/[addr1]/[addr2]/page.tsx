"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { CompareResponse } from "@/lib/types";
import CompareView from "@/components/CompareView";

export default function CompareResultPage() {
  const params = useParams();
  const router = useRouter();
  const addr1 = decodeURIComponent(params.addr1 as string);
  const addr2 = decodeURIComponent(params.addr2 as string);

  const [data, setData] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!addr1 || !addr2) return;
    setLoading(true);

    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address1: addr1, address2: addr2 }),
    })
      .then((r) => r.json())
      .then((json) => {
        if (json.error) setError(json.error);
        else setData(json as CompareResponse);
      })
      .catch(() => setError("Network error. Please try again."))
      .finally(() => setLoading(false));
  }, [addr1, addr2]);

  return (
    <div style={{ minHeight: "100vh", padding: "24px 16px 64px" }}>
      {/* Nav */}
      <nav style={{ maxWidth: 1080, margin: "0 auto 28px", display: "flex", alignItems: "center", gap: 12 }}>
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

        <button
          onClick={() => router.push("/compare")}
          style={{
            marginLeft: "auto",
            fontSize: 12, color: "var(--text-3)",
            background: "rgba(153,69,255,0.08)",
            border: "0.5px solid rgba(153,69,255,0.25)",
            borderRadius: 6, padding: "5px 12px",
            cursor: "pointer", fontFamily: "var(--font-body)",
          }}
        >
          ← New comparison
        </button>
      </nav>

      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {loading && (
          <p style={{ textAlign: "center", fontSize: 13, color: "var(--text-3)", marginTop: 60, letterSpacing: "0.04em" }}>
            Analyzing both wallets…
          </p>
        )}

        {error && !loading && (
          <div style={{
            background: "rgba(240,112,112,0.08)", border: "0.5px solid rgba(240,112,112,0.25)",
            borderRadius: 14, padding: "28px 32px", textAlign: "center",
          }}>
            <p style={{ color: "var(--red)", fontSize: 15, margin: 0 }}>{error}</p>
            <button
              onClick={() => router.push("/compare")}
              style={{ marginTop: 14, fontSize: 13, color: "var(--red)", background: "none", border: "0.5px solid var(--red)", borderRadius: 8, padding: "7px 18px", cursor: "pointer", fontFamily: "var(--font-body)" }}
            >
              Try again
            </button>
          </div>
        )}

        {data && !loading && <CompareView data={data} />}
      </div>
    </div>
  );
}
