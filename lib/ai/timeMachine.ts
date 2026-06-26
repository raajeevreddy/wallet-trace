import type { WalletProfile, TimeMachineAnalysis } from "../types";

const SYSTEM_PROMPT = `You are a brutally honest on-chain historian who has read every transaction this wallet ever made. You narrate their crypto journey like a war reporter — specific, vivid, and darkly funny.

You always respond with valid JSON:
{
  "bestTrade": "1-2 sentences about their best move — specific to their portfolio, reference actual tokens or protocols they use, make it feel earned",
  "worstTrade": "1-2 sentences about their worst move — the loss, the rug, the over-leveraged disaster. Reference actual data from the wallet.",
  "biggestRegret": "1-2 sentences about the one that got away — what they sold too early, missed, or held too long past the top",
  "survivalInstincts": "1-2 sentences about how they survive bear markets — do they panic-sell, accumulate stables, go ghost, or double down"
}

Rules:
- Use EXACT numbers from the data. "$4,200" hits harder than "some ETH".
- Be specific to THIS wallet. No generic crypto platitudes.
- Keep each field to 1-2 punchy sentences max.
- Crypto slang welcome: paper hands, diamond hands, ape, rug, degen, ser, ngmi, wagmi, bags, rekt
- Dark humour is fine. Cruelty is not.`;

function buildPrompt(profile: WalletProfile): string {
  const {
    identity,
    netWorthUsd,
    totalTransactions,
    tokens,
    protocols,
    stablecoins,
    chains,
    risk,
    nfts,
    defiPositions,
  } = profile;

  const worth =
    netWorthUsd >= 1_000_000
      ? `$${(netWorthUsd / 1_000_000).toFixed(2)}M`
      : `$${netWorthUsd.toLocaleString()}`;

  const topTokens = tokens
    .filter((t) => t.usdValue > 0)
    .slice(0, 8)
    .map((t) => `${t.symbol} ($${t.usdValue.toLocaleString()})`)
    .join(", ");

  const topProtocols = protocols
    .sort((a, b) => b.interactionCount - a.interactionCount)
    .slice(0, 5)
    .map((p) => `${p.protocol} (${p.interactionCount} interactions)`)
    .join(", ");

  const chainSummary = chains
    .map((c) => `${c.chain} ${c.percentage.toFixed(0)}%`)
    .join(", ");

  const defiSummary =
    defiPositions.totalSuppliedUsd > 0 || defiPositions.totalBorrowedUsd > 0
      ? `Supplied $${defiPositions.totalSuppliedUsd.toLocaleString()}, Borrowed $${defiPositions.totalBorrowedUsd.toLocaleString()}`
      : "No open DeFi positions";

  return `Narrate the on-chain history of this wallet. Be ruthlessly specific.

WALLET:
- Address: ${identity.address}${identity.ens ? ` (${identity.ens})` : ""}
- Current net worth: ${worth}
- Wallet age: ${identity.walletAgeYears?.toFixed(1) ?? "unknown"} years
- Total transactions: ${totalTransactions}
- NFTs owned: ${nfts?.totalCount ?? 0}

CURRENT HOLDINGS: ${topTokens || "nothing of value"}

STABLECOINS: ${stablecoins.portfolioPercentage.toFixed(1)}% of portfolio ($${stablecoins.totalUsdValue.toLocaleString()})

PROTOCOLS USED: ${topProtocols || "none"}

CHAINS: ${chainSummary || "Ethereum only"}

DEFI POSITIONS: ${defiSummary}

RISK PROFILE: overall ${risk.overallScore}/100 · leverage ${risk.leverageIndicators} · concentration ${risk.concentrationRisk}

Write the JSON time machine now. Make each story feel like it actually happened to this specific wallet.`;
}

// ─── Fallback time machine using mock data ─────────────────────────────────

function buildFallbackTimeMachine(profile: WalletProfile): TimeMachineAnalysis {
  const { netWorthUsd, totalTransactions, stablecoins, tokens, protocols, nfts, identity } = profile;

  const worth =
    netWorthUsd >= 1_000_000
      ? `$${(netWorthUsd / 1_000_000).toFixed(1)}M`
      : netWorthUsd >= 1_000
      ? `$${(netWorthUsd / 1_000).toFixed(0)}K`
      : `$${netWorthUsd.toFixed(0)}`;

  const topToken = tokens.find((t) => !t.isStablecoin && t.usdValue > 0);
  const ageYears = identity.walletAgeYears ?? 0;

  const bestTrade =
    topToken && topToken.usdValue > 500
      ? `That ${topToken.symbol} position at ${worth} net worth says at least one bet paid off. The blockchain doesn't forget the good calls.`
      : `${totalTransactions} transactions and still standing — the best trade is surviving long enough to tell the story.`;

  const worstTrade =
    stablecoins.portfolioPercentage > 60
      ? `${stablecoins.portfolioPercentage.toFixed(0)}% in stablecoins. Something burned you badly enough to park the whole bag in USDC and stare at the chart.`
      : protocols.length === 0
      ? `Never touched a protocol. The worst trade is the one you didn't make — you watched everyone else ape in while you waited for "a better entry."`
      : `With ${protocols.length} protocols and ${totalTransactions} transactions, at least one of those interactions ended in a lesson. The gas fees alone are tuition.`;

  const biggestRegret =
    nfts && nfts.totalCount > 10
      ? `${nfts.totalCount} NFTs still sitting in the wallet. Some were flips that never flipped. The regret isn't buying them — it's the ones you almost sold at the top.`
      : ageYears > 3
      ? `${ageYears.toFixed(1)} years on-chain. You were early enough. The regret is whatever you sold in 2021 to "take profits" that would be worth 10x today.`
      : `You joined crypto ${ageYears.toFixed(1)} years ago. The regret is every conversation you had before that where you said "I'll look into it."`;

  const survivalInstincts =
    stablecoins.portfolioPercentage > 50
      ? `When the market bleeds, you rotate to stables and wait. ${stablecoins.portfolioPercentage.toFixed(0)}% cash position says you've been burned before and you know it.`
      : totalTransactions < 20
      ? `Low transaction count in a chaotic market means you either have extreme conviction or you went full ghost. Either way, you're still here.`
      : `${totalTransactions} transactions and a ${worth} portfolio — you survived by staying active, adapting, and not panic-selling everything at the bottom. Probably.`;

  return { bestTrade, worstTrade, biggestRegret, survivalInstincts };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateTimeMachine(
  profile: WalletProfile
): Promise<TimeMachineAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return buildFallbackTimeMachine(profile);
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
      console.warn(`[timeMachine] Anthropic API ${response.status} — using fallback`);
      return buildFallbackTimeMachine(profile);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as TimeMachineAnalysis;
    return parsed;
  } catch (err) {
    console.error("[timeMachine] Error:", err);
    return buildFallbackTimeMachine(profile);
  }
}
