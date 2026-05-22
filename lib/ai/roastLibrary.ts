import type { AIAnalysis } from "../types";

export interface RoastData {
  stablePct: number;
  totalTx: number;
  worth: string;
  netWorthUsd: number;
  ageYears: number;
  chainCount: number;
  protocolCount: number;
  topProtocol: string;
  nftCount: number;
  riskScore: number;
  ens?: string;
}

type RoastFn = (d: RoastData) => AIAnalysis;

// ─── Stablecoin Bunker (stablePct > 65) — 16 roasts ─────────────────────────

export const stablecoinRoasts: RoastFn[] = [
  (d) => ({
    behaviorType: "Professional Bottom-Waiter",
    summary: `${d.stablePct.toFixed(0)}% in stablecoins. You've been "waiting for the bottom" so long the bottom has lapped you twice. The market crashed, recovered, crashed again, and you sat in USDC the entire time like a champ.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% stablecoin allocation — historically accurate, historically costly`, `${d.worth} in purchasing power, slowly being eaten by inflation`, `${d.protocolCount > 0 ? `Uses ${d.topProtocol} occasionally — dips a toe in, retreats to safety` : "Zero protocol interactions — the stables stay stabled"}`],
    riskFlags: ["Inflation risk: stablecoins lose ~3% annually to USD inflation", "Opportunity cost risk: every rally happened without you"],
    analystNote: "Technically the safest wallet in the room. Also technically the one that missed the most. wagmi... eventually.",
  }),
  (d) => ({
    behaviorType: "USD Coin Maximalist",
    summary: `${d.stablePct.toFixed(0)}% stablecoins, ${d.worth} net worth, ${d.totalTx} transactions. You came to crypto and immediately decided the best crypto is the one that doesn't move. Bold strategy. The banks you were escaping offer the same yield with fewer existential crises.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% of the portfolio does absolutely nothing exciting`, "Transaction history shows someone who entered the arena and immediately sat down", `${d.protocolCount} protocols touched — ${d.protocolCount === 0 ? "none, you're pure stable" : "a few dips into DeFi but always back to safety"}`],
    riskFlags: ["Depeg risk: USDC depegged to $0.87 in 2023 — stablecoins aren't risk-free", "Inflation silently extracts value 24/7"],
    analystNote: "There is a version of this story where you're a genius who bought the absolute bottom. We're just not there yet. gm.",
  }),
  (d) => ({
    behaviorType: "Certified Dip Awaiter",
    summary: `Ah yes, the classic "${d.stablePct.toFixed(0)}% stablecoins, waiting for the real dip" wallet. News flash: the dip you're waiting for already happened. Multiple times. You missed all of them by being perfectly prepared for the next one.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% in stables — the portfolio of someone who read "be fearful when others are greedy" and interpreted it as "never buy anything"`, "Maximum liquidity, minimum participation", `${d.ageYears.toFixed(1)} years on-chain perfecting the art of not acting`],
    riskFlags: ["Paralysis risk: too much dry powder with no trigger to deploy it", "The perfect entry price does not exist and this wallet is proof"],
    analystNote: "Your patience is admirable. Your execution is a work in progress. LFG (whenever you're ready, no rush, take your time).",
  }),
  (d) => ({
    behaviorType: "USDC Safety Blanket Holder",
    summary: `${d.worth} wallet, ${d.stablePct.toFixed(0)}% of it doing the financial equivalent of sitting in a chair. You found crypto, got scared, and decided to participate by not participating. The blockchain respects your caution. The bull market does not.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% stablecoin allocation is more conservative than most hedge funds`, "Technically on-chain, spiritually still in a savings account", `${d.totalTx} transactions — most of them probably swapping into stables`],
    riskFlags: [`Yield risk: earning nothing on ${d.worth} when DeFi yields exist is a choice`, "Recency bias: last bear market trained this wallet to never buy again"],
    analystNote: "The discipline here is real. The returns are theoretical. One day you'll deploy it all at the exact wrong time and it'll be beautiful. wagmi.",
  }),
  (d) => ({
    behaviorType: "Perpetual Safe Harbor Resident",
    summary: `${d.stablePct.toFixed(0)}% stablecoins. You've essentially built a savings account on a blockchain that charges gas fees. Creative. The traditional banking system you were escaping has the same yield and doesn't require you to remember a seed phrase.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% in stables — technically correct, practically boring`, `${d.protocolCount === 0 ? "No DeFi exposure — a whole ecosystem of yield and you chose none of it" : `${d.protocolCount} protocols touched but the stable pile keeps growing`}`, `At ${d.ageYears.toFixed(1)} years old this wallet has seen multiple bull runs from the bench`],
    riskFlags: ["Smart contract risk on the stablecoin itself (USDC is custodied by Circle)", `Missing compounding: ${d.worth} in Aave earns something; ${d.worth} in a wallet earns nothing`],
    analystNote: `You're one market fear event away from being a genius and one bull run away from regret. Coin flip with ${d.worth} on the line. Respect.`,
  }),
  (d) => ({
    behaviorType: "Stablecoin Sommelier",
    summary: `You've carefully curated ${d.stablePct.toFixed(0)}% of your portfolio in stablecoins like a fine wine collection that never appreciates. The sophistication with which you hold nothing-coins is genuinely impressive. ${d.worth} in extremely stable poverty.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% stablecoins — diversified across the pegged assets as if that's diversification`, `${d.totalTx} transactions documenting the journey to maximum stableness`, "Exceptional risk management: no gains, also no losses"],
    riskFlags: [`Inflation erosion: that ${d.worth} buys less every year it sits still`, "FOMO risk: one too many green candles and this all deploys at the top"],
    analystNote: "The most organised way to do nothing in crypto. There's artistry in the commitment. gm fren, the bottom is always just one more dip away.",
  }),
  (d) => ({
    behaviorType: "Fear Index Personified",
    summary: `When Buffett said "be fearful when others are greedy," he did not mean "keep ${d.stablePct.toFixed(0)}% in USDC forever." The crypto fear & greed index could read 0 and you'd still want a bit more stable before deploying. We get it. The market is scary. Also it went up 300% while you waited.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% stablecoins — this is what maximum caution looks like at scale`, `Net worth: ${d.worth} — could be more, could be the same, definitely not less`, `${d.protocolCount} protocols used — ${d.protocolCount < 3 ? "barely dipped in, mostly spectating" : "more active than the stable pile suggests"}`],
    riskFlags: ["Psychological risk: once you miss enough rallies, you stop trying to catch them", "Liquidity trap: so much dry powder it starts to feel permanent"],
    analystNote: "You're not wrong, you're just early to deploying. By about 3 bull runs. LFG whenever you're ready ser.",
  }),
  (d) => ({
    behaviorType: "Liquid Courage Hoarder",
    summary: `${d.stablePct.toFixed(0)}% in stables and ${d.totalTx} transactions to get here. You have accumulated maximum liquidity and minimum conviction. The funny thing about dry powder is it only works if you shoot it. ${d.worth} loaded, safety permanently on.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% — not invested, not resting, just... waiting`, `${d.ageYears.toFixed(1)} years of waiting, wallet still ${d.stablePct.toFixed(0)}% stable`, "The entry you're waiting for has a lower probability of existing every day"],
    riskFlags: ["Decision paralysis: every month in stables is a month where the thesis has to prove itself", "The number that feels like the right entry keeps moving up"],
    analystNote: "Maximum optionality, minimum action. In another timeline you timed it perfectly. wagmi in the multiverse.",
  }),
  (d) => ({
    behaviorType: "Deflation Chaser (Ironic)",
    summary: `Here's what's wild: you came to a deflationary asset class and parked ${d.stablePct.toFixed(0)}% in inflationary ones. You escaped USD, sort of, then immediately held USD-pegged tokens. The circle of financial life.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% exposure to the thing crypto was supposed to replace`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols found — the rest of the portfolio is less interesting` : "No DeFi activity — full commitment to the stable thesis"}`, `${d.worth} total — enough to matter, not enough to ignore the inflation math`],
    riskFlags: ["Ideological risk: if you're here to escape fiat, the stablecoins are not helping", "Yield ignorance: same stablecoins in Aave earn 4-8%, sitting idle earn 0"],
    analystNote: "The bank you were escaping charges you nothing to hold cash either. At least you saved on gas fees. gm.",
  }),
  (d) => ({
    behaviorType: "Aggressive Sideline Observer",
    summary: `${d.stablePct.toFixed(0)}% stables, ${d.worth} net worth, actively doing nothing. You watch the market like a hawk, check prices daily, have strong opinions about every token — and keep ${d.stablePct.toFixed(0)}% in USDC anyway. The information-to-action ratio here is spectacular.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% stablecoins — the portfolio of someone who knows everything and does nothing`, `${d.totalTx} transactions — most of them probably just moving the stables around`, "Extreme conviction in the value of optionality"],
    riskFlags: ["Analysis paralysis: more data hasn't helped deploy the capital", "Timing risk: trying to time the market is a known destroyer of returns"],
    analystNote: "You've done the research. Now do the thing. Or don't. The stables will still be there. Probably. wagmi.",
  }),
  (d) => ({
    behaviorType: "USDT Supremacist",
    summary: `${d.stablePct.toFixed(0)}% in stablecoins. Crypto's most elaborate way to hold dollars. Ethereum gas fees paid. Wallet set up. Seed phrase memorised. And the result is: a slightly more complicated bank account. Chapeau, ser.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% — the percentage of the portfolio that refuses to take risks`, `${d.totalTx} lifetime transactions all leading here`, `${d.ageYears.toFixed(1)} years to reach this level of caution`],
    riskFlags: ["Complexity without returns: all the blockchain risk, none of the blockchain upside", "Tether audit risk: USDT's reserves are still a mystery wrapped in an enigma"],
    analystNote: "In a world where everything goes to zero, this wallet wins. In a world where crypto goes up, less so. Place your bets. gm.",
  }),
  (d) => ({
    behaviorType: "Macro Bear on-chain",
    summary: `${d.stablePct.toFixed(0)}% stablecoins means you have a view — and the view is bearish, perpetually. Every tweet you read confirmed the crash was coming. The crash came. It went. You stayed stable. Another crash is definitely coming. You'll be ready this time.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% in stables — a portfolio expressing maximum macro pessimism`, "Technically correct bear thesis, incorrectly timed across multiple cycles", `${d.protocolCount} protocols: ${d.protocolCount === 0 ? "none — not even trying" : "a few — you tried, then retreated"}`],
    riskFlags: ["Perpetual bear risk: markets can stay irrational longer than you can stay in stables", "Missing the bounce is as damaging as catching the dump"],
    analystNote: "The crash is coming. It always is. The question is whether it comes before or after the 10x. Good luck timing that. LFG (or not, your call).",
  }),
  (d) => ({
    behaviorType: "Crypto Savings Account (No Interest)",
    summary: `Congratulations: you've built a savings account on a blockchain that costs gas to access and runs on electricity. The innovation here is taking something simple and making it complicated for the same result. ${d.stablePct.toFixed(0)}% stablecoins, ${d.worth}, earning approximately nothing.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% stablecoins: same as a Chase savings account, but cooler to say`, `${d.totalTx} transactions to achieve the equivalent of opening a bank account`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols touched — occasionally remembers this is crypto` : "Zero protocols — maximally committed to the boring path"}`],
    riskFlags: ["Gas fees: you're literally paying to hold a dollar", "Opportunity cost is doing overtime every bull run"],
    analystNote: "High innovation, low returns. The spirit of crypto lives here somewhere. Maybe under all the USDC. gm.",
  }),
  (d) => ({
    behaviorType: "Infinite Patience Mode",
    summary: `${d.stablePct.toFixed(0)}% stablecoins, and at ${d.ageYears.toFixed(1)} years old, this wallet has outlasted multiple market cycles without deploying. The patience is monk-level. The opportunity cost is also monk-level. Still, technically correct is the best kind of correct.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% — held through every dip, every pump, every shakeout, still in stables`, `${d.ageYears.toFixed(1)} years of resistance to buying literally anything`, "The conviction is real; the thesis is 'wait for better prices'"],
    riskFlags: ["Recency risk: the stablecoin habit is now the default state", "There is no price low enough that will feel 'safe enough' to this wallet"],
    analystNote: "Buddhism teaches non-attachment. This wallet has achieved it financially. Respect. Also: LFG sometime before the next halving, ser.",
  }),
  (d) => ({
    behaviorType: "Pre-Entry Specialist",
    summary: `You are ${d.stablePct.toFixed(0)}% ready to enter the market. You have been ${d.stablePct.toFixed(0)}% ready for what appears to be ${d.ageYears.toFixed(1)} years. The entry is coming. It's always coming. The market waits for no wallet, unfortunately.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% stablecoins = ${d.stablePct.toFixed(0)}% dry powder = 0% deployed`, `${d.totalTx} transactions of build-up, no deployment`, "This much preparation deserves an entry that will never feel good enough"],
    riskFlags: ["The longer you wait, the higher the psychological barrier to entry", "FOMO-driven deployment risk: eventually you'll snap and buy the top"],
    analystNote: "The perfect entry is a myth and you're living proof. At some point done beats perfect. Maybe. wagmi either way.",
  }),
  (d) => ({
    behaviorType: "Stablecoin Philosopher",
    summary: `If a wallet holds ${d.stablePct.toFixed(0)}% stablecoins and nobody deploys it, does it make gains? Deep question. You've had ${d.ageYears.toFixed(1)} years to think about it. The ${d.worth} still hasn't moved. The philosophy continues.`,
    keyInsights: [`${d.stablePct.toFixed(0)}% in the asset that goes sideways by design`, "Philosophical commitment to optionality over returns", `${d.protocolCount === 0 ? "No protocols — pure ideological stable holder" : `${d.protocolCount} protocols tried — the stables called them back`}`],
    riskFlags: ["Existential risk: what is this wallet FOR if not to be deployed", "Time value of money is real and it's eating this portfolio slowly"],
    analystNote: "Descartes said 'I think therefore I am.' This wallet says 'I hold stables therefore I am safe.' Both are debatable. gm.",
  }),
];

// ─── Ghost Wallet (totalTx < 15) — 14 roasts ────────────────────────────────

export const ghostRoasts: RoastFn[] = [
  (d) => ({
    behaviorType: "Crypto Museum Exhibit",
    summary: `${d.totalTx} transactions. ${d.totalTx} whole transactions over ${d.ageYears.toFixed(1)} years. This wallet has the on-chain activity of someone who bought crypto at a Christmas party, told everyone, and then completely forgot their seed phrase.`,
    keyInsights: [`${d.totalTx} lifetime transactions — some wallets do that before breakfast`, "Portfolio static: either diamond hands or total amnesia, hard to tell", `${d.worth} sitting untouched — either a monument to conviction or evidence of a lost password`],
    riskFlags: ["Key loss risk: at this activity level the seed phrase may be misplaced", "Inactive wallets are a growing portion of total supply — you're contributing"],
    analystNote: "The blockchain is patiently waiting for you to do literally anything. gm. Whenever you're ready.",
  }),
  (d) => ({
    behaviorType: "On-Chain Ghost",
    summary: `${d.totalTx} transactions and then silence. Like a crypto enthusiast who peaked at setup and never came back. ${d.worth} on-chain, completely still, slowly becoming a cautionary tale about not losing your seed phrase.`,
    keyInsights: [`${d.totalTx} txs — this is a wallet that opened and immediately went to sleep`, `${d.worth} in assets that have presumably changed in value while this wallet watched`, "No protocol interactions — DeFi remains undiscovered"],
    riskFlags: ["Permanent loss risk: low activity wallets are disproportionately associated with lost access", "Dust risk: small balances often not worth the gas to recover"],
    analystNote: "Not dead, just resting. The chain will be here when you wake up. Hopefully the assets will be too. gm.",
  }),
  (d) => ({
    behaviorType: "Legendary Holder of Legend",
    summary: `${d.totalTx} transactions. Bold strategy. You've committed to the most purist form of HODL — not just not selling, but also not buying, not interacting, not doing anything. The perfect wallet for someone who values their time above all else.`,
    keyInsights: [`${d.totalTx} txs over ${d.ageYears.toFixed(1)} years — roughly ${(d.totalTx / Math.max(d.ageYears, 0.1)).toFixed(1)} transactions per year`, "Zero gas wasted on DeFi protocols that probably rugged anyway", `${d.worth} achieving maximum HODL purity`],
    riskFlags: ["Single point of failure: one lost seed phrase, zero recovery options", "No diversification beyond doing absolutely nothing"],
    analystNote: "In a bear market, inaction is a strategy. In a bull market, inaction is regret. You've lived both. wagmi eventually.",
  }),
  (d) => ({
    behaviorType: "Blockchain Tourist (Day Trip)",
    summary: `Came to crypto, made ${d.totalTx} transactions, saw the vibes, and apparently had enough. Not ungmi — just gone. ${d.worth} left on the blockchain like luggage at a hotel you never came back to.`,
    keyInsights: [`${d.totalTx} transactions — a brief but eventful visit to Web3`, "No DeFi, no protocols, no further interest detected", `Left ${d.worth} behind — either forgot or the most patient exit strategy ever`],
    riskFlags: ["Forgotten wallet risk: this is how Bitcoin gets permanently lost", "Exchange risk: if this was ever on a CEX, check if that exchange still exists"],
    analystNote: `The blockchain does not delete abandoned wallets. Your ${d.worth} will be here when you remember the seed phrase. Good luck. gm.`,
  }),
  (d) => ({
    behaviorType: "Accidental Hodler",
    summary: `${d.totalTx} transactions then radio silence. Either the most disciplined long-term investor alive or someone who has been meaning to get back to this and just hasn't had the chance for ${d.ageYears.toFixed(1)} years. Both are valid, honestly.`,
    keyInsights: [`${d.totalTx} txs — definitely not a bot, probably not an active user either`, `${d.worth} untouched — gaining or losing value entirely without your input`, "Patience so extreme it loops back around to negligence"],
    riskFlags: [`Access risk: ${d.ageYears.toFixed(0)} years is a long time to remember a seed phrase`, "Regulatory risk: inactive wallets occasionally get confused for mixer outputs"],
    analystNote: "The most passive investing strategy on-chain. Also one of the oldest. If the asset goes up, you're a genius. gm.",
  }),
  (d) => ({
    behaviorType: "Set It And Definitely Forgot It",
    summary: `${d.totalTx} transactions over ${d.ageYears.toFixed(1)} years. The DCA strategy, if DCA stood for "Did Crypto Abandoned." ${d.worth} sitting here waiting for an owner who may or may not remember this wallet exists.`,
    keyInsights: [`${d.totalTx} — almost below the threshold of 'intentional activity'`, "Portfolio composition unchanged since inception, presumably", "Either profound conviction or profound forgetting — same outcome"],
    riskFlags: ["Loss of access is the #1 cause of Bitcoin being 'lost' — you're a candidate", "Hardware wallet risk: if this was on a device, that device may be long gone"],
    analystNote: "If you're reading this: you found it. Write down the seed phrase again. Put it somewhere safe. Then maybe make a transaction. One. gm.",
  }),
  (d) => ({
    behaviorType: "Minimalist On-Chain Presence",
    summary: `${d.totalTx} transactions is technically active. In the same way that breathing is technically exercise. This wallet exists, has ${d.worth}, and has made a powerful statement about restraint. Or it's abandoned. Same energy.`,
    keyInsights: ["Transaction count in the 'basically zero' category", `${d.worth} portfolio managed via the 'don't touch it' philosophy`, `Age: ${d.ageYears.toFixed(1)} years — a vintage wallet with minimal mileage`],
    riskFlags: ["Orphan wallet risk: heirs cannot access crypto without the seed phrase", "The wallet knows something or has been forgotten — either way it's not talking"],
    analystNote: "The cleanest wallet history. Nothing to audit, nothing to roast, barely anything to analyze. A masterpiece of minimalism. gm.",
  }),
  (d) => ({
    behaviorType: "Web3 One-Night Stand",
    summary: `${d.totalTx} transactions — the on-chain equivalent of signing up for a gym membership in January. Showed up, tried it, and the motivation quietly faded around transaction number ${Math.max(d.totalTx - 2, 1)}. ${d.worth} remains, frozen in time.`,
    keyInsights: [`${d.totalTx} txs: the exact number needed to have 'done crypto'`, "No follow-through on DeFi, NFTs, or literally anything else", `${d.worth} — the cost of exploring Web3 for one brief, ambitious week`],
    riskFlags: ["The initial enthusiasm never returned — may not return", `If ${d.worth} is material: please remember your seed phrase`],
    analystNote: `The blockchain is the world's most persistent journal. Your ${d.totalTx}-transaction chapter is written. The sequel is up to you. gm.`,
  }),
  (d) => ({
    behaviorType: "Deeply Patient Participant",
    summary: `Either the most disciplined investor on this chain or the most forgetful. ${d.totalTx} transactions over ${d.ageYears.toFixed(1)} years works out to basically zero on-chain presence. The ${d.worth} just sits there, accumulating character.`,
    keyInsights: [`${(d.totalTx / Math.max(d.ageYears, 0.1)).toFixed(2)} transactions per year — true HODL purist`, "Untouched by market mania, liquidations, or protocol hacks — by virtue of not participating", "Simplest possible strategy: acquire, forget, check back later"],
    riskFlags: ["Access risk grows with wallet age — document the seed phrase", "Inflation eats stablecoins; bear markets eat everything else"],
    analystNote: `In ${d.ageYears.toFixed(0)} more years this is either a fortune or a warning story. No in-between. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Crypto Sleeper Agent",
    summary: `${d.totalTx} transactions and ${d.ageYears.toFixed(1)} years of dormancy. Not dead — dormant. There's a difference. The wallet is fully operational. It just hasn't been asked to do anything. ${d.worth} waiting for orders that haven't come.`,
    keyInsights: [`${d.totalTx} txs — activation sequence started, then paused indefinitely`, `${d.worth} in assets that have moved in price without this wallet moving at all`, "Waiting for the signal that never came, or already forgot the mission"],
    riskFlags: ["Inactivation is associated with lost access — check your seed phrase today", "If this wallet is inherited: crypto requires seed phrases, not death certificates"],
    analystNote: "The mission will resume. The chain will be ready. Just maybe check the seed phrase is still where you put it. gm.",
  }),
  (d) => ({
    behaviorType: "Human HODL Event",
    summary: `You ARE the HODL meme. ${d.totalTx} transactions in ${d.ageYears.toFixed(1)} years means you literally have not sold, bought, or interacted with anything since you started. The diamond hands aren't a strategy — they're calcified. You might be physically unable to transact at this point.`,
    keyInsights: [`${d.totalTx} txs — the control group for 'what if I just did nothing'`, `${d.worth} outcome from maximum inaction`, "No market event caused a single additional transaction — true iron hands"],
    riskFlags: ["Physical diamond hands risk: at some point, can you actually transact if you wanted to?", "Gas price shock: if you do transact, current gas may cause cardiac arrest"],
    analystNote: "The experiment is running. The results are pending. The thesis is: time in market beats timing the market. Jury is still out. wagmi.",
  }),
  (d) => ({
    behaviorType: "Quiet Accumulation (Zero Accumulation)",
    summary: `${d.totalTx} transactions. This is either 'quietly accumulating' or 'forgot the password' and honestly we cannot tell from on-chain data alone. The ${d.worth} is real. The activity is not. The vibes are unclear.`,
    keyInsights: [`${d.totalTx} txs — technically on the blockchain, spiritually elsewhere`, "Portfolio: unchanged since the beginning of recorded history (yours)", `${d.protocolCount} protocols: ${d.protocolCount === 0 ? "none — the original lurker" : "some history before going silent"}`],
    riskFlags: ["Wallet silence is often the last entry before 'lost forever'", "If this is hot wallet: please move to cold storage before you forget again"],
    analystNote: "The blockchain has no record of you doing anything. You have complete plausible deniability about all of it. Respect. gm.",
  }),
  (d) => ({
    behaviorType: "One-Transaction Legend",
    summary: `${d.totalTx} transactions. Technically that counts. You minted your on-chain legacy, declared mission accomplished, and moved on with your life. The ${d.worth} is there. The ambition was apparently fully satisfied at transaction number ${d.totalTx}.`,
    keyInsights: [`${d.totalTx} transactions — a complete story in ${d.totalTx} ${d.totalTx === 1 ? "chapter" : "chapters"}`, "Zero follow-up activity — the conviction was single-use", `${d.worth} portfolio that has done all its work without you`],
    riskFlags: ["If you can't access this wallet, the story ends here", "The sequel exists but requires your participation"],
    analystNote: "Short story. Potentially great ending. You'll need to come back for the finale. The chain is holding your spot. gm.",
  }),
  (d) => ({
    behaviorType: "Blockchain Witness",
    summary: `${d.totalTx} transactions — enough to be here, not enough to do anything. You've witnessed ${d.ageYears.toFixed(1)} years of crypto history from the sidelines. Market crashes, NFT manias, DeFi summers, L2 migrations. All observed. None participated in. ${d.worth} spectating fee.`,
    keyInsights: [`${d.totalTx} txs — present but not active, like a fan who bought a ticket and stayed in the car`, `${d.ageYears.toFixed(1)} years of market cycles seen but not traded`, "The most educational portfolio with the least activity"],
    riskFlags: [`Spectating is free; this wallet paid ${d.worth} to watch`, "Inaction is a strategy but requires the wallet to be accessible"],
    analystNote: "You've paid the entry fee and seen the show. The encore is whenever you decide to actually transact. gm, the stage is yours.",
  }),
];

// ─── NFT Degen (nftCount > 15) — 12 roasts ──────────────────────────────────

export const nftRoasts: RoastFn[] = [
  (d) => ({
    behaviorType: "JPEG Archaeologist",
    summary: `${d.nftCount} NFTs. You own ${d.nftCount} NFTs, ser. At some point the question stops being "which ones will moon" and starts being "why." The good news: you clearly believe in digital ownership. The bad news: most of that collection has the liquidity of concrete.`,
    keyInsights: [`${d.nftCount} NFTs collected — the blockchain is basically your hard drive`, `${d.stablePct > 20 ? `${d.stablePct.toFixed(0)}% in stablecoins — smart enough to keep some dry powder for the next drop` : "Minimal stablecoins — all-in on the JPEG thesis"}`, `${d.protocolCount > 0 ? `Uses ${d.topProtocol} on the side — multitasking the degen portfolio` : "Pure NFT play, no DeFi — respect the focus"}`],
    riskFlags: ["Liquidity risk: NFTs are famously easy to buy and famously hard to sell", "Floor price risk: the floor can drop 90% in 48 hours and has done so repeatedly"],
    analystNote: `${d.nftCount} collections deep and still going. The conviction is real. Whether the floor holds is another question entirely. LFG.`,
  }),
  (d) => ({
    behaviorType: "Professional JPEG Enthusiast",
    summary: `${d.nftCount} NFTs in the wallet. You've made the strategic decision that the future is pixelated apes and procedurally generated art. So far the market has had complicated feelings about this. The art remains. The floor prices are... a journey.`,
    keyInsights: [`${d.nftCount} digital assets that technically represent ownership of something`, "Portfolio diversified across multiple JPEG risk categories", `${d.totalTx} transactions — you've been actively pursuing this collection strategy`],
    riskFlags: ["Market sentiment risk: NFT markets can disappear faster than they appeared", "Royalty risk: most NFT royalties are now optional — creator economics broken"],
    analystNote: "In 10 years these are either historical digital artifacts or an embarrassing story. The bet is real. wagmi on the art side.",
  }),
  (d) => ({
    behaviorType: "Digital Art Hoarder",
    summary: `${d.nftCount} NFTs. You're basically running a digital art gallery except the gallery has no visitors and the art isn't hanging on any walls. ${d.worth} portfolio with a significant allocation to things that are, at minimum, unique.`,
    keyInsights: [`${d.nftCount} pieces in the collection — curated or compulsive, we can't tell`, "Unique digital ownership achieved across multiple contracts", `${d.ageYears.toFixed(1)} years on-chain: you've been collecting through at least one complete NFT cycle`],
    riskFlags: ["Wash trading risk: the price you paid may have been set by the seller buying from themselves", "Provenance risk: NFT metadata often lives off-chain and can disappear"],
    analystNote: "The collection exists. The value is subjective. The gas fees were real. At least you have unique things. gm collector.",
  }),
  (d) => ({
    behaviorType: "Floor Price Optimist",
    summary: `${d.nftCount} NFTs sitting in the wallet, each one purchased with the belief that the floor would go up. Some did. Some did not. The blockchain remembers every single purchase at price. This is your permanent record.`,
    keyInsights: [`${d.nftCount} floor price bets, results pending`, `${d.totalTx} transactions — that's a lot of mint buttons clicked`, "OpenSea activity probably significant; Blur activity possible"],
    riskFlags: ["Floor collapse risk: seen it happen to every collection, including the good ones", "Gas fee absorption: at peak gas, mint costs sometimes exceeded NFT value"],
    analystNote: "The floor is a suggestion. Sometimes a generous one, sometimes not. You've played the game. wagmi on the ones that matter.",
  }),
  (d) => ({
    behaviorType: "NFT Summer Survivor",
    summary: `${d.nftCount} NFTs — someone was active during the great JPEG mania. The good ones are gems. The rest are digital yard sale items with no buyers. ${d.worth} portfolio, part art collection, part financial history lesson.`,
    keyInsights: [`${d.nftCount} tokens that cannot be quickly liquidated into anything`, "Portfolio represents multiple phases of NFT hype cycles", `${d.stablePct.toFixed(0)}% stablecoins: ${d.stablePct > 30 ? "wisely keeping exits available" : "all-in on the JPEG future"}`],
    riskFlags: [`Illiquidity risk: try listing ${d.nftCount} NFTs and see how many actually sell`, "Platform risk: OpenSea, Blur, and others could shut down or change policies"],
    analystNote: `You survived NFT summer. The question is which of those ${d.nftCount} pieces survive the next decade. The chain knows. gm.`,
  }),
  (d) => ({
    behaviorType: "Metaverse Real Estate Developer",
    summary: `${d.nftCount} NFTs — someone believed hard in something. Whether that something was art, community, yield, or pure speculation varies by collection. The commitment is undeniable. The returns are... varied. The gas fees were definitely real.`,
    keyInsights: [`${d.nftCount} NFTs: enough to need a portfolio tracker just for the jpegs`, "Multi-collection strategy: diversified within the JPEG asset class", `${d.totalTx} transactions total — significant on-chain footprint`],
    riskFlags: ["Correlation risk: in a bear market, all NFT floors fall together", "Attention risk: NFTs require sustained community interest to maintain value"],
    analystNote: `${d.nftCount} is a lot of bets. Statistically, one of them hits. Hopefully it's one of the ones you still have. LFG.`,
  }),
  (d) => ({
    behaviorType: "Generative Art Believer",
    summary: `${d.nftCount} NFTs. Either a sophisticated collector who understands digital art value, or someone who found the mint button and couldn't stop. Possibly both. The ${d.worth} portfolio includes what is charitably called a 'diverse digital asset strategy'.`,
    keyInsights: [`${d.nftCount} NFTs — statistically, a few of these are actually good`, "Collector mentality applied to an asset class that didn't exist 5 years ago", `${d.protocolCount > 0 ? `Also active in DeFi (${d.topProtocol}) — not just JPEGs` : "Pure NFT strategy — undiluted conviction"}`],
    riskFlags: ["Copycat risk: anyone can recreate the art; only the contract address is unique", "Community death risk: when the Discord goes quiet, the floor follows"],
    analystNote: "The art is real, the community might be real, the value is definitely negotiable. Collect what you love. wagmi on taste.",
  }),
  (d) => ({
    behaviorType: "Profile Picture Portfolio Manager",
    summary: `${d.nftCount} NFTs and a ${d.worth} portfolio that would confuse a traditional financial advisor. 'So your investment thesis is... pictures?' 'Specifically, unique pictures on a blockchain.' 'And the yield?' '... community.' 'I see.' 'Do you?'`,
    keyInsights: [`${d.nftCount} profile picture options — maximum Twitter flex potential`, "Diversified across multiple art styles and communities", `${d.totalTx} on-chain transactions tell the story of an active collector`],
    riskFlags: ["The PFP meta died once and came back — no guarantees on round two", "Wash trading inflated historic prices; real bids may be 70% lower"],
    analystNote: "The flex is real. The liquidity is theoretical. The fun was definitely had. gm fellow art appreciator.",
  }),
  (d) => ({
    behaviorType: "Overcollateralized Collector",
    summary: `${d.nftCount} NFTs is commitment. That's a thesis, a strategy, or a very expensive hobby — it's hard to tell from the outside. The ${d.worth} wallet has allocated significant resources to the hypothesis that unique digital things have value. The market agrees some days.`,
    keyInsights: [`${d.nftCount} unique tokens — technically the most diversified digital art fund`, "Average holding period unclear but the collection suggests long-term conviction", `${d.ageYears.toFixed(1)} years of collecting history`],
    riskFlags: ["Concentration in an uncorrelated and illiquid asset class", "NFT royalty collapse means even successful exits earn creators nothing now"],
    analystNote: `${d.nftCount} pieces. At least one of them is good. Probably more. The rest are tuition. wagmi on the good ones.`,
  }),
  (d) => ({
    behaviorType: "Web3 Curator",
    summary: `${d.nftCount} NFTs in a ${d.worth} wallet. You're essentially running a micro museum of the blockchain art era. Future historians will either call you visionary or study you as a cautionary tale. Possibly both. The gas fees are already historical artifacts.`,
    keyInsights: [`${d.nftCount} digital works — a curated collection of what seemed important at mint time`, "Represents participation across multiple waves of NFT culture", `${d.stablePct.toFixed(0)}% in stablecoins — ${d.stablePct > 25 ? "some hedge against the JPEG thesis" : "fully committed to the collection"}`],
    riskFlags: ["Storage risk: NFT images stored on IPFS can become inaccessible if nodes go offline", "Speculative asset class: NFTs have no cash flows, dividends, or intrinsic yield"],
    analystNote: "The collection is your on-chain autobiography. Whether it's a bestseller or a zine depends on what happens next. LFG.",
  }),
  (d) => ({
    behaviorType: "Blue-Chip JPEG Believer",
    summary: `${d.nftCount} NFTs. You've assembled what the community might call a 'portfolio' and what a risk manager would call 'illiquid speculative digital assets.' The truth lives somewhere in between. The ${d.worth} total represents significant conviction in pixels.`,
    keyInsights: [`${d.nftCount} NFTs: the definition of 'alternative assets'`, `${d.totalTx} transactions required to build this collection — you were busy`, "Collector logic: if it's on-chain and unique, it has value. Eventually."],
    riskFlags: ["No exit if the market turns — NFT bids disappear instantly in bear markets", "Meta-shift risk: culture moves fast; today's blue chip is tomorrow's artifact"],
    analystNote: `${d.nftCount} bets on digital ownership. History will decide if you were early or just enthusiastic. Probably a bit of both. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Jpeg-Forward Portfolio Strategist",
    summary: `${d.nftCount} NFTs in the collection, ${d.worth} in total net worth, ${d.totalTx} transactions to get here. You have a clear strategy: own things that are unique on a blockchain. Whether the strategy is genius or gambling depends on which way the floor goes. Currently: both.`,
    keyInsights: [`${d.nftCount} unique digital assets — uniqueness confirmed by contract; value confirmed by nobody yet`, "The collection spans what appears to be multiple hype cycles", `${d.protocolCount > 0 ? `${d.protocolCount} DeFi protocols also touched — diversification beyond JPEGs` : "Pure collector — no DeFi dilution of the thesis"}`],
    riskFlags: [`Bid liquidity risk: there are ${d.nftCount} items to sell and maybe 3 real buyers on a good day`, "Culture risk: the community that gave these value might find a new favorite"],
    analystNote: `${d.nftCount} unique things in the wallet. That's a portfolio, a collection, and a vibe. gm collector, the floor awaits.`,
  }),
];

// ─── Chain Tourist (chainCount >= 4) — 10 roasts ────────────────────────────

export const chainTouristRoasts: RoastFn[] = [
  (d) => ({
    behaviorType: "Omnichained Attention Deficit",
    summary: `${d.chainCount} chains. You're on ${d.chainCount} different blockchains simultaneously, paying bridge fees on all of them like it's a subscription service. Either a sophisticated multi-chain strategy or the most expensive case of FOMO ever documented. Based on the chain list: both.`,
    keyInsights: [`${d.chainCount} chains — more chains than most people have subscriptions`, `${d.protocolCount} protocols spread across ${d.chainCount} ecosystems — wide net, variable depth`, `${d.worth} managed across ${d.chainCount} RPC endpoints and twice as many browser tabs`],
    riskFlags: ["Bridge risk: every cross-chain tx is a trust exercise that has gone wrong before", `Complexity risk: ${d.chainCount} chains means ${d.chainCount}x the attack surface`],
    analystNote: `Being on ${d.chainCount} chains is either a sophisticated multi-chain strategy or advanced FOMO. The P&L decides which. wagmi on at least one of them.`,
  }),
  (d) => ({
    behaviorType: "Ecosystem Completionist",
    summary: `${d.chainCount} chains, because apparently picking one was too limiting. You've paid bridge fees to access ecosystems that promised lower fees, then paid those fees too. The search for the perfect chain continues, costing money on every chain visited so far.`,
    keyInsights: [`${d.chainCount} ecosystems explored — each one was definitely going to be the one`, "Bridge fee contribution: significant, ongoing, possibly regrettable", `${d.totalTx} total transactions spread thin like butter across ${d.chainCount} slices of toast`],
    riskFlags: ["Bridge protocol risk: bridges have lost hundreds of millions in exploits", `Key management risk: ${d.chainCount} chains means more addresses to secure`],
    analystNote: `The perfect chain doesn't exist. ${d.chainCount} is a lot of attempts though. wagmi on the one that sticks.`,
  }),
  (d) => ({
    behaviorType: "Multichain Maximalist",
    summary: `You didn't just pick a chain — you picked ${d.chainCount}. The maximalism of this wallet is: all of them. ${d.worth} distributed across more ecosystems than most developers have shipped on. The interoperability vision is alive and expensive.`,
    keyInsights: [`${d.chainCount} chains: the portfolio of someone who believes the multi-chain future is now`, `${d.protocolCount} protocols across the ecosystem — genuinely diverse activity`, "Bridge usage indicates either sophisticated routing or chronic FOMO addiction"],
    riskFlags: ["Every bridge used is a smart contract that can be exploited", `Tax complexity: ${d.chainCount} chains means ${d.chainCount} sets of transactions to track`],
    analystNote: `${d.chainCount} chains is commitment to the ecosystem. Or a commitment to chaos. Probably both. LFG everywhere simultaneously.`,
  }),
  (d) => ({
    behaviorType: "Perpetual Chain Hopper",
    summary: `${d.chainCount} chains. Every new chain launch brought you in early. Every airdrop farming season brought new addresses. Every 'this chain has zero fees' tweet sent you bridging. The fees weren't always zero. The bridging was always real.`,
    keyInsights: [`${d.chainCount} chains — you've seen more ecosystems than most people know exist`, "Airdrop farming history: probable, given the breadth of chain activity", `${d.totalTx} total transactions on ${d.chainCount} chains — the on-chain resume is extensive`],
    riskFlags: ["Sybil risk: multi-chain activity can trigger sybil filters in some airdrop programs", `Dispersion risk: ${d.worth} across ${d.chainCount} chains means tiny positions everywhere`],
    analystNote: `${d.chainCount} chains is a lot of surface area. If one of those ecosystems moons, you're in it. LFG on the right one.`,
  }),
  (d) => ({
    behaviorType: "Cross-Chain Bridge Financier",
    summary: `${d.chainCount} chains active, unknown number of bridge transactions completed, and a non-trivial amount of net worth given to bridge protocols over the years. Technically on every major blockchain. Technically paying fees on all of them.`,
    keyInsights: [`${d.chainCount} chains — the blockchain equivalent of having an apartment in every city`, `${d.protocolCount} protocols used — you know where to find yield regardless of ecosystem`, "Bridge fee payment record: lifetime total would be painful to calculate"],
    riskFlags: ["Bridge smart contract risk: Wormhole, Ronin, and others have been exploited for hundreds of millions", `Coordination overhead: ${d.chainCount} chains requires ${d.chainCount} sets of private keys and mental overhead`],
    analystNote: `You're funding the multi-chain future one bridge fee at a time. Altruistic and expensive. wagmi across all ${d.chainCount} chains.`,
  }),
  (d) => ({
    behaviorType: "Decentralized Globetrotter",
    summary: `${d.chainCount} chains. This wallet has been to more blockchain ecosystems than most crypto tourists visit in a lifetime. Each visit cost bridge fees. Each ecosystem had its own set of protocols to learn. The journey continues.`,
    keyInsights: [`${d.chainCount} chains: a proper blockchain world tour`, "Protocol knowledge spans multiple ecosystems — genuinely sophisticated", `${d.worth} distributed across the decentralized world — globalized crypto exposure`],
    riskFlags: ["Gas fee management: different tokens required on each chain for fees", `Every chain has different security models — hard to assess risk across ${d.chainCount} simultaneously`],
    analystNote: `The multi-chain thesis: alive in this wallet. One of those ${d.chainCount} ecosystems is going to break out. You're already there. LFG.`,
  }),
  (d) => ({
    behaviorType: "L2 Early Adopter Collector",
    summary: `${d.chainCount} chains — you've been bridging since before bridging was safe (it's still not fully safe but now it's faster). Each L2 launch, you were there. Each testnet, probably. The gas savings were real. The bridge risks were real-er.`,
    keyInsights: [`${d.chainCount} chain footprint — this wallet has seen the rollup era from the start`, "Possibly qualified for multiple airdrops through early adoption", `${d.totalTx} transactions: well-travelled on-chain passport`],
    riskFlags: ["Early bridge risk: early bridges had (and sometimes still have) significant security issues", "The chain you're most active on might not be the one that wins long-term"],
    analystNote: `${d.chainCount} chains is a strong multi-chain thesis. History will show which ones mattered. You're covered across the board. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Points Farming Professional",
    summary: `${d.chainCount} chains and ${d.totalTx} transactions — someone's been doing the math on airdrop farming. Deposit here, bridge there, interact with protocol, collect points, await TGE, question all life choices at claim time. The professional's meta.`,
    keyInsights: [`${d.chainCount} chains: suspiciously aligned with major airdrop opportunities`, `${d.totalTx} transactions: the volume required for "meaningful protocol interaction"`, "Protocol diversity suggests systematic farming, not casual use"],
    riskFlags: ["Sybil detection is improving: multi-wallet farms are getting flagged retroactively", "TGE disappointment risk: points have a long history of not converting to expected value"],
    analystNote: `${d.chainCount} chains of farming requires ${d.chainCount} chains of patience. The airdrop season cometh. LFG and good luck with the claim.`,
  }),
  (d) => ({
    behaviorType: "Interoperability Thesis Holder",
    summary: `${d.chainCount} chains. You've bought the multi-chain future thesis and expressed it on-chain with money. The bet: blockchains will be like the internet — many of them, all connected, user moves freely. The cost: bridge fees, coordination, and a lot of browser tabs.`,
    keyInsights: [`${d.chainCount} chains — a living expression of the interoperability thesis`, "Each bridge represents a bet that cross-chain will work and not get exploited", `${d.protocolCount} protocols across ecosystems — the network effect is personal`],
    riskFlags: ["The interoperability bet requires bridges to remain secure — historically challenging", "Winner-take-all risk: what if one chain wins and the rest die?"],
    analystNote: `The multi-chain future is either the vision or the hedge. On ${d.chainCount} chains, you're covered either way. Probably. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Blockchain Diversification Evangelist",
    summary: `${d.chainCount} chains — not putting all eggs in one blockchain. The diversification principle applied to the underlying ledger itself. Sophisticated? Absolutely. Simple? Absolutely not. Worth it? The ${d.worth} portfolio will decide.`,
    keyInsights: [`${d.chainCount} chain diversification: more thorough than most multi-chain funds`, "Each chain represents a different ecosystem bet", `${d.worth} spread across ${d.chainCount} different risk profiles simultaneously`],
    riskFlags: ["Diversification helps with chain-specific risk but not overall crypto market risk", `Operational complexity: ${d.chainCount} chains to monitor, secure, and manage`],
    analystNote: `${d.chainCount} chains is the long tail bet on crypto. If the ecosystem survives and thrives, so does this wallet. LFG on all fronts.`,
  }),
];

// ─── Gas Philanthropist (totalTx > 800) — 10 roasts ─────────────────────────

export const gasPhilanthropistRoasts: RoastFn[] = [
  (d) => ({
    behaviorType: "Ethereum Gas Benefactor",
    summary: `${d.totalTx.toLocaleString()} transactions. You have sent ${d.totalTx.toLocaleString()} transactions to the blockchain. Validators have a shrine to you. You didn't just use this chain — you funded it. At some point 'active on-chain' becomes a calling.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs — at average $5 gas that's $${(d.totalTx * 5).toLocaleString()} in fees donated to the network`, `${d.protocolCount} protocols touched — you've seen things`, `${d.chainCount > 1 ? `${d.chainCount} chains, still not satisfied — the search for more gas to burn continues` : "Loyal to one chain — Ethereum maxi behaviour, respect"}`],
    riskFlags: ["Gas fee exposure: you've funded the network handsomely", `${d.riskScore > 50 ? "High risk score on top of high activity: this is a busy and bold wallet" : "Activity is high, risk is managed — professional energy"}`],
    analystNote: `${d.totalTx.toLocaleString()} transactions. You're either a power user, a bot, or you have a problem. Possibly all three. gm.`,
  }),
  (d) => ({
    behaviorType: "On-Chain Workaholic",
    summary: `${d.totalTx.toLocaleString()} transactions. That's not an investment portfolio — that's a career. You've spent more time interacting with smart contracts than most people spend on email. The gas fees are a second mortgage. The on-chain history is a novel.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs over ${d.ageYears.toFixed(1)} years = ${(d.totalTx / Math.max(d.ageYears, 0.1)).toFixed(0)} txs per year`, "Protocol knowledge: extensive", "This wallet has opinions about gas prices that would make a validator blush"],
    riskFlags: ["Activity-correlated risk: more txs = more exposure to failed transactions and frontrunning", "MEV bot attention: highly active wallets attract MEV extraction"],
    analystNote: `${d.totalTx.toLocaleString()} is a number that requires explanation at tax time. Good luck with that. wagmi despite the accountant's confusion.`,
  }),
  (d) => ({
    behaviorType: "Transaction Count Maximalist",
    summary: `${d.totalTx.toLocaleString()} transactions. Somewhere a block explorer is struggling to paginate your history. You've made more transactions than some entire protocols process in a month. Either running infrastructure or running a very active personal strategy. Possibly both.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs — the kind of number that makes block explorer APIs sweat`, `${d.protocolCount} protocols — and ${d.protocolCount > 10 ? "clearly not committed to just one" : "loyal to a select few"}`, `${d.worth} managed with extreme activity — high-touch portfolio strategy`],
    riskFlags: ["Front-running risk: high-frequency on-chain activity is a target for MEV", "Smart contract risk compounds with every interaction — more txs, more exposure"],
    analystNote: `${d.totalTx.toLocaleString()} transactions in. The chain knows you. Validators thank you. gm you absolute unit.`,
  }),
  (d) => ({
    behaviorType: "Perpetual Motion Machine",
    summary: `${d.totalTx.toLocaleString()} transactions and counting. You've never found a protocol you didn't want to interact with or a trade you didn't want to make. The gas fees you've paid in your lifetime could have funded a small startup. Worth it? The activity suggests yes.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs: hyperactive even by degen standards`, `Gas donated to the network: incalculable but significant`, `${d.protocolCount > 15 ? `${d.protocolCount} protocols — you've basically been everywhere` : `${d.protocolCount} protocols in rotation`}`],
    riskFlags: ["Nonce management: at this tx count, one failed nonce can freeze a wallet", "Approval risk: high-activity wallets accumulate unlimited token approvals — revoke regularly"],
    analystNote: `The blockchain is your natural habitat. At ${d.totalTx.toLocaleString()} txs, you've earned permanent resident status. LFG.`,
  }),
  (d) => ({
    behaviorType: "Gas Price Connoisseur",
    summary: `${d.totalTx.toLocaleString()} transactions means you've developed opinions about gas prices that civilians cannot understand. 20 gwei: let's go. 100 gwei: still fine. 400 gwei during an NFT mint: the cost of doing business. You've been tested and you've paid.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs: gas price awareness is now a sixth sense`, `Lifetime gas spend: definitely in the 'I don't want to know' category`, `${d.protocolCount} protocols: each one with its own gas optimization quirks mastered`],
    riskFlags: ["High approval count: every DeFi interaction leaves token approvals — potential vulnerability", "Gas wars: at this volume, you've definitely overpaid in competitive mint situations"],
    analystNote: `${d.totalTx.toLocaleString()} transactions. You've seen base fee go from 1 gwei to 1000 gwei and kept sending. The commitment is real. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Block Space Power Buyer",
    summary: `${d.totalTx.toLocaleString()} transactions. You have personally consumed more block space than a small nation's entire crypto user base. The network is better and more expensive because of wallets like yours. Unironically thank you and also, wow.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs — a meaningful contribution to validator revenue`, `${d.worth} portfolio managed with extremely high activity`, `${d.ageYears.toFixed(1)} years of consistent on-chain presence`],
    riskFlags: ["Revert risk: high-frequency trading leads to higher revert rates and wasted gas", "Complexity accumulates: old approvals, old positions, old risk"],
    analystNote: "The blockchain would be noticeably quieter without this wallet. That's a legacy. A weird legacy, but still. gm legend.",
  }),
  (d) => ({
    behaviorType: "DeFi Power User",
    summary: `${d.totalTx.toLocaleString()} transactions means the term 'power user' is an understatement. You're not using DeFi — you ARE DeFi, at least a significant percentage of it. The protocols you frequent probably use you as a benchmark for TVL narratives.`,
    keyInsights: [`${d.totalTx.toLocaleString()} transactions: TVL provider, liquidity layer, gas contributor`, `${d.protocolCount} protocols: ${d.protocolCount > 20 ? "comprehensive coverage of the ecosystem" : "selective but deep"}`, "Position management at this scale requires either automation or obsession"],
    riskFlags: ["Composability risk: high DeFi activity means exposure to cascading smart contract failures", "The more protocols touched, the more exploit risk surfaces"],
    analystNote: `${d.totalTx.toLocaleString()} transactions is a career in DeFi, not a hobby. The expertise is real. The gas bill is also real. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Algorithmic Human",
    summary: `${d.totalTx.toLocaleString()} transactions is a suspicious number. Suspicious in the best way. Either you never sleep and are constantly on-chain, or you've set up some automation, or you've simply been at this so long the transactions compound naturally. Either way: impressive.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs — organic or automated, the result is the same: domination`, `Tx frequency suggests ${(d.totalTx / Math.max(d.ageYears * 365, 1)).toFixed(1)} transactions per day on average`, `${d.protocolCount} protocols: a portfolio breadth that suggests systematic coverage`],
    riskFlags: ["Bot-adjacent activity: high-frequency may trigger smart contract rate limiters", "Automation risk: if scripts control this wallet, a bug can drain it"],
    analystNote: `${d.totalTx.toLocaleString()} transactions tells a story of obsession, automation, or both. Both are valid. LFG you absolute machine.`,
  }),
  (d) => ({
    behaviorType: "Transaction Velocity Champion",
    summary: `${d.totalTx.toLocaleString()} transactions means if you charged $1 per transaction you could have a different career. The blockchain knows this wallet by name. By address. The validators know your priority fee preferences. You're basically infrastructure at this point.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs — you've processed more transactions than some layer 2s launched with`, `${d.worth} portfolio shaped by ${d.totalTx.toLocaleString()} decisions, each costing gas`, `${d.protocolCount} protocols, all thoroughly used`],
    riskFlags: ["At this volume, a single bad contract interaction is statistically more likely", `The tax implications of ${d.totalTx.toLocaleString()} transactions require professional help`],
    analystNote: `${d.totalTx.toLocaleString()} and counting. This is the highest-conviction activity wallet analyzed today. Respect. gm.`,
  }),
  (d) => ({
    behaviorType: "Relentless On-Chain Grinder",
    summary: `${d.totalTx.toLocaleString()} transactions. The grind is real. While others were paper trading and watching YouTube videos about DeFi, you were on-chain doing the thing. ${d.totalTx.toLocaleString()} times. The education cost more in gas than most people spend on courses.`,
    keyInsights: [`${d.totalTx.toLocaleString()} txs — learned by doing, paid by doing, earned by doing`, `${d.ageYears.toFixed(1)} years of consistent execution`, `${d.worth} is the result of ${d.totalTx.toLocaleString()} transactions of compounding decisions`],
    riskFlags: ["Execution risk: at scale, one mistyped address or slippage setting is costly", "Protocol upgrade risk: high interaction frequency means greater exposure to migration bugs"],
    analystNote: `${d.totalTx.toLocaleString()} transactions of experience beats any course. The blockchain is your university. You've graduated. LFG.`,
  }),
];

// ─── Forgotten OG (ageYears > 4, netWorthUsd < 50k) — 10 roasts ─────────────

export const forgottenOgRoasts: RoastFn[] = [
  (d) => ({
    behaviorType: "Battle-Scarred Crypto Veteran",
    summary: `${d.ageYears.toFixed(1)} years on-chain. You've watched Bitcoin hit $69K and come back down. Witnessed entire ecosystems rise and collapse. Survived the FTX implosion. Held through the 2018 bear. And yet: ${d.worth}. The OG tax is real and it's been collecting for ${Math.floor(d.ageYears)} years.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years — that's like 30 human years in crypto time`, `${d.totalTx} transactions over ${Math.floor(d.ageYears)} years: steady, experienced, not always profitable`, `${d.protocolCount > 0 ? `Found DeFi eventually — better late than never` : "Pre-DeFi wallet — was here before the protocols existed"}`],
    riskFlags: ["Survivorship bias: being early doesn't guarantee the next call is right", "Old wallet often means old habits — some of those habits don't survive the next cycle"],
    analystNote: `${d.ageYears.toFixed(1)} years in and still here — top 1% of commitment. The P&L doesn't capture the tuition paid. wagmi old friend.`,
  }),
  (d) => ({
    behaviorType: "Cycle Veteran",
    summary: `${d.ageYears.toFixed(1)} years on-chain puts you in rare company. You've seen ICO season, DeFi summer, NFT mania, and whatever this is now. The accumulated wisdom is impressive. The accumulated net worth is... ${d.worth}. Still, the experience is non-transferable and genuinely valuable.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years: witnessed more market cycles than most investors`, `${d.totalTx} transactions document a long, honest history`, `${d.worth} — not life-changing, but evidence of surviving when others didn't`],
    riskFlags: ["Cycle fatigue: after ${Math.floor(d.ageYears)} years, complacency can set in at exactly the wrong time", "Old approvals: ${Math.floor(d.ageYears)}-year-old wallets accumulate unlimited approvals — revoke regularly"],
    analystNote: `The wisdom costs ${d.worth}. The experience is priceless. The next cycle might be the one. gm veteran.`,
  }),
  (d) => ({
    behaviorType: "Blockchain Archaeologist",
    summary: `This wallet was here when gas was $0.01. ${d.ageYears.toFixed(1)} years ago, when Ethereum was new and everything was going to change the world. It has changed the world. The net worth is ${d.worth}. The world-changing was free. The transaction fees were not.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years makes this wallet older than most protocols`, `${d.totalTx} txs: a history of early adoption and continuous participation`, "Was here for things that don't exist anymore and things that do"],
    riskFlags: ["Old wallet security: ${Math.floor(d.ageYears)}-year-old seed phrases are written on degradable materials", "Early adoption risk: some of the early projects this wallet used no longer exist"],
    analystNote: `${d.ageYears.toFixed(1)} years of on-chain history. The archive is complete. The story continues. gm OG.`,
  }),
  (d) => ({
    behaviorType: "Pre-DeFi Pioneer",
    summary: `${d.ageYears.toFixed(1)} years. You were here before Uniswap, before Aave, before 'DeFi' was even a word people used unironically. The space you explored at the beginning looked nothing like it does now. ${d.worth} net worth and more context than anyone who started in 2021 will ever have.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years — predates most of what crypto is today`, `${d.totalTx} transactions: a measured, experienced pace`, `${d.worth} — the long-game portfolio, still running`],
    riskFlags: ["Early adopter paradox: the conviction that brought you in early can hold you in too long", "PTSD risk: having lived through ${Math.floor(d.ageYears)} years of volatility changes how you trade"],
    analystNote: `${d.ageYears.toFixed(1)} years. You've earned the right to have opinions about crypto that newcomers will dismiss. wagmi. You know why.`,
  }),
  (d) => ({
    behaviorType: "Long-Suffering Faithful",
    summary: `${d.ageYears.toFixed(1)} years in the game. You held through the moments when everyone said crypto was over — and there have been several. The portfolio at ${d.worth} might not reflect the journey, but the journey is in every transaction. ${d.totalTx} of them.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years: a commitment that predates most HODLers`, `${d.totalTx} txs over the years — consistent, patient, still here`, `${d.stablePct.toFixed(0)}% stablecoins: ${d.stablePct > 40 ? "the bear market changed you" : "still got conviction in the volatile assets"}`],
    riskFlags: ["Long-term holder bias: hard to see when the thesis is wrong after ${Math.floor(d.ageYears)} years of holding it", "Conviction risk: years of being right can make the one wrong call more costly"],
    analystNote: `The real gain was the FUD we resisted along the way. ${d.worth} is a fine number for ${d.ageYears.toFixed(1)} years of experience. gm.`,
  }),
  (d) => ({
    behaviorType: "The One Who Stayed",
    summary: `${d.ageYears.toFixed(1)} years. People came and went. Friends who couldn't handle the 80% drawdowns. Family members who said you were crazy. Forums that died. Projects that rugged. And through all of it: this wallet. ${d.totalTx} transactions. Still here.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years of presence across multiple bear markets`, `${d.totalTx} transactions tell the story of patience and persistence`, `${d.worth} — the number is the number; the experience is worth more`],
    riskFlags: ["Stubbornness risk: ${Math.floor(d.ageYears)} years of being right makes it hard to admit when you're wrong", "Anchoring: the prices you first saw crypto at anchor every assessment since"],
    analystNote: `${d.ageYears.toFixed(1)} years. Not everyone made it this far. You did. The next ${Math.floor(d.ageYears)} years might go differently. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Crypto Dinosaur (Affectionate)",
    summary: `${d.ageYears.toFixed(1)} years on-chain. In crypto years, that's prehistoric. You've survived the extinction events that wiped out 90% of other participants. ${d.worth} wallet, ancient wisdom, and a transaction history that younger wallets would study if they knew it existed.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years: pre-dates most current crypto users' interest in crypto`, `${d.totalTx} transactions across ${Math.floor(d.ageYears)} years — measured and deliberate`, "Witnessed the birth and death of entire categories that people still argue about"],
    riskFlags: ["Complacency risk: having survived this long, the next black swan might feel impossible", "Tech debt: ${Math.floor(d.ageYears)}-year-old wallets may use outdated standards"],
    analystNote: `${d.ageYears.toFixed(1)} years is more than most projects last. Outlasting everything is its own achievement. gm elder.`,
  }),
  (d) => ({
    behaviorType: "Historical Ledger Entry",
    summary: `${d.ageYears.toFixed(1)} years of transactions is a historical document. Future researchers will look at wallets like this to understand the early days of on-chain finance. You are, technically, a primary source. ${d.worth} doesn't capture that context.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years: this wallet predates many current L1s and all L2s`, `${d.totalTx} transactions: enough history to be statistically significant`, `Early adopter documented: the chain has receipts going back ${d.ageYears.toFixed(1)} years`],
    riskFlags: ["Old wallet vulnerabilities: early Ethereum had different security considerations", "Access risk increases with wallet age — document access multiple times over"],
    analystNote: `${d.ageYears.toFixed(1)} years. The archive is valuable. The future is still unwritten. Both are true simultaneously. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Grizzled Market Survivor",
    summary: `${d.ageYears.toFixed(1)} years. You have seen things, ser. The Mt. Gox era. The DAO hack. The 2018 winter. Three Bitcoin halvings. The DeFi exploits. The NFT rise and fall. You are still here. The ${d.worth} wallet endures. Some things cannot be priced.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years: multiple near-death experiences for the asset class, all survived`, `${d.totalTx} transactions: each one a decision made with incomplete information, most of them fine`, `${d.worth} — the number that survived everything`],
    riskFlags: ["Battle scar risk: past crashes make the next rally feel more suspicious than it is", "Overcaution: having survived the worst, some wallets never take enough risk again"],
    analystNote: `${d.ageYears.toFixed(1)} years of survival. That IS the achievement. The gains follow conviction, and you've proven conviction over a decade. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Weathered On-Chain Presence",
    summary: `${d.ageYears.toFixed(1)} years on the chain. The industry has changed so completely since this wallet was created that the original use case might be unrecognizable. But the wallet survived, adapted, and kept transacting. ${d.totalTx} transactions later: still here, ${d.worth} intact.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years: the industry has been completely rebuilt around wallets this age`, `${d.totalTx} transactions across the entire history — consistent engagement`, `${d.protocolCount > 0 ? `${d.protocolCount} modern protocols adopted — adapted to the new ecosystem` : "Classic holder — adapting at own pace"}`],
    riskFlags: ["Adaptation risk: the ecosystem moves fast; staying current requires ongoing effort", "Old habits: the way you managed wallets ${Math.floor(d.ageYears)} years ago may not be best practice now"],
    analystNote: `${d.ageYears.toFixed(1)} years is a lifetime in crypto. The wallet adapted. The network evolved. The thesis survived. wagmi.`,
  }),
];

// ─── Whale (netWorthUsd > 1M) — 8 roasts ────────────────────────────────────

export const whaleRoasts: RoastFn[] = [
  (d) => ({
    behaviorType: "Reluctant Billionaire's Neighbor",
    summary: `${d.worth} wallet. You are, by most definitions, doing extremely well in crypto. The roast writes itself and also can't really land because it's hard to roast someone with a ${d.worth} portfolio without it sounding like jealousy. So: congrats, and also, is that concentration risk?`,
    keyInsights: [`${d.worth} — a number that ends conversations at dinner parties`, `${d.totalTx} transactions to build this — either genius execution or right place right time`, `${d.protocolCount} protocols touched — at ${d.worth}, you have DeFi studying you`],
    riskFlags: [`Concentration risk: ${d.worth} in crypto is the kind of exposure that requires actual risk management`, "Wallet security: at this size, hardware wallet isn't optional — it's mandatory"],
    analystNote: "The market is not always right, but it has been right about this wallet. wagmi, ser. You already did.",
  }),
  (d) => ({
    behaviorType: "Market-Moving Individual",
    summary: `${d.worth} wallet. At this size, your transactions are literally visible in mempool watchers. Whale alert accounts probably have you in their database. When you move, people notice. No pressure. The ${d.totalTx} transactions you've made have been watched.`,
    keyInsights: [`${d.worth}: in the range where on-chain moves get screenshotted on CT`, `${d.totalTx} transactions of on-chain history — all of it public, all of it analyzed`, `${d.protocolCount} protocols used — at ${d.worth} scale, you're a significant LP or borrower`],
    riskFlags: ["Front-running risk: wallets this size are actively targeted by MEV bots", "Address poisoning risk: high-value addresses receive fake look-alike transaction dust"],
    analystNote: `${d.worth} on-chain. The only criticism is: is it enough? Probably. wagmi (you clearly already did).`,
  }),
  (d) => ({
    behaviorType: "Confirmed On-Chain Whale",
    summary: `${d.worth}. This is not a roast — this is a salute with mild concern about risk management. You've done the thing that everyone here is trying to do, and the blockchain has receipts. ${d.totalTx} transactions of documented conviction. The math worked out.`,
    keyInsights: [`${d.worth} — you have arrived, ser`, `${d.totalTx} transactions of decisions that collectively led to this outcome`, `${d.stablePct.toFixed(0)}% stablecoins: ${d.stablePct > 30 ? "prudent risk management at this scale" : "still running it mostly hot — confident"}`],
    riskFlags: ["Target risk: large wallets are targets for phishing, social engineering, and worse", "Succession risk: does anyone know the seed phrase if something happens to you?"],
    analystNote: "What's the roast for someone who clearly won? Respect and also: diversify off-chain. wagmi, you already did.",
  }),
  (d) => ({
    behaviorType: "Asymmetric Bet Winner",
    summary: `${d.worth} in a wallet that started somewhere much smaller. The asymmetric bet paid off. You took the risk, held the conviction, executed the transactions, and the blockchain has the receipts. ${d.totalTx} of them. This is what the endgame looks like.`,
    keyInsights: [`${d.worth} — the outcome that made the gas fees worth it`, "The transactions that built this portfolio were decisions most people couldn't hold through", `${d.protocolCount} protocols — at ${d.worth}, you're not just using DeFi, you're moving markets in it`],
    riskFlags: [`At ${d.worth}, one smart contract exploit could be genuinely life-changing in the wrong direction`, "Concentration: if this is mostly one asset, that concentration risk is material"],
    analystNote: `${d.worth}. The number speaks for itself. The chain documents how you got here. wagmi — you did.`,
  }),
  (d) => ({
    behaviorType: "Protocol Liquidity Anchor",
    summary: `${d.worth}. At this scale, you're not a user of the protocols — you're infrastructure. Your deposits move the APY. Your borrows affect collateral ratios. Your LP positions determine spreads. ${d.totalTx} transactions of quietly running the ecosystem.`,
    keyInsights: [`${d.worth}: DeFi is partly running because of wallets like this`, `${d.protocolCount} protocols active — genuinely significant TVL contribution`, `${d.totalTx} transactions across a portfolio that actually affects prices`],
    riskFlags: ["Liquidation cascade risk: positions at this size can trigger protocol-level consequences", "Governance attack surface: large holders can be targets for governance manipulation"],
    analystNote: `${d.worth} of crypto conviction. The protocols thank you for the liquidity. So does the ecosystem. wagmi infrastructure provider.`,
  }),
  (d) => ({
    behaviorType: "Generational Wealth Candidate",
    summary: `${d.worth} on-chain and apparently fine with leaving it all visible on a public blockchain. Bold move. At this portfolio size, the OPSEC requirements are enterprise-grade, the tax implications are CPA-grade, and the roast material is limited because: ${d.worth}.`,
    keyInsights: [`${d.worth}: the kind of number where 'crypto' becomes 'asset management'`, `${d.totalTx} documented transactions — all on the public ledger, permanently`, `${d.ageYears.toFixed(1)} years to build to this — patience + conviction + execution`],
    riskFlags: [`On-chain visibility: ${d.worth} on a public address is known to everyone — including adversaries`, "Estate planning: crypto inheritance requires explicit planning that most don't do"],
    analystNote: `${d.worth} is generational if managed well. The chain has done its part. The rest is asset management. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Verified Crypto Success Story",
    summary: `${d.worth}. The roast: you should probably have more of it in cold storage. That's it. That's the only critique. Everything else about a ${d.worth} wallet with ${d.totalTx} transactions of history is a success story. Grudging respect, with security concerns.`,
    keyInsights: [`${d.worth} — documented, public, and correctly sized for crypto life-changing`, `${d.totalTx} transactions: the operational history of someone who knows what they're doing`, `${d.protocolCount} protocols: ${d.protocolCount > 5 ? "sophisticated multi-protocol management" : "focused strategy, clearly worked"}`],
    riskFlags: [`Hot wallet risk: ${d.worth} in a hot wallet is significant exposure to key compromise`, "Single point of failure: this much value in one address requires multi-sig"],
    analystNote: `${d.worth} says everything. The rest of this analysis is footnotes. wagmi — past tense, you already did.`,
  }),
  (d) => ({
    behaviorType: "Statistically Rare Outcome",
    summary: `${d.worth} in crypto. Statistically, you're in a very small percentile of on-chain wallets. The combination of timing, conviction, execution, and luck that produces a ${d.worth} wallet is genuinely rare. ${d.totalTx} transactions of evidence. Respect.`,
    keyInsights: [`${d.worth} — the outcome the ecosystem promises everyone and delivers to a few`, `${d.totalTx} transactions: a coherent strategy executed over time`, `${d.stablePct.toFixed(0)}% in stables: ${d.stablePct > 40 ? "securing gains — the intelligent move at this size" : "still running hot even at this size — conviction"}`],
    riskFlags: [`Reversion risk: the factors that produced ${d.worth} aren't guaranteed to hold`, `Size risk: at ${d.worth}, moves that were easy when small become market-moving`],
    analystNote: `${d.worth} wallet roasted with maximum respect. The algorithm doesn't know how to shade this. gm and wagmi.`,
  }),
];

// ─── General / Default — 24 roasts ───────────────────────────────────────────

export const generalRoasts: RoastFn[] = [
  (d) => ({
    behaviorType: "Committed Mid-Curve Participant",
    summary: `${d.totalTx} transactions, ${d.worth} portfolio, ${d.protocolCount > 0 ? `${d.protocolCount} protocols` : "no DeFi yet"}. Classic mid-tier crypto wallet energy — not a whale, not a tourist, just out here doing the thing. The blockchain has no notes, which means nothing crazy has happened. Yet.`,
    keyInsights: [`${d.worth} — not quit-your-job money yet, but definitely 'this is real' money`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols: ${d.topProtocol} leading — you've found your corner of DeFi` : "No DeFi exposure — pure holder, committed to the simple path"}`, `${d.stablePct.toFixed(0)}% stablecoins: ${d.stablePct > 40 ? "cautious allocation, probably smart" : "low stable buffer, running it hot"}`],
    riskFlags: [`${d.riskScore > 50 ? "Risk score elevated — the portfolio is taking on more risk than average" : "Risk profile reasonable for a mid-tier portfolio"}`],
    analystNote: "Solid wallet. Nothing insane, nothing embarrassing. The quiet ones either make it or they don't. 50/50 is great odds in crypto. gm.",
  }),
  (d) => ({
    behaviorType: "Standard Issue Degen",
    summary: `${d.worth} wallet, ${d.totalTx} transactions, ${d.ageYears.toFixed(1)} years in the game. The metrics say: doing the thing, learning as you go, not completely wrecked. The on-chain history tells a story of someone finding their way through the chaos one transaction at a time.`,
    keyInsights: [`${d.worth} — real money, real conviction, real exposure`, `${d.totalTx} txs over ${d.ageYears.toFixed(1)} years: ${(d.totalTx / Math.max(d.ageYears, 0.1)).toFixed(0)} transactions per year on average`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols explored — the DeFi journey has begun` : "Pre-DeFi portfolio — holding as the primary strategy"}`],
    riskFlags: [`${d.stablePct < 15 ? "Very low stablecoin buffer — no cushion if things go sideways" : "Stablecoin allocation provides some downside protection"}`],
    analystNote: "Standard. Not a compliment or an insult — just an observation. The standard is higher than you think. gm.",
  }),
  (d) => ({
    behaviorType: "Work In Progress",
    summary: `${d.ageYears.toFixed(1)} years on-chain, ${d.totalTx} transactions, ${d.worth} portfolio. The strategy isn't fully formed yet and that's fine. Most wallets that made it big looked exactly like this at this stage. Or they didn't. Honestly hard to tell from the outside.`,
    keyInsights: [`${d.worth}: real skin in the game, real learning budget`, `${d.totalTx} transactions: ${d.totalTx > 100 ? "active enough to be learning from real mistakes" : "early stage — the education is just beginning"}`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols touched — the DeFi education is happening` : "Pure holder for now — simple but honest"}`],
    riskFlags: [`${d.riskScore > 60 ? "Risk score is elevated for portfolio size — worth reviewing allocations" : "Risk is managed reasonably well at this stage"}`],
    analystNote: "Every large wallet started here. Or somewhere worse. The trajectory is what matters. gm, keep going.",
  }),
  (d) => ({
    behaviorType: "Honest Mid-Tier Investor",
    summary: `${d.worth} and ${d.totalTx} transactions. Not trying to flex, not trying to hide — just a regular crypto wallet doing regular crypto things. The on-chain data is exactly what it looks like: someone navigating this space with real money and real decisions.`,
    keyInsights: [`${d.worth}: enough to matter, enough to hurt if wrong`, `${d.totalTx} transactions of decision-making history, all on the record`, `${d.chainCount} chain${d.chainCount > 1 ? "s" : ""}: ${d.chainCount > 2 ? "multi-chain operator" : "focused approach"}`],
    riskFlags: [`${d.stablePct < 10 ? "Nearly all in risk assets — limited buffer for drawdowns" : "Reasonable stable allocation as a cushion"}`],
    analystNote: "The honest answer: this wallet is doing fine. Not great, not terrible. In crypto, fine is an underrated outcome. wagmi.",
  }),
  (d) => ({
    behaviorType: "Asymmetry Seeker",
    summary: `${d.totalTx} transactions spent looking for the asymmetric bet. ${d.worth} is the current score. ${d.protocolCount > 0 ? `${d.protocolCount} protocols explored in the search.` : "The search is still mostly in spot assets."} The bet is still open. The chain is patient.`,
    keyInsights: [`${d.worth}: the current result of ${d.totalTx} attempts to find asymmetry`, `${d.protocolCount > 0 ? `Protocol exploration: ${d.topProtocol} has been the main hunting ground` : "Spot-focused: the simple bets, held"}`, `${d.ageYears.toFixed(1)} years of searching — the best asymmetric bets don't announce themselves`],
    riskFlags: [`${d.riskScore > 55 ? "Risk score suggests some of those asymmetric bets are genuinely risky" : "Risk profile is controlled despite the exploratory approach"}`],
    analystNote: `The asymmetric bet eventually arrives for wallets that stay in the game. ${d.ageYears.toFixed(1)} years qualifies. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Quietly Compounding",
    summary: `${d.worth}, ${d.totalTx} transactions, ${d.ageYears.toFixed(1)} years. The kind of wallet that doesn't post on Twitter about it but is just... steadily doing the thing. No drama. No leverage blowups. No rugs (apparently). Just a wallet, accumulating experience and hopefully value.`,
    keyInsights: [`${d.worth}: the quiet accumulation portfolio`, `${d.totalTx} txs: consistent without being extreme`, `${d.stablePct.toFixed(0)}% stablecoins: ${d.stablePct > 25 ? "prudent reserves maintained" : "conviction expressed in full"}`],
    riskFlags: ["Low drama doesn't mean low risk — the boring-looking portfolios can be concentrated too"],
    analystNote: "The quiet compounders are the ones who actually make it. No tweet, no flex, just results. wagmi silently.",
  }),
  (d) => ({
    behaviorType: "Pragmatic On-Chain Participant",
    summary: `${d.totalTx} transactions, ${d.worth}, ${d.protocolCount} protocols. This wallet made choices. Some of those choices were great. Some were learning opportunities. The blockchain keeps all of them equally. The net result: ${d.worth} and counting.`,
    keyInsights: [`${d.worth} is the score after ${d.totalTx} choices`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols: a diversified approach to finding what works` : "Simple approach: hold the thing, wait for it to appreciate"}`, `${d.ageYears.toFixed(1)} years of market exposure — the knowledge is non-fungible`],
    riskFlags: [`${d.riskScore > 50 ? "Risk score above median — the portfolio is carrying real exposure" : "Risk managed — the choices have been relatively disciplined"}`],
    analystNote: "Pragmatic beats perfect in this game. The portfolio reflects reality. wagmi pragmatist.",
  }),
  (d) => ({
    behaviorType: "Crypto-Native Saver",
    summary: `${d.worth} on-chain, ${d.totalTx} transactions to get here. The traditional finance version of this would be a savings account with a very exciting statement. The crypto version has ${d.protocolCount} protocols, ${d.chainCount} chains, and several decisions that seemed fine at the time.`,
    keyInsights: [`${d.worth}: savings, but make it decentralized`, `${d.totalTx} transactions: more active than a savings account, about as profitable as a CD right now`, `${d.stablePct.toFixed(0)}% stables: ${d.stablePct > 30 ? "strong stable base — conservative but real" : "mostly risk assets — not saving, investing"}`],
    riskFlags: ["Smart contract risk is the bank run equivalent in DeFi — it happens fast when it happens"],
    analystNote: `The decentralized savings experiment continues. ${d.worth} says it's working so far. wagmi saver.`,
  }),
  (d) => ({
    behaviorType: "Protocol Explorer",
    summary: `${d.protocolCount > 0 ? `${d.protocolCount} protocols explored, ${d.totalTx} transactions across ${d.chainCount} chain${d.chainCount > 1 ? "s" : ""}, ${d.worth} result` : `${d.totalTx} transactions, ${d.worth} result, zero DeFi protocols`}. The on-chain curriculum vitae of someone learning the ecosystem by using it. Expensive education. Comprehensive coverage. Real skin in the game.`,
    keyInsights: [`${d.protocolCount > 0 ? `${d.protocolCount} protocols: ${d.topProtocol} at the top — you've found the main venue` : "No DeFi yet — the explorer phase hasn't started or you prefer simplicity"}`, `${d.totalTx} transactions: enough to have made real mistakes and real progress`, `${d.worth}: the net result of the educational program`],
    riskFlags: ["Protocol risk: every new protocol is an untested smart contract until it isn't", `${d.riskScore > 55 ? "Risk score suggests the exploration has included some risky territory" : "Risk profile is reasonable for the exploratory strategy"}`],
    analystNote: `The explorer's dilemma: you have to try things to know what works, but trying costs gas. ${d.worth} is a reasonable tuition. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Conviction Trader",
    summary: `${d.totalTx} transactions means you have views and you act on them. ${d.worth} is what those views have produced. ${d.ageYears.toFixed(1)} years of conviction, documented on-chain, available for all to analyze. The track record is public. The future is private.`,
    keyInsights: [`${d.totalTx} transactions: decisions made with real money in real time`, `${d.worth}: the score so far`, `${d.protocolCount > 0 ? `${d.topProtocol} is where the main thesis lives` : "Spot trading is the thesis — simple and honest"}`],
    riskFlags: [`Conviction risk: being right for ${d.ageYears.toFixed(1)} years can make the wrong call feel impossible`, `${d.stablePct < 15 ? "Fully deployed conviction — no cushion if the thesis reverses" : "Maintaining some dry powder — disciplined conviction"}`],
    analystNote: "Conviction without humility is just stubbornness. With humility, it's a strategy. This wallet seems to understand the difference. wagmi.",
  }),
  (d) => ({
    behaviorType: "Long Game Player",
    summary: `${d.ageYears.toFixed(1)} years. ${d.worth}. ${d.totalTx} transactions. This is not a short-term trade — this is a life thesis expressed in transactions. The long game is, by definition, still being played. Current score: ${d.worth}. Time remaining: unknown but substantial.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years in: the compounding has started, the patience is established`, `${d.totalTx} transactions: enough to have a history without overdoing it`, `${d.stablePct.toFixed(0)}% stablecoins: ${d.stablePct > 35 ? "protecting the base while playing the long game" : "fully committed to the long-term risk assets"}`],
    riskFlags: ["Long-game requires staying solvent through short-term volatility — the stable allocation matters here"],
    analystNote: `The long game is the only game that statistically works in crypto. ${d.ageYears.toFixed(1)} years in. Keep playing. wagmi.`,
  }),
  (d) => ({
    behaviorType: "Respectably Average",
    summary: `${d.worth}, ${d.totalTx} transactions, ${d.ageYears.toFixed(1)} years. Average for crypto means you're ahead of 99% of the general population in terms of self-custody and on-chain experience. Context matters. Relative to other crypto wallets: solidly mid. Relative to everyone else: already in the 1%.`,
    keyInsights: [`${d.worth}: above average for crypto; extraordinary for traditional finance`, `${d.totalTx} transactions: enough to know what you're doing`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols: actively using the ecosystem` : "Simple approach: the sophistication is in the simplicity"}`],
    riskFlags: ["Complacency risk: 'average for crypto' can mean 'taking on more risk than you think'"],
    analystNote: `Average is underselling it. ${d.worth} in self-custody crypto puts you ahead of almost everyone. wagmi, quietly.`,
  }),
  (d) => ({
    behaviorType: "The Setup Looks Right",
    summary: `${d.totalTx} transactions, ${d.worth}, ${d.protocolCount} protocols, ${d.ageYears.toFixed(1)} years in. The setup looks right. The conditions are present. The missing variable is the next big move in the right direction. Which is either imminent or years away. Classic crypto setup.`,
    keyInsights: [`${d.worth}: the base is built`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols in play: positioned for yield and growth` : "Spot heavy: positioned for price appreciation"}`, `${d.totalTx} transactions of experience: knows how to execute when the opportunity arrives`],
    riskFlags: [`${d.riskScore > 50 ? "Risk score elevated — make sure the setup survives the setup" : "Risk controlled — the position can hold through volatility"}`],
    analystNote: "The setup looks right is what they say before it goes right and before it goes wrong. Position accordingly. LFG.",
  }),
  (d) => ({
    behaviorType: "Steady State Operator",
    summary: `${d.worth} wallet, operating steadily, no obvious disasters. ${d.totalTx} transactions over ${d.ageYears.toFixed(1)} years suggests a thoughtful pace — not panic buying, not panic selling, just moving through the ecosystem with intention. The blockchain approves.`,
    keyInsights: [`${d.worth}: the result of steady state operation over ${d.ageYears.toFixed(1)} years`, `${(d.totalTx / Math.max(d.ageYears, 0.1)).toFixed(0)} transactions per year: deliberate, not reactive`, `${d.stablePct.toFixed(0)}% stablecoins: ${d.stablePct > 20 ? "maintaining reserves — disciplined" : "deployed capital — confident"}`],
    riskFlags: ["Steady state can mask slow drift in risk profile — worth reviewing regularly"],
    analystNote: `Steady wins in crypto more often than the timeline makes it look. ${d.worth} is the proof. wagmi steady.`,
  }),
  (d) => ({
    behaviorType: "Methodical Accumulator",
    summary: `${d.totalTx} transactions, ${d.worth}, ${d.ageYears.toFixed(1)} years of accumulation. The method is clear: keep going. The accumulation is documented. The timeline is longer than most people's attention spans, which is probably why it's working. The blockchain respects commitment.`,
    keyInsights: [`${d.worth}: accumulated deliberately over ${d.ageYears.toFixed(1)} years`, `${d.totalTx} transactions: the paper trail of methodical strategy`, `${d.protocolCount > 0 ? `${d.protocolCount} yield sources identified: the accumulation is compounding` : "Spot accumulation: clean and simple"}`],
    riskFlags: [`${d.stablePct < 15 ? "Low stable buffer on an accumulation strategy — consider building a cushion" : "Good stable allocation protecting the accumulation base"}`],
    analystNote: `The accumulation phase ends when you decide it does. ${d.worth} is a solid base. wagmi accumulator.`,
  }),
  (d) => ({
    behaviorType: "Unkillable Participant",
    summary: `${d.ageYears.toFixed(1)} years through everything the market has thrown, and the wallet still has ${d.worth} and ${d.totalTx} transactions to show for it. You didn't get liquidated. You didn't get rugged (or recovered). You didn't exit in despair. That alone puts you ahead.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years: outlasted multiple bear markets, FUD campaigns, and industry drama`, `${d.totalTx} transactions: consistent engagement through everything`, `${d.worth}: proof of survival and some measure of success`],
    riskFlags: ["Survivor bias: having made it this far can create false confidence about future cycles"],
    analystNote: `Not getting wrecked in crypto is genuinely hard. ${d.ageYears.toFixed(1)} years of it is notable. wagmi by virtue of not quitting.`,
  }),
  (d) => ({
    behaviorType: "Calculated Risk Taker",
    summary: `${d.worth}, risk score ${d.riskScore}/100, ${d.protocolCount} protocols. The risk is real and the wallet has chosen to take it. ${d.totalTx} transactions of calculated exposure. Whether the calculation is correct is still being determined. The thesis is live.`,
    keyInsights: [`${d.worth} at risk score ${d.riskScore}/100: real exposure, intentional`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols: the risk is distributed but present` : "Risk concentrated in spot assets — clean exposure"}`, `${d.totalTx} transactions: ${d.totalTx > 200 ? "active risk manager" : "deliberate risk taker"}`],
    riskFlags: [`Risk score ${d.riskScore}/100: ${d.riskScore > 60 ? "elevated — make sure the upside justifies it" : "manageable — the position sizing seems reasonable"}`],
    analystNote: `Risk taken intentionally is the basis of every good return. ${d.riskScore}/100 is the price of the bet. wagmi on the outcome.`,
  }),
  (d) => ({
    behaviorType: "Still In The Game",
    summary: `${d.ageYears.toFixed(1)} years, ${d.totalTx} transactions, ${d.worth}. Many who started around the same time are no longer in the game — wrecked, exited, or disillusioned. This wallet is still here. That's the first criterion. Everything else is upside.`,
    keyInsights: [`${d.ageYears.toFixed(1)} years: in the game longer than most participants last`, `${d.totalTx} transactions: hasn't given up even when it was probably tempting`, `${d.worth}: proof of continued participation and some accumulation`],
    riskFlags: ["Longevity can breed overconfidence — the game changes, and so does the risk"],
    analystNote: `Still in the game after ${d.ageYears.toFixed(1)} years. That's the real flex. wagmi — past tense already applies.`,
  }),
  (d) => ({
    behaviorType: "Perpetual Beta Tester",
    summary: `${d.protocolCount} protocols, ${d.totalTx} transactions, ${d.worth} portfolio. You've been testing the boundaries of what DeFi can do, one transaction at a time. Some experiments worked. The blockchain remembers all of them. The scars are in the gas fees.`,
    keyInsights: [`${d.protocolCount > 0 ? `${d.protocolCount} protocols: a comprehensive testing portfolio` : "Testing has been limited — the beta phase is optional"}`, `${d.totalTx} transactions of empirical DeFi research`, `${d.worth}: the net result of the experimental portfolio`],
    riskFlags: ["Experimental approaches by definition carry experimental risk", "New protocols are unaudited until they survive in production — you've been the test"],
    analystNote: "Beta testing DeFi with real money is how the ecosystem gets better. Your gas fees are R&D. wagmi researcher.",
  }),
  (d) => ({
    behaviorType: "Real Money, Real Lessons",
    summary: `${d.worth} portfolio, ${d.totalTx} transactions, ${d.ageYears.toFixed(1)} years of real money on the line. Not paper trading. Not hypotheticals. Real decisions with real consequences, documented permanently on a public ledger. The education has been expensive. The education has been real.`,
    keyInsights: [`${d.worth}: the P&L of ${d.totalTx} real-money decisions`, `${d.ageYears.toFixed(1)} years of market exposure — no simulations`, `${d.protocolCount > 0 ? `${d.protocolCount} protocols providing real-world DeFi education` : "Spot market education — the fundamentals"}`],
    riskFlags: ["Real money risk is the only risk that teaches real lessons — this wallet has paid tuition"],
    analystNote: `The lessons from real money are the only ones that stick. ${d.worth} says the student is still solvent. wagmi learner.`,
  }),
  (d) => ({
    behaviorType: "Position Holder",
    summary: `${d.worth} held with ${d.totalTx} transactions of conviction. Not everything in crypto requires constant action. Sometimes the position is hold, the strategy is wait, and the execution is simply not to do anything stupid. ${d.ageYears.toFixed(1)} years of avoiding the stupid thing.`,
    keyInsights: [`${d.worth}: the reward for consistent non-stupidity over ${d.ageYears.toFixed(1)} years`, `${d.totalTx} transactions: disciplined number, not reactive`, `${d.stablePct.toFixed(0)}% stables: ${d.stablePct > 30 ? "proper position sizing with reserves" : "fully in the position, minimal buffer"}`],
    riskFlags: ["Holding requires the position to still be valid — worth checking the thesis periodically"],
    analystNote: `Holding is the hardest strategy to execute and the easiest to describe. ${d.worth} is proof it can work. wagmi holder.`,
  }),
  (d) => ({
    behaviorType: "Self-Custody Advocate",
    summary: `${d.worth} in self-custody. Not on Binance. Not on Coinbase. On a blockchain you control (seed phrase dependent). ${d.totalTx} transactions of sovereign financial participation. Not your keys, not your coins — and this wallet has keys.`,
    keyInsights: [`${d.worth} in proper self-custody: already doing what most crypto users haven't figured out`, `${d.totalTx} transactions: real on-chain activity, not just CEX account history`, `${d.ageYears.toFixed(1)} years of holding their own keys — that's ${d.ageYears.toFixed(1)} years of FTX not being able to touch it`],
    riskFlags: ["Key management is now the full responsibility of this wallet — no customer support", "The decentralization is great until the seed phrase is lost"],
    analystNote: `Self-custody is the whole point of crypto. ${d.worth} is yours in the truest sense. Protect the seed phrase accordingly. wagmi.`,
  }),
  (d) => ({
    behaviorType: "The Average That Isn't Average",
    summary: `${d.worth} wallet running ${d.totalTx} transactions over ${d.ageYears.toFixed(1)} years. Looks ordinary from the outside. But 'ordinary crypto wallet' means on-chain since before most people knew what a wallet was, managing real money in a system that didn't exist ${d.ageYears.toFixed(1)} years ago. Ordinary is relative.`,
    keyInsights: [`${d.worth}: relative to crypto, mid; relative to the world, extraordinary`, `${d.totalTx} transactions: participated in the actual financial experiment, not just read about it`, `${d.ageYears.toFixed(1)} years: witnessed and participated in the entire narrative arc`],
    riskFlags: ["The experiment is ongoing — participation continues to carry real risk"],
    analystNote: "The average crypto wallet is extraordinary by any other measure. wagmi, average crypto participant. gm.",
  }),
];

// ─── Selector ─────────────────────────────────────────────────────────────────

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function selectRoast(d: RoastData): AIAnalysis {
  // Match the dominant archetype and pick randomly within it
  if (d.stablePct > 65) return pick(stablecoinRoasts)(d);
  if (d.totalTx < 15) return pick(ghostRoasts)(d);
  if (d.nftCount > 15) return pick(nftRoasts)(d);
  if (d.chainCount >= 4) return pick(chainTouristRoasts)(d);
  if (d.totalTx > 800) return pick(gasPhilanthropistRoasts)(d);
  if (d.netWorthUsd > 1_000_000) return pick(whaleRoasts)(d);
  if (d.ageYears > 4 && d.netWorthUsd < 50_000) return pick(forgottenOgRoasts)(d);
  return pick(generalRoasts)(d);
}

export const TOTAL_ROASTS =
  stablecoinRoasts.length +
  ghostRoasts.length +
  nftRoasts.length +
  chainTouristRoasts.length +
  gasPhilanthropistRoasts.length +
  forgottenOgRoasts.length +
  whaleRoasts.length +
  generalRoasts.length;
