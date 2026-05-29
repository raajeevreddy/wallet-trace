import type { SmartWalletProfile } from "../types";

const SYSTEM_PROMPT = `You are a sharp Web3 analyst who specialises in account abstraction and ERC-4337 smart wallets. You explain what a wallet's on-chain data reveals about how they use crypto — clear, specific, no jargon overload.

Respond in 2-3 punchy sentences. Reference the actual numbers. If the wallet has sponsored ops, say who's paying for their gas and what that implies. If it's an EOA, say so directly and explain what they're missing.`;

function buildPrompt(profile: SmartWalletProfile): string {
  const { address, isSmartWallet, isERC4337, totalUserOps, sponsoredOps, factory, factoryName, paymasters } = profile;

  if (!isERC4337 && !isSmartWallet) {
    return `Wallet ${address} is a standard EOA (externally-owned account) — no ERC-4337 UserOperations detected on Base, and no smart contract code deployed at this address. Describe what they're missing by not using a smart wallet, in 2-3 sentences. Keep it informative but a little playful.`;
  }

  const topPaymaster = paymasters[0];
  const sponsorRate = totalUserOps > 0 ? Math.round((sponsoredOps / totalUserOps) * 100) : 0;

  return `Analyse this ERC-4337 smart wallet on Base:

- Address: ${address}
- Wallet type: ${factoryName || "Smart Wallet"} (${factory || "unknown factory"})
- Total UserOperations: ${totalUserOps}
- Gas sponsored: ${sponsoredOps}/${totalUserOps} ops (${sponsorRate}%)
- Top paymaster: ${topPaymaster?.name ?? "none"} (${topPaymaster?.opsCount ?? 0} ops)
- Self-paid ops: ${profile.selfPaidOps}

Write 2-3 sentences explaining what this reveals about how they use their wallet — who's subsidising them, what the pattern means, and one sharp observation about their behaviour.`;
}

export async function generateSmartWalletNarrative(profile: SmartWalletProfile): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) return buildFallbackNarrative(profile);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        temperature: 0.8,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildPrompt(profile) }],
      }),
    });

    if (!res.ok) return buildFallbackNarrative(profile);
    const data = await res.json();
    return (data.content?.[0]?.text as string)?.trim() ?? buildFallbackNarrative(profile);
  } catch {
    return buildFallbackNarrative(profile);
  }
}

function buildFallbackNarrative(profile: SmartWalletProfile): string {
  const { isERC4337, isSmartWallet, totalUserOps, sponsoredOps, factoryName, paymasters } = profile;

  if (!isERC4337 && !isSmartWallet) {
    return "Standard EOA — no smart wallet features detected on Base. This wallet pays its own gas the old-fashioned way and hasn't tapped into account abstraction yet. Batched calls, sponsored gas, and session keys are all on the table when they're ready.";
  }

  const sponsorRate = totalUserOps > 0 ? Math.round((sponsoredOps / totalUserOps) * 100) : 0;
  const topPaymaster = paymasters[0];

  if (sponsoredOps === totalUserOps && totalUserOps > 0) {
    return `${factoryName || "Smart wallet"} user with 100% sponsored gas — ${topPaymaster?.name ?? "a paymaster"} has covered every single one of their ${totalUserOps} operations on Base. They haven't paid a wei in gas fees. Either they know exactly what they're doing, or they have no idea how good they have it.`;
  }

  if (sponsorRate > 50) {
    return `${factoryName || "Smart wallet"} with ${totalUserOps} UserOps on Base — ${sponsorRate}% gas-sponsored by ${topPaymaster?.name ?? "paymasters"}. They're using account abstraction the way it was meant to be used: letting apps pick up the tab while they focus on the transaction itself.`;
  }

  return `${factoryName || "Smart wallet"} with ${totalUserOps} UserOps on Base. ${sponsoredOps > 0 ? `${sponsoredOps} operations were gas-sponsored — ${topPaymaster?.name ?? "a paymaster"} covered those fees.` : "All operations were self-paid."} They're using ERC-4337 for the smart execution layer but haven't fully leaned into sponsored gas yet.`;
}
