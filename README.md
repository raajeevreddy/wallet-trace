# Wallet Trace

AI-powered crypto wallet analyzer that roasts your on-chain behavior. Paste any Ethereum or Solana address — get token balances, DeFi positions, risk scoring, and a brutally honest AI personality profile.

**Live:** [walletrace.vercel.app](https://walletrace.vercel.app)

---

## Features

- **Multi-chain** — Ethereum, Base, Arbitrum, Solana (+ ENS resolution)
- **Full portfolio** — token balances, DeFi positions (Aave, Uniswap), NFT holdings
- **Risk scoring** — concentration, leverage, bridge exposure, smart contract risk
- **AI roast** — Claude Haiku generates a savage-but-accurate wallet personality profile
- **104 mock roasts** — data-driven fallback library across 8 archetypes when API is unavailable
- **Share / Tweet** — one-click sharing with per-wallet OG images
- **24h cache** — in-memory cache with 500-entry FIFO to minimize API costs
- **Recent searches** — persisted in localStorage

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Plain CSS variables (no Tailwind) |
| ETH data | Alchemy SDK — tokens, NFTs, transactions, ENS |
| Solana data | Helius API — SPL tokens, transactions, NFTs |
| DeFi positions | The Graph — Aave V3, Uniswap V3 subgraphs |
| Prices | CoinGecko — spot prices + 30-day history |
| Wallet age | Etherscan — first transaction timestamp |
| AI | Anthropic Claude Haiku (`claude-haiku-4-5-20251001`) |
| OG images | Next.js `ImageResponse` (edge runtime) |
| Deploy | Vercel |
| Tests | Jest |

---

## Local Setup

### 1. Install

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Where to get it | Required? |
|----------|-----------------|-----------|
| `ALCHEMY_API_KEY` | [dashboard.alchemy.com](https://dashboard.alchemy.com) | ✅ ETH analysis |
| `HELIUS_API_KEY` | [helius.dev](https://helius.dev) | ✅ Solana analysis |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | Optional — falls back to 104 mock roasts |
| `ETHERSCAN_API_KEY` | [etherscan.io/apis](https://etherscan.io/apis) | Optional — improves wallet age detection |
| `COINGECKO_API_KEY` | [coingecko.com/en/api](https://www.coingecko.com/en/api/pricing) | Optional — removes free-tier rate limits |

> Without `ANTHROPIC_API_KEY` the app still works — it selects a roast from the 104-entry mock library based on the wallet's dominant trait.

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
User → Next.js App Router
     → GET /api/ens?name=   (ENS resolution)
     → POST /api/analyze
       → 24h in-memory cache (500 entries FIFO)
       → Wallet Orchestrator
         ├── Alchemy SDK     (ETH tokens, NFTs, txns, ENS)
         ├── Helius API      (Solana tokens, NFTs, txns)
         ├── The Graph       (Aave V3 + Uniswap V3 positions)
         ├── CoinGecko       (prices, 30-day history)
         └── Etherscan       (wallet age fallback)
       → Classifiers         (tags, sophistication score, risk profile)
       → Claude Haiku API    (roast narrative) or roastLibrary fallback
     → Dashboard UI
     → /analysis/[address]/opengraph-image (edge, per-wallet OG)
```

---

## Project Structure

```
├── app/
│   ├── page.tsx                              # Home — search + examples
│   ├── layout.tsx                            # Root layout + Vercel Analytics
│   ├── analysis/
│   │   └── [address]/
│   │       ├── page.tsx                      # Wallet dashboard
│   │       └── opengraph-image.tsx           # Per-wallet OG image (edge)
│   └── api/
│       ├── analyze/route.ts                  # Main analysis endpoint
│       └── ens/route.ts                      # ENS → address resolution
├── lib/
│   ├── types.ts                              # All TypeScript interfaces
│   ├── orchestrator.ts                       # Data aggregation pipeline
│   ├── classifiers.ts                        # Tag/risk/sophistication scoring
│   ├── cache.ts                              # In-memory 24h / 500-entry cache
│   ├── recentWallets.ts                      # localStorage recent searches
│   ├── providers/
│   │   ├── alchemy.ts                        # ETH tokens, NFTs, transactions
│   │   ├── helius.ts                         # Solana tokens, NFTs, transactions
│   │   ├── thegraph.ts                       # Aave V3 + Uniswap V3 positions
│   │   ├── coingecko.ts                      # Prices + price history
│   │   └── etherscan.ts                      # Wallet age
│   └── ai/
│       ├── narrator.ts                       # Claude API + fallback routing
│       └── roastLibrary.ts                   # 104 data-driven roast templates
├── components/
│   ├── WalletHeader.tsx                      # Address, ENS, tags, sophistication
│   ├── MetricGrid.tsx                        # Net worth, age, tx count, protocols
│   ├── NetWorthChart.tsx                     # 30-day portfolio trend
│   ├── RiskTable.tsx                         # Risk profile breakdown
│   ├── AIInsightCard.tsx                     # Roast card + quota error state
│   ├── ProtocolChart.tsx                     # Protocol interaction breakdown
│   ├── StablecoinPanel.tsx                   # Stablecoin allocation
│   ├── ChainBreakdown.tsx                    # Multi-chain distribution
│   ├── TokenHoldings.tsx                     # Token list
│   ├── NftHoldings.tsx                       # NFT collections
│   ├── DeFiPositions.tsx                     # Aave/Uniswap positions
│   ├── TransactionTimeline.tsx               # Recent transactions (chain-aware explorer links)
│   └── DashboardSkeleton.tsx                 # Loading skeleton
└── __tests__/                                # Jest test suite (287 tests)
```

---

## AI Roast System

The roast system has two layers:

**1. Live generation** — When `ANTHROPIC_API_KEY` is set, Claude Haiku generates a fresh roast from the wallet's actual data. Prompt enforces specific numbers ("your 73% stablecoin bag"), crypto slang, and a unique `behaviorType` nickname.

**2. Mock library fallback** — `lib/ai/roastLibrary.ts` contains 104 hand-written roast templates across 8 archetypes. Selected by matching the wallet's dominant trait, then randomly picking within the archetype (so repeat analyses feel different):

| Archetype | Trigger | Roasts |
|-----------|---------|--------|
| Stablecoin Bunker | stablecoins > 65% | 16 |
| Ghost Wallet | transactions < 15 | 14 |
| JPEG Archaeologist | NFTs > 15 | 12 |
| Omnichained Tourist | chains ≥ 4 | 10 |
| Gas Philanthropist | transactions > 800 | 10 |
| Forgotten OG | age > 4yr + worth < $50K | 10 |
| Whale | net worth > $1M | 8 |
| General | everything else | 24 |

To add roasts: append new `RoastFn` entries to the relevant array in `roastLibrary.ts`.

To change the AI persona: edit `SYSTEM_PROMPT` in `narrator.ts`.

---

## Quota Handling

If the Anthropic API returns a 429 (quota exceeded), `AIInsightCard` shows a friendly amber banner instead of silently falling back — so users know the roast is temporarily unavailable, not missing.

---

## Deploying to Vercel

```bash
npx vercel deploy
```

Add all env vars in the Vercel dashboard: Project → Settings → Environment Variables.

`app/api/analyze/route.ts` sets `maxDuration = 60` to handle slow blockchain API responses on Vercel hobby.

---

## Cost Estimate

At 1,000 analyses/month with 24h caching (real-world unique requests ~300/month):

| Service | Cost |
|---------|------|
| Alchemy (free tier) | $0 |
| Helius (free tier) | $0 |
| The Graph (hosted) | $0 |
| CoinGecko (free tier) | $0 |
| Anthropic Claude Haiku | ~$0.75 |
| Vercel (hobby) | $0 |
| **Total** | **~$0.75/mo** |

> Switched from Claude Sonnet to Haiku (10× cheaper) and extended cache from 1h to 24h. The mock roast library means quota exhaustion never breaks the user experience.

---

## Running Tests

```bash
npm test              # all 287 tests
npm test -- --watch   # watch mode
npm test -- --coverage
```
