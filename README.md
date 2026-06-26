# OnchainAI

AI-powered crypto wallet analyzer that roasts your on-chain behavior. Paste any Ethereum or Solana address — get token balances, DeFi positions, risk scoring, a brutally honest AI personality profile, a time machine of your trading history, and head-to-head wallet comparisons.

**Live:** [onchainai.vercel.app](https://onchainai.vercel.app)

---

## Features

- **Multi-chain** — Ethereum, Base, Arbitrum, Solana (+ ENS resolution)
- **Full portfolio** — token balances, DeFi positions (Aave, Uniswap), NFT holdings
- **Risk scoring** — concentration, leverage, bridge exposure, smart contract risk
- **AI roast** — Claude Haiku generates a savage-but-accurate wallet personality profile
- **⏳ Wallet Time Machine** — AI narrates your best trade, worst trade, biggest regret, and survival instincts
- **⚔️ Compare two wallets** — head-to-head breakdown of risk tolerance, NFT taste, DeFi behavior, chain preferences, and a verdict
- **104 mock roasts** — data-driven fallback library across 8 archetypes when API is unavailable
- **🤖 Smart Wallet Explorer** — ERC-4337 detection, paymaster decoding, gas sponsorship breakdown, factory ID
- **Share / Tweet** — one-click sharing with per-wallet OG images
- **24h cache** — in-memory cache with 500-entry FIFO to minimize API costs

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Plain CSS variables (no Tailwind) |
| ETH data | Alchemy SDK — tokens, NFTs, transactions, ENS |
| Solana data | Helius API — SPL tokens, transactions, NFTs |
| DeFi positions | The Graph — Aave V3, Uniswap V3 subgraphs |
| Prices | CoinGecko — spot prices + 30-day history (DeFiLlama fallback) |
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
     → GET  /api/ens?name=          (ENS resolution)
     → POST /api/analyze
       → 24h in-memory cache (500 entries FIFO)
       → Wallet Orchestrator
         ├── Alchemy SDK     (ETH tokens, NFTs, txns, ENS)
         ├── Helius API      (Solana tokens, NFTs, txns)
         ├── The Graph       (Aave V3 + Uniswap V3 positions)
         ├── CoinGecko       (prices, 30-day history)
         ├── DeFiLlama       (price fallback)
         └── Etherscan       (wallet age fallback)
       → Classifiers         (tags, sophistication score, risk profile)
       → Claude Haiku API    (roast + time machine) or fallback
     → POST /api/compare
       → Runs two wallet profiles in parallel
       → Claude Haiku API    (head-to-head comparison narrative)
     → Dashboard UI
     → /analysis/[address]/opengraph-image (edge, per-wallet OG)
     → POST /api/smart-wallet
       → Alchemy Base RPC  (eth_getCode + alchemy_getUserOperationsByAccount)
       → Claude Haiku API  (smart wallet narrative)
     → /smart-wallet/[address] UI
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
│   ├── compare/
│   │   ├── page.tsx                          # Compare entry — two address inputs
│   │   └── [addr1]/[addr2]/page.tsx          # Compare results page
│   ├── smart-wallet/
│   │   ├── page.tsx                          # Smart Wallet Explorer entry
│   │   └── [address]/page.tsx               # Smart Wallet results
│   └── api/
│       ├── analyze/route.ts                  # Main analysis endpoint
│       ├── compare/route.ts                  # Compare two wallets endpoint
│       ├── smart-wallet/route.ts             # ERC-4337 smart wallet analysis
│       └── ens/route.ts                      # ENS → address resolution
├── lib/
│   ├── types.ts                              # All TypeScript interfaces
│   ├── orchestrator.ts                       # Data aggregation pipeline
│   ├── classifiers.ts                        # Tag/risk/sophistication scoring
│   ├── cache.ts                              # In-memory 24h / 500-entry cache
│   ├── providers/
│   │   ├── alchemy.ts                        # ETH tokens, NFTs, transactions
│   │   ├── helius.ts                         # Solana tokens, NFTs, transactions
│   │   ├── thegraph.ts                       # Aave V3 + Uniswap V3 positions
│   │   ├── coingecko.ts                      # Prices + price history (DeFiLlama fallback)
│   │   ├── erc4337.ts                        # ERC-4337 UserOp + paymaster decoding on Base
│   │   └── etherscan.ts                      # Wallet age
│   └── ai/
│       ├── narrator.ts                       # Claude API roast + fallback routing
│       ├── timeMachine.ts                    # Claude API time machine narrative
│       ├── compareWallets.ts                 # Claude API head-to-head comparison
│       ├── smartWalletNarrator.ts            # Claude API smart wallet narrative
│       └── roastLibrary.ts                   # 104 data-driven roast templates
├── components/
│   ├── SmartWalletView.tsx                   # ERC-4337 explorer UI
│   ├── WalletHeader.tsx                      # Address, ENS, tags, sophistication
│   ├── MetricGrid.tsx                        # Net worth, age, tx count, protocols
│   ├── NetWorthChart.tsx                     # 30-day portfolio trend
│   ├── RiskTable.tsx                         # Risk profile breakdown
│   ├── AIInsightCard.tsx                     # Roast card + quota error state
│   ├── TimeMachine.tsx                       # Best trade / worst trade / regret / survival
│   ├── CompareView.tsx                       # Head-to-head wallet comparison UI
│   ├── ProtocolChart.tsx                     # Protocol interaction breakdown
│   ├── StablecoinPanel.tsx                   # Stablecoin allocation
│   ├── ChainBreakdown.tsx                    # Multi-chain distribution
│   ├── TokenHoldings.tsx                     # Token list
│   ├── NftHoldings.tsx                       # NFT collections
│   ├── DeFiPositions.tsx                     # Aave/Uniswap positions
│   ├── TransactionTimeline.tsx               # Recent transactions (chain-aware explorer links)
│   └── DashboardSkeleton.tsx                 # Loading skeleton
└── __tests__/                                # Jest test suite
```

---

## AI Features

### Roast
Claude Haiku generates a fresh personality roast from live wallet data. Prompt enforces specific numbers, crypto slang, and a unique `behaviorType` nickname. Falls back to 104 hand-written roast templates across 8 archetypes when API is unavailable.

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

### Wallet Time Machine
AI narrates four chapters of the wallet's on-chain story using portfolio data: **best trade**, **worst trade**, **biggest regret**, and **survival instincts**. Falls back to data-driven templates when API is unavailable.

### Compare Two Wallets
Submit two addresses at `/compare` — the app fetches both profiles in parallel, generates individual roasts, then runs a head-to-head AI breakdown across risk tolerance, NFT taste, DeFi behavior, chain preferences, and a final verdict.

---

## Quota Handling

If the Anthropic API returns a 429 (quota exceeded), `AIInsightCard` shows a friendly amber banner instead of silently falling back — so users know the roast is temporarily unavailable, not missing.

---

## Deploying to Vercel

```bash
npx vercel deploy --prod
```

Add all env vars in the Vercel dashboard: Project → Settings → Environment Variables.

`app/api/analyze/route.ts` and `app/api/compare/route.ts` both set `maxDuration = 60` to handle slow blockchain API responses on Vercel hobby.

---

## Cost Estimate

At 1,000 analyses/month with 24h caching (real-world unique requests ~300/month):

| Service | Cost |
|---------|------|
| Alchemy (free tier) | $0 |
| Helius (free tier) | $0 |
| The Graph (hosted) | $0 |
| CoinGecko (free tier) | $0 |
| DeFiLlama | $0 |
| Anthropic Claude Haiku | ~$0.75 |
| Vercel (hobby) | $0 |
| **Total** | **~$0.75/mo** |

> Switched from Claude Sonnet to Haiku (10× cheaper) and extended cache from 1h to 24h. The mock roast library means quota exhaustion never breaks the user experience.

---

## Running Tests

```bash
npm test              # all tests
npm test -- --watch   # watch mode
npm test -- --coverage
```
