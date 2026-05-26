import type { WalletProfile, WalletComparisonAnalysis } from "../types";

const SYSTEM_PROMPT = `You are a sharp crypto analyst who compares two wallets head-to-head like a sports commentator — concrete, opinionated, and entertaining.

You always respond with valid JSON:
{
  "riskTolerance": "1-2 sentences comparing how each wallet handles risk. Reference actual scores and behavior. Pick a winner.",
  "nftTaste": "1-2 sentences comparing NFT behavior — collector vs flipper vs zero interest. Reference actual NFT counts. Pick a winner.",
  "defiBehavior": "1-2 sentences comparing DeFi usage — protocols used, sophistication, leverage. Reference actual protocols. Pick a winner.",
  "chainPreferences": "1-2 sentences comparing which chains each wallet prefers and what that says about them. Reference actual chains.",
  "verdict": "2-3 sentences overall verdict — who is the smarter, more interesting, or more chaotic on-chain actor and why. Be specific."
}

Rules:
- Use real numbers from both wallets. "$12K vs $890K" is better than "different amounts".
- Always name wallet 1 as "Wallet A" and wallet 2 as "Wallet B" or use their ENS names if available.
- Be opinionated. Pick winners. Hedging is boring.
- Crypto slang welcome. Dark humour fine.`;

function buildPrompt(w1: WalletProfile, w2: WalletProfile): string {
  function summarize(p: WalletProfile, label: string): string {
    const worth =
      p.netWorthUsd >= 1_000_000
        ? `$${(p.netWorthUsd / 1_000_000).toFixed(2)}M`
        : `$${p.netWorthUsd.toLocaleString()}`;

    const topProtocols = p.protocols
      .sort((a, b) => b.interactionCount - a.interactionCount)
      .slice(0, 5)
      .map((x) => `${x.protocol}(${x.interactionCount})`)
      .join(", ");

    const chains = p.chains.map((c) => `${c.chain} ${c.percentage.toFixed(0)}%`).join(", ");

    return `
${label}: ${p.identity.ens ?? p.identity.address}
  Net worth: ${worth}
  Age: ${p.identity.walletAgeYears?.toFixed(1) ?? "?"} years
  Transactions: ${p.totalTransactions}
  NFTs: ${p.nfts?.totalCount ?? 0}
  Stablecoins: ${p.stablecoins.portfolioPercentage.toFixed(1)}%
  Protocols: ${topProtocols || "none"}
  Chains: ${chains || "ethereum only"}
  Risk score: ${p.risk.overallScore}/100 (leverage: ${p.risk.leverageIndicators}, concentration: ${p.risk.concentrationRisk})
  Sophistication: ${p.sophistication.score}/100 (${p.sophistication.label})
  DeFi supplied: $${p.defiPositions.totalSuppliedUsd.toLocaleString()} / borrowed: $${p.defiPositions.totalBorrowedUsd.toLocaleString()}`;
  }

  return `Compare these two wallets head-to-head. Be specific and pick winners.

${summarize(w1, "WALLET A")}

${summarize(w2, "WALLET B")}

Write the JSON comparison now.`;
}

// ─── Fallback ─────────────────────────────────────────────────────────────────

function buildFallbackComparison(
  w1: WalletProfile,
  w2: WalletProfile
): WalletComparisonAnalysis {
  const a = w1.identity.ens ?? "Wallet A";
  const b = w2.identity.ens ?? "Wallet B";

  const riskWinner = w1.risk.overallScore < w2.risk.overallScore ? a : b;
  const riskTolerance = `${a} scores ${w1.risk.overallScore}/100 vs ${b} at ${w2.risk.overallScore}/100. ${riskWinner} plays it safer — whether that's wisdom or cowardice depends on the market.`;

  const nftA = w1.nfts?.totalCount ?? 0;
  const nftB = w2.nfts?.totalCount ?? 0;
  const nftWinner = nftA > nftB ? a : nftB > nftA ? b : null;
  const nftTaste = nftWinner
    ? `${a} holds ${nftA} NFTs vs ${b}'s ${nftB}. ${nftWinner} is the bigger JPEG believer — the question is whether those are trophies or bags.`
    : `${a} and ${b} both have minimal NFT exposure. Neither is a collector. Both might be sane.`;

  const protoA = w1.protocols.length;
  const protoB = w2.protocols.length;
  const defiWinner = protoA > protoB ? a : protoB > protoA ? b : null;
  const defiBehavior = defiWinner
    ? `${a} has touched ${protoA} protocols vs ${b}'s ${protoB}. ${defiWinner} is the more active DeFi participant — or the one who's been rugged more times.`
    : `Both wallets show similar DeFi activity. Neither is farming yield at 3am.`;

  const chainA = w1.chains.length;
  const chainB = w2.chains.length;
  const chainWinner = chainA > chainB ? a : chainB > chainA ? b : null;
  const chainPreferences = chainWinner
    ? `${a} spans ${chainA} chains vs ${b}'s ${chainB}. ${chainWinner} is the more multi-chain nomad, chasing yield and airdrops across ecosystems.`
    : `Both wallets operate on the same number of chains. Comparable chain diversification.`;

  const worthA = w1.netWorthUsd;
  const worthB = w2.netWorthUsd;
  const formatWorth = (n: number) =>
    n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n.toFixed(0)}`;
  const verdict = `${a} holds ${formatWorth(worthA)} vs ${b}'s ${formatWorth(worthB)}. ${worthA > worthB ? a : b} is winning the portfolio war right now, but on-chain history is long and the market doesn't care about your entry price.`;

  return { riskTolerance, nftTaste, defiBehavior, chainPreferences, verdict };
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function compareWallets(
  w1: WalletProfile,
  w2: WalletProfile
): Promise<WalletComparisonAnalysis> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return buildFallbackComparison(w1, w2);
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
        max_tokens: 700,
        temperature: 1,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(w1, w2) }],
      }),
    });

    if (!response.ok) {
      console.warn(`[compareWallets] Anthropic API ${response.status} — using fallback`);
      return buildFallbackComparison(w1, w2);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned) as WalletComparisonAnalysis;
  } catch (err) {
    console.error("[compareWallets] Error:", err);
    return buildFallbackComparison(w1, w2);
  }
}
