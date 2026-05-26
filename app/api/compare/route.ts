import { NextRequest, NextResponse } from "next/server";
import { buildWalletProfile, isValidAddress } from "@/lib/orchestrator";
import { generateNarrative } from "@/lib/ai/narrator";
import { compareWallets } from "@/lib/ai/compareWallets";
import type { CompareResponse, AnalysisError } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const start = Date.now();

  let body: { address1?: unknown; address2?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<AnalysisError>(
      { error: "Invalid JSON body", code: "UNKNOWN" },
      { status: 400 }
    );
  }

  if (typeof body.address1 !== "string" || typeof body.address2 !== "string") {
    return NextResponse.json<AnalysisError>(
      { error: "Both address1 and address2 are required", code: "INVALID_ADDRESS" },
      { status: 400 }
    );
  }

  const addr1 = body.address1.trim().startsWith("0x")
    ? body.address1.trim().toLowerCase()
    : body.address1.trim();
  const addr2 = body.address2.trim().startsWith("0x")
    ? body.address2.trim().toLowerCase()
    : body.address2.trim();

  if (!isValidAddress(addr1) || !isValidAddress(addr2)) {
    return NextResponse.json<AnalysisError>(
      { error: "One or both addresses are invalid", code: "INVALID_ADDRESS" },
      { status: 400 }
    );
  }

  if (addr1 === addr2) {
    return NextResponse.json<AnalysisError>(
      { error: "Enter two different wallet addresses to compare", code: "INVALID_ADDRESS" },
      { status: 400 }
    );
  }

  try {
    // Fetch both profiles in parallel
    const [profile1, profile2] = await Promise.all([
      buildWalletProfile(addr1),
      buildWalletProfile(addr2),
    ]);

    // Generate roasts + comparison in parallel
    const [narrative1, narrative2, comparison] = await Promise.all([
      generateNarrative(profile1),
      generateNarrative(profile2),
      compareWallets(profile1, profile2),
    ]);

    const response: CompareResponse = {
      wallet1: { profile: profile1, narrative: narrative1 },
      wallet2: { profile: profile2, narrative: narrative2 },
      comparison,
      analysisMs: Date.now() - start,
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
      },
    });
  } catch (err) {
    console.error("[api/compare] Error:", err);
    return NextResponse.json<AnalysisError>(
      { error: "Comparison failed. Please try again.", code: "PROVIDER_ERROR" },
      { status: 500 }
    );
  }
}
