import { NextRequest, NextResponse } from "next/server";
import { buildWalletProfile, isValidAddress } from "@/lib/orchestrator";
import { generateNarrative } from "@/lib/ai/narrator";
import type { AnalysisResponse, AnalysisError } from "@/lib/types";

export const maxDuration = 60; // Vercel function timeout

export async function POST(req: NextRequest) {
  const start = Date.now();

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

  try {
    // Build wallet profile from all data providers
    const profile = await buildWalletProfile(address);

    // Generate AI narrative
    const narrative = await generateNarrative(profile);

    const response: AnalysisResponse = {
      profile,
      narrative,
      cached: false,
      analysisMs: Date.now() - start,
    };

    return NextResponse.json(response, {
      headers: {
        // Cache at the CDN level for 1 hour
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
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
