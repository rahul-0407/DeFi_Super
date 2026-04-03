# 🏺 Pareto Terminal — Subgraph

The indexing layer for the Pareto Protocol, built with [The Graph](https://thegraph.com/).

## 🚀 Setup

### Prerequisites

- [Graph CLI](https://thegraph.com/docs/en/developing/graph-cli/) installed globaly: `npm install -g @graphprotocol/graph-cli`

### Installation

```bash
cd subgraph
npm install
```

### Deployment

1. **Codegen**: Generate AssemblyScript types from the GraphQL schema and ABIs.

   ```bash
   npm run codegen
   ```

2. **Build**: Compile the subgraph.

   ```bash
   npm run build
   ```

3. **Deploy**: Deploy to a Graph node or hosted service.
   ```bash
   npm run deploy
   ```

## 📊 Monitored Events

The subgraph indexes the following protocol events for the Analytics Dashboard:

- `PositionUpdated` (Lending/Borrowing)
- `LiquidationExecuted` (Lending)
- `Swap` (AMM)
- `FlashLoanExecuted` (Flash Loans)
- `Sync` (AMM Reserves)

## 📁 Structure

- `schema.graphql` — Defines the indexed data entities (TVL, Volume, Fees, Positions).
- `subgraph.yaml` — Mapping of contract addresses and event handlers.
- `src/` — AssemblyScript mapping logic.
- `abis/` — Smart contract JSON interfaces.
