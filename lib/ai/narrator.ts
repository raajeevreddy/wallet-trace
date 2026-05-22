import type { WalletProfile, AIAnalysis } from "../types";

const SYSTEM_PROMPT = `You are a savage but loveable crypto roast comedian who has read every on-chain transaction ever made. You roast wallets the way a comedian roasts a celebrity — brutally honest, specific, funny, and weirdly accurate. You find the most embarrassing patterns in someone's on-chain history and call them out with wit.

Your writing style:
- Punchy and irreverent — like crypto Twitter if it were actually funny
- Roast with specific data: low tx count, bag-holding, aping into memecoins, stablecoin hoarding, gas fee waste, buying tops, chasing yields that rugged
- Use crypto slang naturally: ngmi, gm, ape, rugged, paper hands, diamond hands, degen, maxi, CT, LFG, ser, fren, wagmi
- Short punchy sentences. No corporate speak whatsoever.
- Make the person feel seen — the best roasts are true
- Keep it fun, not mean-spirited. Laugh WITH them, not AT them

You always respond with valid JSON matching this exact schema:
{
  "summary": "2-3 sentence roast opener — the hook that makes them laugh and cringe",
  "behaviorType": "a savage but funny one-liner label, e.g. 'Professional Bag Holder', 'Gas Fee Philanthropist', 'Stablecoin Coward', 'Degen on Training Wheels'",
  "keyInsights": ["roast observation 1", "roast observation 2", "roast observation 3"],
  "riskFlags": ["a risk called out in roast style", "another one"],
  "analystNote": "one closing zinger or backhanded compliment"
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
      if (response.status === 429) {
        console.warn("[narrator] Anthropic quota reached (429)");
        return getQuotaErrorNarrative();
      }
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

// ─── Mock fallback ────────────────────────────────────────────────────────────

function getMockNarrative(profile: WalletProfile): AIAnalysis {
  const { sophistication, stablecoins, protocols, totalTransactions } = profile;

  const topProtocol = protocols[0]?.protocol ?? "whatever was trending that week";

  if (sophistication.score >= 70) {
    return {
      summary: `Ser, you've been around long enough to know better, yet here you are with ${stablecoins.portfolioPercentage.toFixed(0)}% in stables like you're still waiting for "the dip." ${protocols.length} protocols deep and you're farming ${topProtocol} like it's 2021. Respect the grind, question the life choices.`,
      behaviorType: "Overengineered Yield Chaser",
      keyInsights: [
        `${stablecoins.portfolioPercentage.toFixed(0)}% stablecoins — either genius market timing or absolute paralysis, no in-between`,
        `Active on ${profile.chains.length} chains — paying gas fees on all of them like it's a hobby`,
        `${protocols.length} protocol interactions — you've either found alpha or you just can't stop clicking`,
      ],
      riskFlags: [
        "Bridge exposure: you're one bad tx away from a very educational experience",
        "This much complexity means one exploit away from a humbling net worth update",
      ],
      analystNote: "Legitimately impressive or completely unhinged — the chain doesn't judge. Probably both. wagmi ser.",
    };
  }

  return {
    summary: `${totalTransactions} transactions and you're still here — respect the persistence, fren. Portfolio's giving 'bought the tutorial, skipped the strategy' energy but that's okay, everyone starts somewhere. The blockchain remembers everything though. Everything.`,
    behaviorType: "Degen on Training Wheels",
    keyInsights: [
      "Transaction history suggests learning by doing — expensive but effective",
      "Portfolio concentration is very bold of you, very bold indeed",
      `Found ${topProtocol} — now let's see if you hold through the next 80% drawdown`,
    ],
    riskFlags: ["Concentration risk: you're one bad token pick from a very character-building experience"],
    analystNote: "Early days. The wallets that make it are the ones that don't quit. gm and good luck out there.",
  };
}
