import type { WalletProfile, AIAnalysis } from "../types";

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

// ─── Mock fallback — 7 data-driven archetypes ────────────────────────────────
// Picks the most dominant personality trait and roasts it specifically.

function getMockNarrative(profile: WalletProfile): AIAnalysis {
  const {
    stablecoins,
    protocols,
    totalTransactions,
    netWorthUsd,
    chains,
    identity,
    risk,
    nfts,
  } = profile;

  const ageYears = identity.walletAgeYears ?? 0;
  const stablePct = stablecoins.portfolioPercentage;
  const nftCount = nfts?.totalCount ?? 0;
  const topProtocol = protocols[0]?.protocol ?? "nothing";

  // ── Pick the most dominant archetype ─────────────────────────────────────

  // 1. Stablecoin Bunker — majority in stables
  if (stablePct > 65) {
    return {
      summary: `${stablePct.toFixed(0)}% in stablecoins. Not investing — sheltering. You've been "waiting for the bottom" so long the bottom has lapped you twice. The good news: you definitely didn't get rugged. The bad news: inflation did it for free.`,
      behaviorType: "Professional Bottom-Waiter",
      keyInsights: [
        `${stablePct.toFixed(0)}% stablecoin allocation — technically correct, historically costly`,
        `$${stablecoins.totalUsdValue.toLocaleString()} sitting in stables losing ~3% to inflation annually`,
        protocols.length > 0 ? `Uses ${topProtocol} — occasionally dips a toe in, then retreats to safety` : "Zero protocol interactions — the stables stay stabled",
      ],
      riskFlags: [
        "Inflation risk: stablecoins are just slow-motion wealth erosion",
        "Opportunity cost risk: this wallet has watched every rally from the sidelines",
      ],
      analystNote: "Technically the safest wallet here. Also technically the most boring one. At least you'll sleep well. wagmi... eventually.",
    };
  }

  // 2. Ghost Wallet — barely active
  if (totalTransactions < 15) {
    const worth = netWorthUsd >= 1000
      ? `$${(netWorthUsd / 1000).toFixed(0)}K`
      : `$${netWorthUsd.toFixed(0)}`;
    return {
      summary: `${totalTransactions} transactions. ${totalTransactions} whole transactions. This wallet has the on-chain activity of someone who bought crypto at Christmas, told everyone at dinner, and then completely forgot their seed phrase. ${worth} just sitting there, untouched, judging you.`,
      behaviorType: "Crypto Museum Exhibit",
      keyInsights: [
        `${totalTransactions} lifetime transactions — some wallets do that before breakfast`,
        "Portfolio completely static — either diamond hands or total amnesia",
        protocols.length === 0 ? "Zero protocol interactions — DeFi remains a mystery" : `Somehow found ${topProtocol} despite barely using the chain`,
      ],
      riskFlags: [
        "Key loss risk: if you forgot the seed phrase this is a very expensive ghost",
        "Inactivity risk: you are this close to being a lost wallet statistic",
      ],
      analystNote: "Maybe this is art. Maybe it's HODL taken to its logical extreme. Either way, the blockchain is patiently waiting for you to do literally anything. gm.",
    };
  }

  // 3. NFT Degen — NFT heavy
  if (nftCount > 15) {
    return {
      summary: `${nftCount} NFTs. You own ${nftCount} JPEGs, ser. At some point the question stops being "which ones will moon" and starts being "why." The good news is you clearly believe in digital ownership. The bad news is most of that collection is worth approximately one sad emoji.`,
      behaviorType: "JPEG Archaeologist",
      keyInsights: [
        `${nftCount} NFTs collected — the blockchain is basically your hard drive at this point`,
        stablePct > 20 ? `${stablePct.toFixed(0)}% in stablecoins — smart enough to keep some dry powder` : "Minimal stablecoins — all in on the JPEG thesis",
        protocols.length > 0 ? `Also uses ${topProtocol} — multitasking the degen portfolio` : "Pure NFT play, no DeFi — respect the focus",
      ],
      riskFlags: [
        "Liquidity risk: NFTs are famously easy to buy and famously hard to sell",
        "Concentration risk: JPEG portfolios can go from 'worth something' to 'worth memories' very fast",
      ],
      analystNote: `${nftCount} collections deep and still going. The conviction is real. Whether the conviction is correct is a question only 2025 can answer. LFG (carefully).`,
    };
  }

  // 4. Chain Tourist — sprawled across many chains
  if (chains.length >= 4) {
    return {
      summary: `${chains.length} chains. You're on ${chains.length} chains simultaneously because apparently one wasn't expensive enough. Bridge fees, gas fees, RPC endpoints — you've paid to enter every room in this building. Points farming or pure FOMO? Based on the chain list, probably both.`,
      behaviorType: "Omnichained Attention Deficit",
      keyInsights: [
        `Active on ${chains.length} chains — more chains than most people have streaming subscriptions`,
        `${protocols.length} protocol interactions spread thin — wide net, shallow catches`,
        risk.bridgeExposure !== "low" ? "Heavy bridge usage — you've trusted every bridge and statistically that's brave" : "Surprisingly low bridge exposure for this many chains",
      ],
      riskFlags: [
        "Bridge risk: every cross-chain tx is a trust exercise with a smart contract",
        "Complexity risk: more chains = more attack surface = more ways to have a bad day",
      ],
      analystNote: `Being on ${chains.length} chains is either a sophisticated multi-chain strategy or advanced FOMO. The p&l will decide which. wagmi on at least one of them.`,
    };
  }

  // 5. Gas Fee Philanthropist — extremely active
  if (totalTransactions > 800) {
    return {
      summary: `${totalTransactions.toLocaleString()} transactions. You have sent ${totalTransactions.toLocaleString()} transactions. Ethereum miners / validators have a shrine to you. You didn't just use this chain — you funded it. At some point "active on-chain" becomes a medical condition.`,
      behaviorType: "Ethereum Gas Benefactor",
      keyInsights: [
        `${totalTransactions.toLocaleString()} txs — at average $5 gas that's $${(totalTransactions * 5).toLocaleString()} in fees alone (minimum)`,
        `${protocols.length} protocols touched — you've seen things this wallet has seen things`,
        chains.length > 1 ? `${chains.length} chains, still not satisfied — the search continues` : "Loyal to one chain, at least — Ethereum maxi behaviour detected",
      ],
      riskFlags: [
        "Gas fee exposure: you've paid more in fees than some people's entire portfolio is worth",
        risk.leverageIndicators !== "low" ? "Leverage detected — at this activity level, one bad liquidation hits hard" : "Low leverage at least — the volume is wild but the risk is managed",
      ],
      analystNote: `${totalTransactions.toLocaleString()} transactions means you're either a power user, a bot, or you have a problem. Possibly all three. Respect regardless. gm.`,
    };
  }

  // 6. Forgotten OG — old wallet, modest outcome
  if (ageYears > 4 && netWorthUsd < 50_000) {
    return {
      summary: `${ageYears.toFixed(1)} years on-chain. You were here before most people knew what a wallet was. You've watched Bitcoin hit $69K and come back down. You've seen entire ecosystems rise and collapse. And yet here we are, with a net worth that doesn't quite match the war stories. The OG tax is real.`,
      behaviorType: "Battle-Scarred Crypto Veteran",
      keyInsights: [
        `${ageYears.toFixed(1)} years of experience — that's like 30 years in normal human time`,
        `${totalTransactions} transactions over ${ageYears.toFixed(0)} years — steady, not spectacular`,
        protocols.length > 0 ? `Found DeFi eventually — better late than never, ser` : "Old school holder — DeFi is for the youth apparently",
      ],
      riskFlags: [
        "Survivorship bias risk: being early doesn't guarantee being right the next time",
        stablePct > 40 ? "High stablecoin allocation — the scars have made you cautious" : "Low stablecoin buffer — still riding it bareback after all these years",
      ],
      analystNote: `${ageYears.toFixed(1)} years in and still here — that alone puts you in the top 1% of commitment. The P&L doesn't capture the education. wagmi old friend.`,
    };
  }

  // 7. Default — protocol active mid-tier wallet
  const worth = netWorthUsd >= 1_000_000
    ? `$${(netWorthUsd / 1_000_000).toFixed(1)}M`
    : netWorthUsd >= 1_000
    ? `$${(netWorthUsd / 1_000).toFixed(0)}K`
    : `$${netWorthUsd.toFixed(0)}`;
  return {
    summary: `${totalTransactions} transactions, ${worth} portfolio, ${protocols.length > 0 ? `${protocols.length} protocols touched` : "no protocols"}. Classic mid-tier crypto wallet energy — not a whale, not a tourist, just out here doing the thing. The blockchain has no notes, which is either fine or worrying depending on your perspective.`,
    behaviorType: "Committed Mid-Curve Participant",
    keyInsights: [
      `${worth} portfolio — not quit-your-job money yet, but not 'this was a mistake' territory either`,
      protocols.length > 0 ? `${protocols.length} protocols: ${topProtocol} leads — you've found your corner of DeFi` : "No DeFi exposure — pure holder thesis, respectable",
      `${stablePct.toFixed(0)}% in stablecoins — ${stablePct > 40 ? "cautious allocation, probably smart" : "low stable buffer, living dangerously"}`,
    ],
    riskFlags: [
      risk.concentrationRisk !== "low" ? "Concentration risk: the portfolio is putting a lot of eggs in a small number of baskets" : "Reasonable diversification — not your first rodeo",
    ],
    analystNote: "Solid wallet. Nothing insane, nothing embarrassing. The quiet ones either make it or they don't — 50/50 is actually great odds in crypto. gm fren.",
  };
}
