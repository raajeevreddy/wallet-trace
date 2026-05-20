import { NextRequest, NextResponse } from "next/server";
import { buildWalletProfile, isValidAddress } from "@/lib/orchestrator";
import { generateNarrative } from "@/lib/ai/narrator";
import { getCachedAnalysis, setCachedAnalysis } from "@/lib/cache";
import { isRateLimited, getRemainingRequests } from "@/lib/rateLimit";
import type { AnalysisResponse, AnalysisError } from "@/lib/types";

export const maxDuration = 60; // Vercel function timeout

export async function POST(req: NextRequest) {
  const start = Date.now();

  // ─── Rate limiting ────────────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json<AnalysisError>(
      { error: "Too many requests. Please wait a minute and try again.", code: "RATE_LIMIT" },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }

  // ─── Parse body ───────────────────────────────────────────────────────────
  let body: { address?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<AnalysisError>(
      { error: "Invalid JSON body", code: "UNKNOWN" },
      { status: 400 }
    );
  }

  const address = body.address?.trim().toLowerCase();

  if (!address) {
    return NextResponse.json<AnalysisError>(
      { error: "Address is required", code: "INVALID_ADDRESS" },
      { status: 400 }
    );
  }

  if (!isValidAddress(address)) {
    return NextResponse.json<AnalysisError>(
      {
        error: "Invalid Ethereum address. Must be a 0x-prefixed 42-character hex string.",
        code: "INVALID_ADDRESS",
      },
      { status: 400 }
    );
  }

  // ─── Cache check ──────────────────────────────────────────────────────────
  const cached = getCachedAnalysis(address);
  if (cached) {
    return NextResponse.json(
      { ...cached, cached: true, analysisMs: Date.now() - start },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
          "X-Cache": "HIT",
          "X-Remaining-Requests": String(getRemainingRequests(ip)),
        },
      }
    );
  }

  // ─── Full analysis ────────────────────────────────────────────────────────
  try {
    const profile = await buildWalletProfile(address);
    const narrative = await generateNarrative(profile);

    const response: AnalysisResponse = {
      profile,
      narrative,
      cached: false,
      analysisMs: Date.now() - start,
    };

    setCachedAnalysis(address, response);

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-Cache": "MISS",
        "X-Remaining-Requests": String(getRemainingRequests(ip)),
      },
    });
  } catch (err) {
    console.error("[api/analyze] Unhandled error:", err);
    return NextResponse.json<AnalysisError>(
      {
        error: "Analysis failed. Please try again.",
        code: "PROVIDER_ERROR",
      },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "ok", timestamp: Date.now() });
}
