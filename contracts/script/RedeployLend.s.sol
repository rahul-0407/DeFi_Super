// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {DeFiLend} from "../src/DeFiLend.sol";

/**
 * @title RedeployLend
 * @notice Script to redeploy ONLY the DeFiLend contract.
 */
contract RedeployLend is Script {
    function run() external {
        address collateralToken = vm.envAddress("COLLATERAL_TOKEN");
        address borrowToken = vm.envAddress("BORROW_TOKEN");
        address collateralPriceFeed = vm.envAddress("COLLATERAL_PRICE_FEED");
        address borrowPriceFeed = vm.envAddress("BORROW_PRICE_FEED");

        vm.startBroadcast();

        DeFiLend lend = new DeFiLend(
            collateralToken,
            borrowToken,
            collateralPriceFeed,
            borrowPriceFeed
        );

        console.log("DeFiLend (NEW) deployed at:", address(lend));

        vm.stopBroadcast();
    }
}
