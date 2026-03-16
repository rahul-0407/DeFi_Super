# 🧪 Protocol Seeding Guide

To make the **Swap** feature work, you must first "Seed" the pools with some initial tokens. If a pool is empty, users cannot swap.

---

## 🏗️ 1. Seed the WETH/USDC Pool

This is the main market for borrowing.

1.  **Requirement**: You need WETH and USDC in your wallet.
2.  **Action**:
    - Go to your `DeFiAMM` contract address.
    - Call `addLiquidity(amount0, amount1)`.
    - Example: Add **0.1 WETH** and **250 USDC**.
3.  **Result**: Users can now swap ETH for USDC and vice versa.

---

## 💎 2. Seed the WETH/DEFI Pool (Token Launch)

This is how you "launch" your token so users can buy it.

1.  **Requirement**: You need WETH and your newly minted **DEFI** tokens.
2.  **Action**:
    - Go to the **New** `DeFiAMM` contract address (WETH/DEFI).
    - Call `addLiquidity(amount0, amount1)`.
    - Example: Add **0.1 WETH** and **1,000 DEFI**.
3.  **Result**: This sets the initial price of your token (In this case, 1 DEFI = 0.0001 WETH).

---

## 🏦 3. Seed the Lending Pool (Optional)

To allow people to borrow immediately, you can seed the lending pool.

1.  **Action**:
    - Go to `DeFiLend` contract.
    - Call `supplyBorrowToken(amount)`.
    - Example: Supply **5,000 USDC**.
2.  **Result**: Users can now deposit WETH as collateral and borrow USDC instantly.

---

## ⚡ Pro Tip: The "Liquidity Provider" Reward

As the owner, by seeding these pools, you will receive **LP Tokens (DLP)**.

- Every time a user swaps on your app, you will earn a **0.3% fee** automatically.
- Your $100 in the pool will slowly grow as the protocol gets used! 📈
