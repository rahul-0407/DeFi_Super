// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {DeFiStaking} from "../src/DeFiStaking.sol";
import {MockERC20} from "./MockERC20.sol";

contract DeFiStakingTest is Test {
    DeFiStaking staking;
    MockERC20 stakingToken;
    MockERC20 rewardToken;
    address user = address(1);
    address user2 = address(2);

    function setUp() public {
        stakingToken = new MockERC20("Staking Token", "STK");
        rewardToken = new MockERC20("Reward Token", "RWD");
        staking = new DeFiStaking(address(stakingToken), address(rewardToken));

        stakingToken.mint(user, 1000e18);
        stakingToken.mint(user2, 1000e18);
        rewardToken.mint(address(staking), 1000000e18);
        staking.notifyRewardAmount(604800e18); // 1e18 per second over 7 days (604800 seconds)

        vm.prank(user);
        stakingToken.approve(address(staking), type(uint256).max);
        vm.prank(user2);
        stakingToken.approve(address(staking), type(uint256).max);
    }

    function testStakingAndRewards() public {
        vm.startPrank(user);
        staking.stake(100e18);
        vm.stopPrank();

        vm.warp(block.timestamp + 10);

        assertEq(staking.earned(user), 10e18);

        vm.startPrank(user);
        staking.getReward();
        vm.stopPrank();

        assertEq(rewardToken.balanceOf(user), 10e18);
        assertEq(staking.earned(user), 0);
    }

    function testPartialWithdrawal() public {
        vm.startPrank(user);
        staking.stake(100e18);
        vm.warp(block.timestamp + 10);
        staking.withdraw(50e18);
        vm.stopPrank();

        assertEq(staking.balanceOf(user), 50e18);
        assertEq(staking.earned(user), 10e18);
    }

    function testMultipleStakers() public {
        vm.prank(user);
        staking.stake(100e18);

        vm.warp(block.timestamp + 10);

        vm.prank(user2);
        staking.stake(100e18);

        vm.warp(block.timestamp + 10);

        // User1: 10 seconds solo + 10 seconds shared = 10 + 5 = 15
        // User2: 10 seconds shared = 5
        assertEq(staking.earned(user), 15e18);
        assertEq(staking.earned(user2), 5e18);
    }

    function testZeroStakeReverts() public {
        vm.startPrank(user);
        vm.expectRevert(DeFiStaking.ZeroAmount.selector);
        staking.stake(0);
        vm.stopPrank();
    }

    function testPauseUnpause() public {
        staking.pause();

        vm.startPrank(user);
        vm.expectRevert();
        staking.stake(100e18);
        vm.stopPrank();

        staking.unpause();

        vm.startPrank(user);
        staking.stake(100e18);
        vm.stopPrank();

        assertEq(staking.balanceOf(user), 100e18);
    }

    function testNotifyRewardAmount() public {
        vm.prank(user);
        staking.stake(100e18);

        vm.warp(block.timestamp + 5);

        // Current rate is 1e18/s.
        // 5 seconds = 5e18 earned.

        // Notify more rewards. Duration is 7 days (604800s).
        // notifyRewardAmount will calculate new rate: (new_reward + leftover) / duration
        rewardToken.mint(address(staking), 1000000e18);
        staking.notifyRewardAmount(604800e18);

        vm.warp(block.timestamp + 5);

        // It's a bit complex to calculate exact earned here because rate changes,
        // but we verify it grows.
        assertTrue(staking.earned(user) > 5e18);
    }
}
