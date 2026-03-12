// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DeFiAMM} from "../src/DeFiAMM.sol";
import {DeFiRouter} from "../src/DeFiRouter.sol";
import {DeFiLend} from "../src/DeFiLend.sol";
import {DeFiStaking} from "../src/DeFiStaking.sol";
import {DeFiFlashLoan} from "../src/DeFiFlashLoan.sol";
import {MockERC20} from "../test/MockERC20.sol";
import {MockV3Aggregator} from "../test/MockV3Aggregator.sol";

contract DeployDev is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy Mock Tokens
        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH");
        MockERC20 usdc = new MockERC20("USD Coin", "USDC");
        MockERC20 defi = new MockERC20("DeFi Super Token", "DEFI");

        console.log("WETH deployed at:", address(weth));
        console.log("USDC deployed at:", address(usdc));
        console.log("DEFI deployed at:", address(defi));

        // 2. Deploy Price Feeds
        MockV3Aggregator wethFeed = new MockV3Aggregator(8, 2500 * 1e8); // $2500
        MockV3Aggregator usdcFeed = new MockV3Aggregator(8, 1 * 1e8); // $1

        console.log("WETH/USD Feed deployed at:", address(wethFeed));
        console.log("USDC/USD Feed deployed at:", address(usdcFeed));

        // 3. Deploy AMM Pool (WETH/USDC)
        DeFiAMM amm = new DeFiAMM(address(weth), address(usdc));
        console.log("DeFiAMM deployed at:", address(amm));

        // 4. Deploy Router
        DeFiRouter router = new DeFiRouter();
        console.log("DeFiRouter deployed at:", address(router));

        // 5. Deploy Lending Protocol
        DeFiLend lend = new DeFiLend(
            address(weth),
            address(usdc),
            address(wethFeed),
            address(usdcFeed)
        );
        console.log("DeFiLend deployed at:", address(lend));

        // 6. Deploy Staking (Stake DEFI, Reward DEFI)
        DeFiStaking staking = new DeFiStaking(address(defi), address(defi));
        console.log("DeFiStaking deployed at:", address(staking));

        // 7. Deploy Flash Loan Provider
        DeFiFlashLoan flashLoan = new DeFiFlashLoan();
        console.log("DeFiFlashLoan deployed at:", address(flashLoan));

        // 8. Configure Flash Loan supported tokens
        flashLoan.setSupportedToken(address(weth), true);
        flashLoan.setSupportedToken(address(usdc), true);
        flashLoan.setSupportedToken(address(defi), true);
        console.log("Flash loan tokens configured");

        // 9. Initial Liquidity/Setup
        // Provide some initial rewards to staking
        defi.mint(address(staking), 1000000 * 1e18);

        // Mint some tokens to the deployer for testing
        address deployer = msg.sender;
        weth.mint(deployer, 100 * 1e18);
        usdc.mint(deployer, 250000 * 1e18);
        defi.mint(deployer, 10000 * 1e18);

        vm.stopBroadcast();

        console.log("========================================");
        console.log("       DEV DEPLOYMENT COMPLETE");
        console.log("========================================");
    }
}
