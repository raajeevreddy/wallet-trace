import { NextRequest, NextResponse } from "next/server";
import { isValidAddress } from "@/lib/orchestrator";
import { analyzeSmartWallet } from "@/lib/providers/erc4337";
import { generateSmartWalletNarrative } from "@/lib/ai/smartWalletNarrator";
import type { SmartWalletResponse, AnalysisError } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const start = Date.now();

  let body: { address?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<AnalysisError>(
      { error: "Invalid JSON body", code: "UNKNOWN" },
      { status: 400 }
    );
  }

  if (typeof body.address !== "string") {
    return NextResponse.json<AnalysisError>(
      { error: "address is required", code: "INVALID_ADDRESS" },
      { status: 400 }
    );
  }

  const address = body.address.trim().toLowerCase();

  if (!address.startsWith("0x") || !isValidAddress(address)) {
    return NextResponse.json<AnalysisError>(
      { error: "Must be an Ethereum address (0x…) — Solana wallets are EOAs by definition", code: "INVALID_ADDRESS" },
      { status: 400 }
    );
  }

  try {
    const profile = await analyzeSmartWallet(address);
    profile.narrative = await generateSmartWalletNarrative(profile);

    const response: SmartWalletResponse = {
      data: profile,
      analysisMs: Date.now() - start,
    };

    return NextResponse.json(response, {
      headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" },
    });
  } catch (err) {
    console.error("[api/smart-wallet] Error:", err);
    return NextResponse.json<AnalysisError>(
      { error: "Analysis failed. Please try again.", code: "PROVIDER_ERROR" },
      { status: 500 }
    );
  }
}
