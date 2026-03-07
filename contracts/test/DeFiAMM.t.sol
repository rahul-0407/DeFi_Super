// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {DeFiAMM} from "../src/DeFiAMM.sol";
import {MockERC20} from "./MockERC20.sol";
import {DeFiRouter} from "../src/DeFiRouter.sol";

contract DeFiAMMTest is Test {
    DeFiAMM pool;
    DeFiRouter router;
    MockERC20 token0;
    MockERC20 token1;
    address user = address(1);
    address owner;

    function setUp() public {
        owner = address(this);
        token0 = new MockERC20("Token 0", "TK0");
        token1 = new MockERC20("Token 1", "TK1");
        pool = new DeFiAMM(address(token0), address(token1));
        router = new DeFiRouter();

        token0.mint(user, 10000e18);
        token1.mint(user, 10000e18);

        vm.startPrank(user);
        token0.approve(address(router), type(uint256).max);
        token1.approve(address(router), type(uint256).max);
        vm.stopPrank();
    }

    function testAddLiquidity() public {
        vm.startPrank(user);
        router.addLiquidity(address(pool), 100e18, 100e18, block.timestamp + 1);
        vm.stopPrank();

        assertEq(pool.reserve0(), 100e18);
        assertEq(pool.reserve1(), 100e18);
        // user is address(1) which also receives MINIMUM_LIQUIDITY (1000)
        // so balanceOf(user) = MINIMUM_LIQUIDITY + (sqrt(100e18*100e18) - MINIMUM_LIQUIDITY) = 100e18
        assertEq(pool.balanceOf(user), 100e18);
    }

    function testMinimumLiquidityLock() public {
        vm.startPrank(user);
        // address(1) is also the MINIMUM_LIQUIDITY recipient, so let's use a different user
        vm.stopPrank();

        address user2 = address(42);
        token0.mint(user2, 10000e18);
        token1.mint(user2, 10000e18);

        vm.startPrank(user2);
        token0.approve(address(router), type(uint256).max);
        token1.approve(address(router), type(uint256).max);
        router.addLiquidity(address(pool), 100e18, 100e18, block.timestamp + 1);
        vm.stopPrank();

        // MINIMUM_LIQUIDITY = 1000 locked to address(1)
        assertEq(pool.balanceOf(address(1)), 1000);
        assertEq(pool.balanceOf(user2), 100e18 - 1000);
        assertEq(pool.totalSupply(), 100e18);
    }

    function testSwap() public {
        address user2 = address(42);
        token0.mint(user2, 10000e18);
        token1.mint(user2, 10000e18);

        vm.startPrank(user2);
        token0.approve(address(router), type(uint256).max);
        token1.approve(address(router), type(uint256).max);
        router.addLiquidity(address(pool), 100e18, 100e18, block.timestamp + 1);

        uint256 amountIn = 10e18;
        uint256 expectedOut = 9066108938801491315;

        uint256 amountOut = router.swap(
            address(pool),
            amountIn,
            true,
            0,
            block.timestamp + 1
        );

        assertEq(amountOut, expectedOut);
        assertEq(token1.balanceOf(user2), 9900e18 + expectedOut);
        vm.stopPrank();
    }

    function testRemoveLiquidity() public {
        address user2 = address(42);
        token0.mint(user2, 10000e18);
        token1.mint(user2, 10000e18);

        vm.startPrank(user2);
        token0.approve(address(router), type(uint256).max);
        token1.approve(address(router), type(uint256).max);
        token0.approve(address(pool), type(uint256).max);
        token1.approve(address(pool), type(uint256).max);
        router.addLiquidity(address(pool), 100e18, 100e18, block.timestamp + 1);

        uint256 shares = pool.balanceOf(user2);
        pool.removeLiquidity(shares);
        vm.stopPrank();

        assertEq(pool.balanceOf(user2), 0);
        // Small dust remains due to MINIMUM_LIQUIDITY lock
        assertTrue(token0.balanceOf(user2) > 9999e18);
        assertTrue(token1.balanceOf(user2) > 9999e18);
    }

    function testPauseUnpause() public {
        pool.pause();

        vm.startPrank(user);
        token0.approve(address(pool), type(uint256).max);
        token1.approve(address(pool), type(uint256).max);
        vm.expectRevert();
        pool.addLiquidity(100e18, 100e18);
        vm.stopPrank();

        pool.unpause();

        vm.startPrank(user);
        pool.addLiquidity(100e18, 100e18);
        vm.stopPrank();

        assertGt(pool.totalSupply(), 0);
    }

    function testOnlyOwnerCanPause() public {
        vm.prank(user);
        vm.expectRevert();
        pool.pause();
    }

    function testDeadlineExpired() public {
        vm.startPrank(user);
        vm.expectRevert();
        router.addLiquidity(address(pool), 100e18, 100e18, block.timestamp - 1);
        vm.stopPrank();
    }
}
