import type { WalletProfile, AIAnalysis } from "../types";
import { selectRoast, type RoastData } from "./roastLibrary";

const SYSTEM_PROMPT = `You are a savage but loveable crypto roast comedian who has memorised every on-chain transaction ever made. You roast wallets the way a great stand-up comic roasts a celebrity — brutally honest, weirdly specific, and funny enough to screenshot.

Rules:
- Reference the EXACT numbers from the data. "Your 73% stablecoin bag" hits harder than "you hold stablecoins."
- Pick ONE dominant personality quirk and go hard on it. Don't spread thin.
- Each roast must feel unique to THIS wallet. No copy-paste vibes.
- Use crypto slang naturally: ngmi, ser, fren, ape, rugged, degen, CT, wagmi, gm, LFG, paper hands, diamond hands
- Short punchy sentences. Zero corporate speak.
- Laugh WITH them, not AT them. The best roasts feel true, not mean.
- behaviorType must be a creative nickname nobody has heard before — NOT generic labels.

You always respond with valid JSON:
{
  "summary": "2-3 sentence roast that opens with a specific data point and makes them cringe-laugh",
  "behaviorType": "A fresh savage nickname specific to this wallet's dominant trait",
  "keyInsights": ["specific roast observation using real numbers", "another one", "third one"],
  "riskFlags": ["a risk called out with personality", "another"],
  "analystNote": "one closing zinger — a backhanded compliment or prediction"
}`;

function buildPrompt(profile: WalletProfile): string {
  const {
    identity,
    netWorthUsd,
    totalTransactions,
    protocols,
    stablecoins,
    chains,
    risk,
    tags,
    sophistication,
    nfts,
  } = profile;

  const topProtocols = protocols
    .sort((a, b) => b.interactionCount - a.interactionCount)
    .slice(0, 8)
    .map((p) => `${p.protocol} (${p.category}, ${p.interactionCount} interactions)`)
    .join(", ");

  const chainSummary = chains
    .map((c) => `${c.chain} ${c.percentage.toFixed(1)}%`)
    .join(", ");

  const worth = netWorthUsd >= 1_000_000
    ? `$${(netWorthUsd / 1_000_000).toFixed(2)}M`
    : `$${netWorthUsd.toLocaleString()}`;

  return `Roast this specific wallet. Be ruthlessly specific to the numbers below — do NOT write generic crypto advice.

WALLET:
- Address: ${identity.address}${identity.ens ? ` (${identity.ens})` : ""}
- Net worth: ${worth}
- Age: ${identity.walletAgeYears?.toFixed(1) ?? "unknown"} years on-chain
- Total transactions: ${totalTransactions}
- Sophistication: ${sophistication.score}/100 (${sophistication.label})
- NFTs owned: ${nfts?.totalCount ?? 0}

PERSONALITY TAGS: ${tags.join(", ") || "none"}

TOP PROTOCOLS: ${topProtocols || "hasn't touched a protocol"}

STABLECOINS: ${stablecoins.portfolioPercentage.toFixed(1)}% of portfolio ($${stablecoins.totalUsdValue.toLocaleString()})
Breakdown: ${stablecoins.breakdown.map((b) => `${b.symbol} ${b.percentage.toFixed(0)}%`).join(", ") || "none"}

CHAINS: ${chainSummary || "Ethereum only"}

RISK: overall ${risk.overallScore}/100 · concentration ${risk.concentrationRisk} · leverage ${risk.leverageIndicators} · bridges ${risk.bridgeExposure}

Write the JSON roast now. Make it feel like you personally read every single transaction.`;
}

export async function generateNarrative(
  profile: WalletProfile
): Promise<AIAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.warn("[narrator] No Anthropic API key — returning mock narrative");
    return getMockNarrative(profile);
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        temperature: 1,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(profile) }],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn("[narrator] Anthropic quota reached (429)");
        return getQuotaErrorNarrative();
      }
      const err = await response.text();
      throw new Error(`Anthropic API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as AIAnalysis;

    return parsed;
  } catch (err) {
    console.error("[narrator] generateNarrative error:", err);
    return getMockNarrative(profile);
  }
}

// ─── Quota error ─────────────────────────────────────────────────────────────

function getQuotaErrorNarrative(): AIAnalysis {
  return {
    summary: "",
    behaviorType: "",
    keyInsights: [],
    riskFlags: [],
    isQuotaError: true,
  };
}

// ─── Mock fallback — 100+ data-driven roasts via roastLibrary ────────────────

function getMockNarrative(profile: WalletProfile): AIAnalysis {
  const { stablecoins, protocols, totalTransactions, netWorthUsd, chains, identity, nfts, risk } = profile;

  const ageYears = identity.walletAgeYears ?? 0;
  const netWorthUsdNum = netWorthUsd;
  const worth = netWorthUsdNum >= 1_000_000
    ? `$${(netWorthUsdNum / 1_000_000).toFixed(1)}M`
    : netWorthUsdNum >= 1_000
    ? `$${(netWorthUsdNum / 1_000).toFixed(0)}K`
    : `$${netWorthUsdNum.toFixed(0)}`;

  const data: RoastData = {
    stablePct: stablecoins.portfolioPercentage,
    totalTx: totalTransactions,
    worth,
    netWorthUsd: netWorthUsdNum,
    ageYears,
    chainCount: chains.length,
    protocolCount: protocols.length,
    topProtocol: protocols[0]?.protocol ?? "nothing",
    nftCount: nfts?.totalCount ?? 0,
    riskScore: risk.overallScore,
    ens: identity.ens,
  };

  return selectRoast(data);
}
