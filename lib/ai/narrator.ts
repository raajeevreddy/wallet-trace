import type { WalletProfile, AIAnalysis } from "../types";

const SYSTEM_PROMPT = `You are a senior blockchain intelligence analyst at an institutional crypto research firm. 
You write concise, precise, and insightful wallet analysis reports.

Your writing style:
- Analytical and authoritative, never sensational
- Uses specific data points to support conclusions
- Infers probable intent from on-chain behavior
- Avoids speculation without evidence
- Bloomberg Terminal meets plain English

You always respond with valid JSON matching this exact schema:
{
  "summary": "2-3 sentence behavioral overview",
  "behaviorType": "one short label like 'DeFi Yield Optimizer' or 'Stablecoin Treasury'",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "riskFlags": ["flag 1", "flag 2"],
  "analystNote": "one optional forward-looking observation"
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
  } = profile;

  const topProtocols = protocols
    .sort((a, b) => b.interactionCount - a.interactionCount)
    .slice(0, 8)
    .map((p) => `${p.protocol} (${p.category}, ${p.interactionCount} interactions)`)
    .join(", ");

  const chainSummary = chains
    .map((c) => `${c.chain} ${c.percentage.toFixed(1)}%`)
    .join(", ");

  return `Analyze this wallet and produce the JSON analysis:

WALLET DATA:
- Address: ${identity.address}${identity.ens ? ` (${identity.ens})` : ""}
- Net worth: $${netWorthUsd.toLocaleString()}
- Wallet age: ${identity.walletAgeYears?.toFixed(1) ?? "unknown"} years
- Total transactions: ${totalTransactions}
- Sophistication score: ${sophistication.score}/100 (${sophistication.label})

BEHAVIORAL TAGS: ${tags.join(", ")}

TOP PROTOCOLS: ${topProtocols || "No protocol data"}

STABLECOIN EXPOSURE:
- ${stablecoins.portfolioPercentage.toFixed(1)}% of portfolio in stablecoins ($${stablecoins.totalUsdValue.toLocaleString()})
- Breakdown: ${stablecoins.breakdown.map((b) => `${b.symbol} ${b.percentage.toFixed(0)}%`).join(", ")}
- Treasury-like: ${stablecoins.isTreasuryLike ? "Yes" : "No"}

CHAIN DISTRIBUTION: ${chainSummary || "Ethereum only"}

RISK SUMMARY:
- Concentration: ${risk.concentrationRisk}
- Bridge exposure: ${risk.bridgeExposure}
- Protocol diversity: ${risk.protocolDiversification}
- Leverage indicators: ${risk.leverageIndicators}
- Overall risk score: ${risk.overallScore}/100

Produce the JSON analysis now.`;
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
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(profile) }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Anthropic API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "{}";

    // Strip any accidental markdown fences
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as AIAnalysis;

    return parsed;
  } catch (err) {
    console.error("[narrator] generateNarrative error:", err);
    return getMockNarrative(profile);
  }
}

// ─── Mock fallback ────────────────────────────────────────────────────────────

function getMockNarrative(profile: WalletProfile): AIAnalysis {
  const { sophistication, stablecoins, protocols } = profile;

  const topProtocol = protocols[0]?.protocol ?? "DeFi protocols";

  if (sophistication.score >= 70) {
    return {
      summary: `This wallet exhibits sophisticated DeFi behavior with a strong bias toward yield optimization and capital preservation. The ${stablecoins.portfolioPercentage.toFixed(0)}% stablecoin allocation and heavy use of ${topProtocol} suggest deliberate treasury management rather than speculative positioning.`,
      behaviorType: "Institutional DeFi Operator",
      keyInsights: [
        `${stablecoins.portfolioPercentage.toFixed(0)}% stablecoin allocation signals capital preservation priority`,
        `Multi-chain activity across ${profile.chains.length} networks indicates sophisticated bridging strategy`,
        `${protocols.length} unique protocol interactions demonstrates deep DeFi familiarity`,
      ],
      riskFlags: [
        "Bridge exposure introduces smart contract risk across multiple chains",
        "High stablecoin concentration may limit upside during market rallies",
      ],
      analystNote:
        "Behavior resembles a crypto-native treasury or professional farming operation. Watch for Pendle and Aave position rotations as yield opportunities shift.",
    };
  }

  return {
    summary: `This wallet shows active DeFi participation with moderate sophistication. Transaction patterns suggest a retail investor gaining experience with on-chain protocols.`,
    behaviorType: "Active DeFi Participant",
    keyInsights: [
      "Regular protocol interactions indicate genuine on-chain engagement",
      "Portfolio composition reflects balanced risk approach",
    ],
    riskFlags: ["Concentration in a small number of assets elevates single-asset risk"],
    analystNote: "Early-stage DeFi user with potential to expand to more sophisticated strategies.",
  };
}
