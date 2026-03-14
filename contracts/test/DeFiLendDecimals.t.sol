// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DeFiLend} from "../src/DeFiLend.sol";
import {MockERC20} from "./MockERC20.sol";
import {MockV3Aggregator} from "./MockV3Aggregator.sol";

/**
 * @title DeFiLendDecimalsTest
 * @notice Tests health factor and borrow math with mixed token decimals
 *         (WETH 18 decimals, USDC 6 decimals) — the real-world scenario.
 */
contract DeFiLendDecimalsTest is Test {
    DeFiLend lending;
    MockERC20 weth;
    MockERC20 usdc;
    MockV3Aggregator ethFeed;
    MockV3Aggregator usdcFeed;
    address user = address(1);

    function setUp() public {
        weth = new MockERC20("WETH", "WETH", 18);
        usdc = new MockERC20("USDC", "USDC", 6);

        // ETH = $3000 (8 Chainlink decimals)
        ethFeed = new MockV3Aggregator(8, 3000e8);
        // USDC = $1 (8 Chainlink decimals)
        usdcFeed = new MockV3Aggregator(8, 1e8);

        lending = new DeFiLend(
            address(weth),
            address(usdc),
            address(ethFeed),
            address(usdcFeed)
        );

        weth.mint(user, 10e18);
        usdc.mint(address(lending), 100_000e6); // 100k USDC pool liquidity

        vm.startPrank(user);
        weth.approve(address(lending), type(uint256).max);
        vm.stopPrank();
    }

    function testBorrowWithMixedDecimals() public {
        vm.startPrank(user);
        lending.deposit(1e18); // 1 WETH ($3000)

        // Max borrow = $3000 * 0.8 = $2400
        // Borrow 1500 USDC ($1500) — well within limit
        lending.borrow(1500e6);
        vm.stopPrank();

        // HF = (3000 * 80) / (1500 * 100) = 1.6
        assertApproxEqAbs(lending.getHealthFactor(user), 16e17, 1e10);
    }

    function testBorrowAtExactLimit() public {
        vm.startPrank(user);
        lending.deposit(1e18); // $3000 → max $2400

        // Borrow exactly $2400 USDC
        lending.borrow(2400e6);
        vm.stopPrank();

        // HF = (3000 * 80) / (2400 * 100) = 1.0
        assertApproxEqAbs(lending.getHealthFactor(user), 1e18, 1e10);
    }

    function testBorrowOverLimitReverts() public {
        vm.startPrank(user);
        lending.deposit(1e18); // $3000 → max $2400

        vm.expectRevert(DeFiLend.InsufficientCollateral.selector);
        lending.borrow(2401e6); // $2401 > $2400
        vm.stopPrank();
    }

    function testGetMaxBorrowMixedDecimals() public {
        vm.startPrank(user);
        lending.deposit(1e18); // $3000 → max borrow = $2400
        vm.stopPrank();

        // Should return 2400e6 (2400 USDC in 6-decimal format)
        assertApproxEqAbs(lending.getMaxBorrow(user), 2400e6, 1e2);
    }

    function testLiquidationMixedDecimals() public {
        vm.startPrank(user);
        lending.deposit(1e18); // 1 WETH @ $3000
        lending.borrow(2300e6); // 2300 USDC — HF ≈ 1.043
        vm.stopPrank();

        // Drop ETH to $2800 → HF = (2800*80)/(2300*100) = 0.974 < 1
        ethFeed.updateAnswer(2800e8);
        assertTrue(lending.getHealthFactor(user) < 1e18, "Should be unhealthy");

        // Liquidator repays 500 USDC
        address liquidator = address(2);
        usdc.mint(liquidator, 10000e6);
        vm.startPrank(liquidator);
        usdc.approve(address(lending), type(uint256).max);
        lending.liquidate(user, 500e6);
        vm.stopPrank();

        // Liquidator should have received WETH collateral
        assertTrue(
            weth.balanceOf(liquidator) > 0,
            "Liquidator should receive collateral"
        );
    }
}
