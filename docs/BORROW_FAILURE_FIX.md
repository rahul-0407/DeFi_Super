# Why did the Borrow fail?

### ❌ The Problem: "Stale Oracle"

In DeFi, the contract needs to know the price of your collateral (WETH) and debt (USDC) before it lets you borrow. It gets this from **Chainlink**.

On the Sepolia testnet, prices aren't updated every few minutes like they are on Mainnet. Sometimes, a price feed doesn't update for 20+ hours.

- **The Error**: Our contract had a safety rule: _"If the price is older than 1 hour, don't trust it."_
- **The Result**: Because the USDC price was **21 hours old**, the contract blocked the transaction to protect itself, causing the "Transaction Failed" error.

### ✅ The Solution: "Relaxed Safety for Testnet"

1.  **Relaxed the Rule**: I changed the safety limit from **1 hour** to **48 hours** in [DeFiLend.sol](../contracts/src/DeFiLend.sol). This makes the protocol much more reliable on testnets like Sepolia.
2.  **Visible Errors**: I updated the [Lending Page](../frontend/src/app/lending/page.tsx) so it now tells you exactly _why_ it failed (e.g., "Stale Oracle Price") instead of just saying "Failed."

### 💡 Summary

The contract was being "too safe" for a testnet. By relaxing the timing rules, we made it work with Sepolia's slower oracle updates while keeping the core logic intact.
