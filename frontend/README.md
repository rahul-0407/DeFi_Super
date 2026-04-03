# 🏛 Pareto Terminal — Frontend

The decentralized user interface for the Pareto Protocol, built with Next.js, wagmi, and RainbowKit.

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- Environment variables configured (see `.env.example`)

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 📁 Structure

- `src/app/` — Next.js App Router pages and layouts.
- `src/components/` — Reusable React components (shadcn/ui + custom).
- `src/contracts/` — ABIs and Sepolia contract addresses.
- `src/providers/` — Wagmi, QueryClient, and Auth providers.
- `src/lib/` — Shared utilities and constants.

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Web3**: wagmi, viem, RainbowKit
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Authentication**: Supabase (Google OAuth)

## 📖 Main Documentation

For the full protocol overview, smart contract details, and system architecture, please refer to the [Root README](../README.md).
