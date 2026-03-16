// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DeFiAMM} from "../src/DeFiAMM.sol";
import {DeFiRouter} from "../src/DeFiRouter.sol";
import {DeFiLend} from "../src/DeFiLend.sol";
import {DeFiStaking} from "../src/DeFiStaking.sol";
import {DeFiFlashLoan} from "../src/DeFiFlashLoan.sol";
import {DeFiToken} from "../src/DeFiToken.sol";

/**
 * @title Deploy
 * @notice Deployment script for the DeFi Super protocol with Real Tokenomics.
 */
contract Deploy is Script {
    function run() external {
        address token0 = vm.envAddress("TOKEN0_ADDRESS");
        address token1 = vm.envAddress("TOKEN1_ADDRESS");
        address collateralToken = vm.envAddress("COLLATERAL_TOKEN");
        address borrowToken = vm.envAddress("BORROW_TOKEN");
        address collateralPriceFeed = vm.envAddress("COLLATERAL_PRICE_FEED");
        address borrowPriceFeed = vm.envAddress("BORROW_PRICE_FEED");
        address stakingToken = vm.envAddress("STAKING_TOKEN");
        address weth = vm.envAddress("WETH_ADDRESS");

        vm.startBroadcast();

        // 1. Deploy THE REAL TOKEN first
        DeFiToken defiToken = new DeFiToken();
        console.log("DeFiToken deployed at:", address(defiToken));

        // 2. Deploy AMM Pool (WETH/USDC)
        DeFiAMM amm = new DeFiAMM(token0, token1);
        console.log("DeFiAMM (WETH/USDC) deployed at:", address(amm));

        // 3. Deploy Router
        DeFiRouter router = new DeFiRouter();
        console.log("DeFiRouter deployed at:", address(router));

        // 4. Deploy Lending Protocol
        DeFiLend lend = new DeFiLend(
            collateralToken,
            borrowToken,
            collateralPriceFeed,
            borrowPriceFeed
        );
        console.log("DeFiLend deployed at:", address(lend));

        // 5. Deploy Staking (Rewarding with our real DEFI token)
        DeFiStaking staking = new DeFiStaking(stakingToken, address(defiToken));
        staking.setLendingPool(address(lend));
        console.log("DeFiStaking deployed at:", address(staking));

        // 6. Deploy the Market to buy DEFI (WETH/DEFI)
        DeFiAMM defiPool = new DeFiAMM(weth, address(defiToken));
        console.log("DeFiAMM (WETH/DEFI) deployed at:", address(defiPool));

        // 7. Deploy Flash Loan Provider
        DeFiFlashLoan flashLoan = new DeFiFlashLoan();
        console.log("DeFiFlashLoan deployed at:", address(flashLoan));

        // 8. Configure Flash Loan supported tokens
        flashLoan.setSupportedToken(token0, true);
        flashLoan.setSupportedToken(token1, true);
        flashLoan.setSupportedToken(borrowToken, true);
        flashLoan.setSupportedToken(address(defiToken), true);
        console.log("Flash loan tokens configured");

        vm.stopBroadcast();

        console.log("========================================");
        console.log("       DEPLOYMENT COMPLETE");
        console.log("========================================");
    }
}
