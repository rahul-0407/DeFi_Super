// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DeFiStaking} from "../src/DeFiStaking.sol";

contract SetupStaking is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address stakingAddr = 0xD4e60E53d163AC84E0Bac84B6d1F8542A06aE380;
        address wethAddr = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14;

        vm.startBroadcast(deployerPrivateKey);

        IERC20 weth = IERC20(wethAddr);
        DeFiStaking staking = DeFiStaking(stakingAddr);

        uint256 rewardAmount = 0.1 ether; // 100,000,000,000,000,000

        // 1. Transfer WETH to contract
        weth.transfer(stakingAddr, rewardAmount);

        // 2. Notify reward
        staking.notifyRewardAmount(rewardAmount);

        vm.stopBroadcast();
    }
}
