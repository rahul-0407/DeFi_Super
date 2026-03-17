// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DeFiStaking} from "../src/DeFiStaking.sol";

contract FixStaking is Script {
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
        address DEFI = _toAddress("0xd672dccec15daf786238d11c22c1fa3f77f2b287");
        address STAKING = _toAddress(
            "0x618d4c16fb2d34101c32968f90986ad6f5e23caf"
        );

        uint256 deployerPrivateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        console.log("--- Starting Staking Fix ---");

        // 1. Transfer DEFI to Staking Contract
        uint256 rewardAmount = 1000 ether;
        IERC20(DEFI).transfer(STAKING, rewardAmount);
        console.log("1. Transferred 1,000 DEFI to Staking");

        // 2. Notify Reward Amount
        DeFiStaking(STAKING).notifyRewardAmount(rewardAmount);
        console.log("2. Notified Staking Contract");

        vm.stopBroadcast();
        console.log("--- Staking Rewards Live! ---");
    }
}
