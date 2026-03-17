// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DeFiRouter} from "../src/DeFiRouter.sol";
import {DeFiLend} from "../src/DeFiLend.sol";
import {DeFiStaking} from "../src/DeFiStaking.sol";
import {DeFiToken} from "../src/DeFiToken.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
}

contract SuperSeed is Script {
    function _toAddress(string memory s) internal pure returns (address) {
        bytes memory b = bytes(s);
        uint160 res = 0;
        for (uint256 i = 2; i < b.length; i++) {
            uint160 val = uint160(uint8(b[i]));
            if (val >= 48 && val <= 57) val -= 48;
            else if (val >= 65 && val <= 70) val -= 55;
            else if (val >= 97 && val <= 102) val -= 87;
            res = res * 16 + val;
        }
        return address(res);
    }

    function run() external {
        address DEFI_ROUTER = _toAddress(
            "0x89e46db557b013a75e788d5faadfb600f89b569c"
        );
        address DEFI_LEND = _toAddress(
            "0xde139c3d98c93bd06a074692ca171b8744742712"
        );
        address DEFI_STAKING = _toAddress(
            "0x618d4c16fb2d34101c32968f90986ad6f5e23caf"
        );
        address AMM_POOL = _toAddress(
            "0x9bf904562e141c0bfb04d8b70e1c67b43afd403b"
        );
        address DEFI_POOL = _toAddress(
            "0xf5c473efe75a6aceae9df3b80a8ccfb1cdaf483e"
        );

        address WETH = _toAddress("0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14");
        address USDC = _toAddress("0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238");
        address DEFI = _toAddress("0xd672dccec15daf786238d11c22c1fa3f77f2b287");

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("--- Starting Super Seed Script (Gas Optimized) ---");

        // 1. Wrap ETH into WETH (0.01 ETH)
        IWETH(WETH).deposit{value: 0.01 ether}();
        console.log("1. Wrapped 0.01 ETH -> WETH");

        // 2. Approvals (Using smaller amounts just to be safe with gas)
        IERC20(WETH).approve(DEFI_ROUTER, 10 ether);
        IERC20(USDC).approve(DEFI_ROUTER, 1000 * 1e6);
        IERC20(DEFI).approve(DEFI_ROUTER, 10000 ether);
        console.log("2. Approved Router");

        // 3. Seed Pools (Very small amounts to guarantee gas coverage)
        DeFiRouter(DEFI_ROUTER).addLiquidity(
            AMM_POOL,
            0.004 ether,
            8 * 1e6,
            0,
            0,
            block.timestamp + 600
        );
        console.log("3. Seeded WETH/USDC Pool");

        DeFiRouter(DEFI_ROUTER).addLiquidity(
            DEFI_POOL,
            0.002 ether,
            20 ether,
            0,
            0,
            block.timestamp + 600
        );
        console.log("3b. Seeded WETH/DEFI Pool");

        // 4. Seeding Lending
        IERC20(WETH).approve(DEFI_LEND, 10 ether);
        IERC20(USDC).approve(DEFI_LEND, 1000 * 1e6);
        DeFiLend(DEFI_LEND).deposit(0.001 ether);
        DeFiLend(DEFI_LEND).supplyBorrowToken(4 * 1e6);
        console.log("4. Seeded Lending Pool");

        // 5. Staking Rewards
        if (IERC20(DEFI).balanceOf(msg.sender) >= 1000 ether) {
            IERC20(DEFI).transfer(DEFI_STAKING, 1000 ether);
            DeFiStaking(DEFI_STAKING).notifyRewardAmount(1000 ether);
            console.log("5. Seeded Staking Rewards");
        }

        vm.stopBroadcast();
        console.log("--- Super Seed Complete! ---");
    }
}
