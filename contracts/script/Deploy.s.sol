// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DeFiAMM} from "../src/DeFiAMM.sol";
import {DeFiRouter} from "../src/DeFiRouter.sol";
import {DeFiLend} from "../src/DeFiLend.sol";
import {DeFiStaking} from "../src/DeFiStaking.sol";
import {DeFiFlashLoan} from "../src/DeFiFlashLoan.sol";

/**
 * @title Deploy
 * @notice Deployment script for the DeFi Super protocol.
 *
 * Usage:
 *   forge script script/Deploy.s.sol:Deploy \
 *     --rpc-url <RPC_URL> \
 *     --private-key <DEPLOYER_PRIVATE_KEY> \
 *     --broadcast \
 *     --verify \
 *     --etherscan-api-key <API_KEY>
 *
 * Environment variables (set before running):
 *   TOKEN0_ADDRESS - Address of token0 for AMM pair
 *   TOKEN1_ADDRESS - Address of token1 for AMM pair
 *   COLLATERAL_TOKEN - Address of collateral token for lending
 *   BORROW_TOKEN     - Address of borrow token for lending
 *   STAKING_TOKEN    - Address of staking token
 *   REWARD_TOKEN     - Address of reward token
 */
contract Deploy is Script {
    function run() external {
        address token0 = vm.envAddress("TOKEN0_ADDRESS");
        address token1 = vm.envAddress("TOKEN1_ADDRESS");
        address collateralToken = vm.envAddress("COLLATERAL_TOKEN");
        address borrowToken = vm.envAddress("BORROW_TOKEN");
        address stakingToken = vm.envAddress("STAKING_TOKEN");
        address rewardToken = vm.envAddress("REWARD_TOKEN");

        vm.startBroadcast();

        // 1. Deploy AMM Pool
        DeFiAMM amm = new DeFiAMM(token0, token1);
        console.log("DeFiAMM deployed at:", address(amm));

        // 2. Deploy Router
        DeFiRouter router = new DeFiRouter();
        console.log("DeFiRouter deployed at:", address(router));

        // 3. Deploy Lending Protocol
        DeFiLend lend = new DeFiLend(collateralToken, borrowToken);
        console.log("DeFiLend deployed at:", address(lend));

        // 4. Deploy Staking
        DeFiStaking staking = new DeFiStaking(stakingToken, rewardToken);
        console.log("DeFiStaking deployed at:", address(staking));

        // 5. Deploy Flash Loan Provider
        DeFiFlashLoan flashLoan = new DeFiFlashLoan();
        console.log("DeFiFlashLoan deployed at:", address(flashLoan));

        // 6. Configure Flash Loan supported tokens
        flashLoan.setSupportedToken(token0, true);
        flashLoan.setSupportedToken(token1, true);
        flashLoan.setSupportedToken(borrowToken, true);
        console.log("Flash loan tokens configured");

        vm.stopBroadcast();

        console.log("========================================");
        console.log("       DEPLOYMENT COMPLETE");
        console.log("========================================");
        console.log("");
        console.log("Verify contracts with:");
        console.log(
            "  forge verify-contract <ADDRESS> DeFiAMM --constructor-args $(cast abi-encode 'constructor(address,address)' <TOKEN0> <TOKEN1>)"
        );
    }
}
