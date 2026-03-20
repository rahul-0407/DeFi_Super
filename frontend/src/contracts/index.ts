import DeFiAMM from './abi/DeFiAMM.json';
import DeFiRouter from './abi/DeFiRouter.json';
import DeFiLend from './abi/DeFiLend.json';
import DeFiStaking from './abi/DeFiStaking.json';
import DeFiFlashLoan from './abi/DeFiFlashLoan.json';
import IAggregatorV3 from './abi/IAggregatorV3.json';
import IERC20 from './abi/IERC20.json';

export const CONTRACT_ABIS = {
    DeFiAMM,
    DeFiRouter,
    DeFiLend,
    DeFiStaking,
    DeFiFlashLoan,
    IAggregatorV3,
    IERC20,
};

// Deployed addresses on Sepolia
export const CONTRACT_ADDRESSES = {
    DeFiAMM: '0x9bf904562e141c0bfb04d8b70e1c67b43afd403b' as `0x${string}`,
    DeFiRouter: '0x89e46db557b013a75e788d5faadfb600f89b569c' as `0x${string}`,
    DeFiLend: '0xde139c3d98c93bd06a074692ca171b8744742712' as `0x${string}`,
    DeFiStaking: '0x618d4c16fb2d34101c32968f90986ad6f5e23caf' as `0x${string}`,
    DeFiFlashLoan: '0xded027a033a1106d7a85de74afe54e628faa4d39' as `0x${string}`,

    // Custom protocol tokens
    DEFI_TOKEN: '0xd672dccec15daf786238d11c22c1fa3f77f2b287' as `0x${string}`, // Governance & Rewards
    D_USDC: '0x835e2ca78249f36345cf8d5d487dc3fa03aaded6' as `0x${string}`,      // Lending Receipt Token
    WETH_USDC_LP: '0x9bf904562e141c0bfb04d8b70e1c67b43afd403b' as `0x${string}`, // AMM LP Token (Pool Address)
    WETH_DEFI_POOL: '0xf5c473efe75a6aceae9df3b80a8ccfb1cdaf483e' as `0x${string}`,

    // Tokens (Official Sepolia)
    WETH: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14' as `0x${string}`,
    USDC: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' as `0x${string}`,

    // Price Feeds
    ETH_USD_FEED: '0x694AA1769357215DE4FAC081bf1f309aDC325306' as `0x${string}`,
};
