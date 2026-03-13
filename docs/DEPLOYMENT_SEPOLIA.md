# Sepolia Deployment Guide

This guide explains how to deploy the DeFi Super contracts to the **Ethereum Sepolia Testnet**.

---

## 1. Environment Setup

I have created a `.env` file in the `contracts/` directory with most of the required addresses.

### What's in the `.env`:

- **WETH (Sepolia)**: `0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14`
- **USDC (Sepolia)**: `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238`
- **ETH/USD Feed**: `0x694AA1769357215DE4FAC081bf1f309aDC325306`
- **USDC/USD Feed**: `0xA2F987A546D4CD2c6127787201c5947b64Ba2952`

### What you need to add:

1.  **`RPC_URL`**: Your Sepolia RPC (Alchemy/Infura).
2.  **`DEPLOYER_PRIVATE_KEY`**: Your wallet private key (ensure you have Sepolia ETH).
3.  **`ETHERSCAN_API_KEY`**: For contract verification.
4.  **`REWARD_TOKEN`**: If you have a specific token for rewards, place its address here. If not, you can use the `DEFI` token address after you deploy it, or temporarily use `WETH`.

---

## 2. How to get "Leftover" Addresses

If you need addresses that are not in the `.env` yet (like a custom protocol token):

1.  **Protocol Reward Token**: If your protocol has its own token (e.g., `DEFI`), you should deploy it first (or it might be deployed within the script). Record the address from the console output and update the `.env`.
2.  **Mock Tokens**: If you are testing and need more tokens, you can deploy a simple ERC20:
    ```bash
    forge create lib/openzeppelin-contracts/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol:ERC20PresetMinterPauser --rpc-url $RPC_URL --private-key $DEPLOYER_PRIVATE_KEY --constructor-args "MyToken" "MTK"
    ```
3.  **Faucet**: Use [Sepolia Faucet](https://sepoliafaucet.com/) to get test ETH.

---

## 3. Execution

Load the environment variables and run the script:

```bash
cd contracts
source .env
forge script script/Deploy.s.sol:Deploy \
  --rpc-url $RPC_URL \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

---

## 4. Syncing to Frontend

Once deployed, copy the addresses from the terminal output to `frontend/src/contracts/index.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  // ...
  DeFiAMM: "0x...",
  DeFiRouter: "0x...",
  // ...
};
```

Make sure to update the `Web3Provider.tsx` to include `sepolia` in the chains list if it's not already there.
