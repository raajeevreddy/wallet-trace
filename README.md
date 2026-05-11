# Wallet Trace

Institutional-grade AI wallet analysis. Paste any Ethereum address, get a Bloomberg-style report in seconds.

## Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Charts**: Recharts
- **Blockchain data**: Alchemy SDK (ETH/Base/Arbitrum), DeBank API, Etherscan
- **AI**: Anthropic Claude API
- **Deploy**: Vercel

---

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and fill in your keys:

| Variable | Where to get it | Required? |
|----------|-----------------|-----------|
| `ALCHEMY_API_KEY` | [dashboard.alchemy.com](https://dashboard.alchemy.com) | ✅ Yes |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) | ✅ Yes |
| `DEBANK_API_KEY` | [cloud.debank.com](https://cloud.debank.com) | Optional* |
| `ETHERSCAN_API_KEY` | [etherscan.io/apis](https://etherscan.io/apis) | Optional* |

> *The app runs without DeBank/Etherscan — those providers have mock fallbacks. But DeBank is strongly recommended for accurate protocol detection.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Architecture

```
User → Next.js App Router
     → POST /api/analyze
       → Wallet Orchestrator
         ├── Alchemy SDK (transactions, balances, ENS)
         ├── DeBank API (protocols, portfolio)
         └── Etherscan (wallet age fallback)
       → Classifiers (tags, sophistication, risk)
       → Claude API (narrative generation)
     → Dashboard UI
```

## Project Structure

```
├── app/
│   ├── page.tsx                    # Homepage
│   ├── analysis/[address]/page.tsx # Dashboard
│   └── api/analyze/route.ts        # Main API endpoint
├── lib/
│   ├── types.ts                    # All TypeScript types
│   ├── orchestrator.ts             # Data aggregation
│   ├── classifiers.ts              # Heuristic scoring
│   ├── providers/
│   │   ├── alchemy.ts
│   │   ├── debank.ts
│   │   └── etherscan.ts
│   └── ai/
│       └── narrator.ts             # Claude API integration
└── components/
    ├── WalletHeader.tsx
    ├── MetricGrid.tsx
    ├── ProtocolChart.tsx
    ├── StablecoinPanel.tsx
    ├── ChainBreakdown.tsx
    ├── RiskTable.tsx
    ├── AIInsightCard.tsx
    └── DashboardSkeleton.tsx
```

---

## Deploying to Vercel

```bash
npx vercel deploy
```

Add all env vars in the Vercel dashboard under Project → Settings → Environment Variables.

The `app/api/analyze/route.ts` sets `maxDuration = 60` to handle slow blockchain API responses on Vercel's serverless functions.

---

## Adding a new blockchain data provider

1. Create `lib/providers/yourprovider.ts`
2. Export typed async functions
3. Add calls in `lib/orchestrator.ts`
4. Merge data into `WalletProfile`

## Improving the AI narrative

Edit `lib/ai/narrator.ts`:
- Modify `SYSTEM_PROMPT` to change analyst persona
- Modify `buildPrompt()` to include more data fields
- Adjust `max_tokens` for longer reports

---

## Cost estimate

At 1,000 analyses/month:

| Service | Cost |
|---------|------|
| Alchemy (free tier) | $0 |
| DeBank API | ~$20 |
| Anthropic Claude Sonnet | ~$9 |
| Vercel (hobby) | $0 |
| **Total** | **~$29/mo** |
