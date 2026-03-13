# Polygon Deployment Guide

This guide explains how to deploy the DeFi Super contracts to the **Polygon Mainnet** and integrate them into the frontend.

---

## 1. Prerequisites

- **Foundry Installed**: Ensure you have `forge` and `cast` available.
- **Wallet with MATIC**: You need a deployer wallet with sufficient MATIC for gas.
- **Polygonscan API Key**: For contract verification.
- **RPC URL**: Use a provider like Alchemy, Infura, or the public `https://polygon-rpc.com`.

---

## 2. Environment Configuration

The deployment script `script/Deploy.s.sol` requires several environment variables to correctly initialize the contracts. Create a script or set these in your terminal:

```bash
# Networking
export RPC_URL="https://polygon-amoy.g.alchemy.com/v2/gvSAhY8S8dFMTxxMZBZCG"
export DEPLOYER_PRIVATE_KEY="0x..."
export POLYGONSCAN_API_KEY="your_api_key_here"

# Token Addresses (Polygon Mainnet Examples)
export TOKEN0_ADDRESS="0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619" # WETH
export TOKEN1_ADDRESS="0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359" # USDC (Native)
export COLLATERAL_TOKEN=$TOKEN0_ADDRESS
export BORROW_TOKEN=$TOKEN1_ADDRESS
export STAKING_TOKEN=$TOKEN0_ADDRESS
export REWARD_TOKEN="0x..." # Add your protocol reward token address

# Chainlink Price Feeds (Polygon Mainnet)
export COLLATERAL_PRICE_FEED="0xF9680D99D6C9589e2a93a78A04A279e509205945" # ETH/USD
export BORROW_PRICE_FEED="0xfE4A61Eed12858E52A7E9b6FaA18C7152B3C539a"    # USDC/USD
```

---

## 3. Deploy and Verify

Run the deployment script with the `--broadcast` and `--verify` flags:

```bash
cd contracts
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $POLYGONSCAN_API_KEY \
  --legacy # Often required for Polygon gas pricing
```

> [!TIP]
> Use the `--legacy` flag if you encounter "max fee per gas" errors on Polygon.

---

## 4. Frontend Integration

After a successful deployment, you must update the frontend to point to the new contracts.

### Step 1: Update Contract Addresses

Open `frontend/src/contracts/index.ts` and add or update the `CONTRACT_ADDRESSES` for Polygon.

```typescript
// frontend/src/contracts/index.ts

export const CONTRACT_ADDRESSES = {
  // ... existing addresses
  DeFiAMM: "0x...", // Copy from deployment logs
  DeFiRouter: "0x...",
  DeFiLend: "0x...",
  DeFiStaking: "0x...",
  DeFiFlashLoan: "0x...",
};
```

### Step 2: Refresh ABIs (If changed)

If you made any changes to the smart contract logic, copy the updated JSON artifacts:

1.  Locate artifacts in `contracts/out/`.
2.  Paste JSON files into `frontend/src/contracts/abi/`.

### Step 3: Switch Chain in Frontend

Ensure your `Web3Provider` supports Polygon:

```typescript
// frontend/src/providers/Web3Provider.tsx
import { polygon } from "wagmi/chains";

const config = getDefaultConfig({
  // ...
  chains: [polygon, ...], // Ensure polygon is in the list
});
```

---

## 5. Post-Deployment Verification

1.  **Check Polygonscan**: Search for your contract addresses to ensure they are verified and active.
2.  **Test Swap**: Connect your wallet to the frontend, switch to Polygon, and attempt a small swap.
3.  **Lending Health**: Ensure the lending page displays the correct collateral and borrow rates via the price feeds.
