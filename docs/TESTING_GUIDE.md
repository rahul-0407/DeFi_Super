# DeFi Super App - Feature Testing Guide

This guide provides step-by-step instructions to test every feature of the DeFi Super App on the Sepolia testnet.

---

## 1. Compulsory Prerequisites (Before Testing)

Before you can test the features, you **must** complete these three steps. Failure to do so will result in failed transactions or "Insufficient Liquidity" errors.

### A. Fix Token Addresses

In your `src/contracts/index.ts`, you currently have `USDC` and `DEFI` set to the same address as `WETH`. **This will break the AMM.**
Please update `USDC` to the official Sepolia USDC address:

- **WETH**: `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`
- **USDC**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`

### B. Get Testnet Tokens

Ensure your wallet has:

1.  **Sepolia ETH**: For gas (get from [Alchemy Faucet](https://sepoliafaucet.com/)).
2.  **Sepolia WETH**: You can wrap ETH by sending it to the WETH contract or using a DEX.
3.  **Sepolia USDC**: Get from [Circle Faucet](https://faucet.circle.com/).

### C. Seed Initial Liquidity (CRITICAL)

The Swap feature will not work until the AMM pool has tokens.

1.  Go to the **Liquidity** section (if available in UI) or use `cast` to call `addLiquidity` on the `DeFiRouter`.
2.  Provide a balance of both WETH and USDC (e.g., 0.1 WETH and 200 USDC).
3.  This establishes the initial price and allows others to swap.

---

## 2. Feature Testing Steps

### 1. Dashboard & Wallet Connection

- **Action**: Click "Connect Wallet" (RainbowKit).
- **Check**: Does your address appear? Do your WETH and USDC balances load correctly?
- **Check**: Does the network indicator show "Sepolia"?

### 2. Swap (Exchange WETH for USDC)

- **Action**: Enter an amount of WETH (e.g., 0.01).
- **Check**: Does the "Receive" amount update automatically? (This confirms AMM reserves are being read).
- **Action**: Click **Swap**.
- **Flow**:
  1. Wallet popup for **Token Approval** (allows Router to spend your WETH).
  2. Wallet popup for **Swap Transaction**.
- **Success**: You should see a success toast and your USDC balance should increase.

### 3. Lending (Supply & Borrow)

- **Action**: Go to the Lending page.
- **Action**: Enter WETH amount and click **Supply/Deposit**.
- **Action**: After deposit, enter a USDC amount (less than 80% of collateral value) and click **Borrow**.
- **Check**: Does your "Health Factor" decrease but stay above 1.0?
- **Action**: Click **Repay** to return some USDC.

### 4. Staking

- **Action**: Go to the Staking page.
- **Action**: Enter an amount of tokens to **Stake**.
- **Check**: After a few minutes, do "Earned Rewards" start to accumulate?
- **Action**: Click **Get Reward**/Claim to harvest your earnings.

### 5. Analytics (Dashboard)

- **Action**: Check if Top Pools and TVL are displaying data.
- **Note**: This requires the **Subgraph** to be deployed and synced with your new Sepolia contract addresses. If the Subgraph is still pointing to older addresses, this page will be empty or show mock data.

---

## 3. Troubleshooting

| Issue                     | Likely Cause              | Solution                                                                                  |
| :------------------------ | :------------------------ | :---------------------------------------------------------------------------------------- |
| **"Insufficient Output"** | Slippage or No Liquidity  | Seed the pool with more tokens in a 50/50 ratio.                                          |
| **Transaction Fails**     | Out of Gas or No Approval | Ensure you have Sepolia ETH and that you signed the Approval transaction first.           |
| **Balances show 0**       | Wrong Chain or Address    | Verify you are on Sepolia and `src/contracts/index.ts` has the correct `0x...` addresses. |
