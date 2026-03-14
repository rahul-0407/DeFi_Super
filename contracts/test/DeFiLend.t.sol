// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {DeFiLend} from "../src/DeFiLend.sol";
import {MockERC20} from "./MockERC20.sol";
import {MockV3Aggregator} from "./MockV3Aggregator.sol";

contract DeFiLendTest is Test {
    DeFiLend lending;
    MockERC20 collateralToken;
    MockERC20 borrowToken;
    MockV3Aggregator collateralFeed;
    MockV3Aggregator borrowFeed;
    address user = address(1);
    address liquidator = address(2);

    function setUp() public {
        collateralToken = new MockERC20("Collateral", "COL", 18);
        borrowToken = new MockERC20("Borrow", "BOR", 18);

        // COL = $2000 (8 decimals like Chainlink ETH/USD)
        collateralFeed = new MockV3Aggregator(8, 2000e8);
        // BOR = $1 (8 decimals like Chainlink USDC/USD)
        borrowFeed = new MockV3Aggregator(8, 1e8);

        lending = new DeFiLend(
            address(collateralToken),
            address(borrowToken),
            address(collateralFeed),
            address(borrowFeed)
        );

        collateralToken.mint(user, 1000e18);
        borrowToken.mint(address(lending), 10_000_000e18);

        vm.prank(user);
        collateralToken.approve(address(lending), type(uint256).max);
    }

    function testDepositAndBorrow() public {
        vm.startPrank(user);
        // Deposit 1 COL ($2000 collateral value)
        lending.deposit(1e18);
        // Max borrow = 2000 * 0.8 = $1600 worth of BOR at $1 each = 1600 BOR
        lending.borrow(1000e18); // borrow $1000 worth — well within limit
        vm.stopPrank();

        // Health factor = (1 * 2000 * 80) / (1000 * 1 * 100) = 1.6
        assertApproxEqAbs(lending.getHealthFactor(user), 16e17, 1e10);
        assertEq(borrowToken.balanceOf(user), 1000e18);
    }

    function testBorrowOverLimitReverts() public {
        vm.startPrank(user);
        lending.deposit(1e18); // $2000 collateral → max $1600 borrow
        vm.expectRevert(DeFiLend.InsufficientCollateral.selector);
        lending.borrow(1601e18); // $1601 > $1600 limit
        vm.stopPrank();
    }

    function testOracleBasedHealthFactor() public {
        vm.startPrank(user);
        lending.deposit(1e18); // 1 COL @ $2000
        lending.borrow(1000e18); // 1000 BOR @ $1
        vm.stopPrank();

        // HF = (1 * 2000 * 80) / (1000 * 1 * 100) = 1.6
        assertApproxEqAbs(lending.getHealthFactor(user), 16e17, 1e10);

        // Price of COL drops to $1500
        collateralFeed.updateAnswer(1500e8);

        // HF = (1 * 1500 * 80) / (1000 * 1 * 100) = 1.2
        assertApproxEqAbs(lending.getHealthFactor(user), 12e17, 1e10);

        // Price of COL drops to $1000
        collateralFeed.updateAnswer(1000e8);

        // HF = (1 * 1000 * 80) / (1000 * 1 * 100) = 0.8
        assertApproxEqAbs(lending.getHealthFactor(user), 8e17, 1e14);
    }

    function testRepay() public {
        vm.startPrank(user);
        lending.deposit(1e18);
        lending.borrow(1000e18);

        borrowToken.approve(address(lending), type(uint256).max);
        lending.repay(500e18);
        vm.stopPrank();

        // HF = (1 * 2000 * 80) / (500 * 1 * 100) = 3.2
        assertApproxEqAbs(lending.getHealthFactor(user), 32e17, 1e10);
    }

    function testPriceCrashLiquidation() public {
        vm.startPrank(user);
        lending.deposit(1e18); // 1 COL @ $2000
        lending.borrow(1500e18); // 1500 BOR @ $1 — HF = 1.066..
        vm.stopPrank();

        // Crash COL to $1800 — HF = (1 * 1800 * 80) / (1500 * 1 * 100) = 0.96 < 1
        collateralFeed.updateAnswer(1800e8);
        assertTrue(lending.getHealthFactor(user) < 1e18, "Should be unhealthy");

        // Liquidator repays 500 BOR
        borrowToken.mint(liquidator, 10000e18);
        vm.startPrank(liquidator);
        borrowToken.approve(address(lending), type(uint256).max);

        lending.liquidate(user, 500e18);
        vm.stopPrank();

        uint256 bonus = 105; // 100 + LIQUIDATION_BONUS (5)
        uint256 colPrice = 1800; // collateralPrice in $
        uint256 debtRepaid = 500e18;
        uint256 expectedSeized = (debtRepaid * bonus) / (colPrice * 100);
        assertApproxEqAbs(
            collateralToken.balanceOf(liquidator),
            expectedSeized,
            1e10
        );
    }

    function testLiquidationRevertsOnHealthyAccount() public {
        vm.startPrank(user);
        lending.deposit(1e18);
        lending.borrow(500e18);
        vm.stopPrank();

        borrowToken.mint(liquidator, 100e18);
        vm.startPrank(liquidator);
        borrowToken.approve(address(lending), type(uint256).max);
        vm.expectRevert(DeFiLend.AccountStillHealthy.selector);
        lending.liquidate(user, 25e18);
        vm.stopPrank();
    }

    function testStalePriceReverts() public {
        vm.startPrank(user);
        lending.deposit(1e18);
        vm.stopPrank();

        // Move time forward so subtraction doesn't underflow
        vm.warp(block.timestamp + 1 days);

        // Make the oracle stale (set updatedAt to >1 hour ago)
        collateralFeed.setUpdatedAt(block.timestamp - 2 hours);

        vm.startPrank(user);
        vm.expectRevert(DeFiLend.StaleOraclePrice.selector);
        lending.borrow(100e18);
        vm.stopPrank();
    }

    function testInvalidOraclePriceReverts() public {
        vm.startPrank(user);
        lending.deposit(1e18);
        vm.stopPrank();

        // Set price to 0
        collateralFeed.updateAnswer(0);

        vm.startPrank(user);
        vm.expectRevert(DeFiLend.InvalidOraclePrice.selector);
        lending.borrow(100e18);
        vm.stopPrank();
    }

    function testZeroAmountReverts() public {
        vm.startPrank(user);
        vm.expectRevert(DeFiLend.ZeroAmount.selector);
        lending.deposit(0);
        vm.stopPrank();
    }

    function testPauseUnpause() public {
        lending.pause();

        vm.startPrank(user);
        vm.expectRevert();
        lending.deposit(1e18);
        vm.stopPrank();

        lending.unpause();

        vm.startPrank(user);
        lending.deposit(1e18);
        vm.stopPrank();
    }

    function testPositionUpdatedEvent() public {
        vm.startPrank(user);
        vm.expectEmit(true, true, false, false);
        emit DeFiLend.PositionUpdated(
            user,
            address(collateralToken),
            "deposit",
            1e18,
            1e18,
            0,
            block.timestamp
        );
        lending.deposit(1e18);
        vm.stopPrank();
    }

    function testLiquidationExecutedEvent() public {
        vm.startPrank(user);
        lending.deposit(1e18);
        lending.borrow(1500e18);
        vm.stopPrank();

        // Crash price to trigger liquidation
        collateralFeed.updateAnswer(1800e8);

        borrowToken.mint(liquidator, 10000e18);
        vm.startPrank(liquidator);
        borrowToken.approve(address(lending), type(uint256).max);

        vm.expectEmit(true, true, true, false);
        emit DeFiLend.LiquidationExecuted(
            liquidator,
            user,
            address(collateralToken),
            address(borrowToken),
            500e18,
            0,
            0,
            0
        );
        lending.liquidate(user, 500e18);
        vm.stopPrank();
    }

    function testInsufficientPoolLiquidity() public {
        // Deploy a lending pool with zero borrow token liquidity
        MockERC20 col2 = new MockERC20("COL2", "C2", 18);
        MockERC20 bor2 = new MockERC20("BOR2", "B2", 18);
        DeFiLend emptyLend = new DeFiLend(
            address(col2),
            address(bor2),
            address(collateralFeed),
            address(borrowFeed)
        );

        col2.mint(user, 100e18);
        vm.startPrank(user);
        col2.approve(address(emptyLend), type(uint256).max);
        emptyLend.deposit(10e18);

        vm.expectRevert(DeFiLend.InsufficientPoolLiquidity.selector);
        emptyLend.borrow(1e18); // Pool has 0 BOR2 liquidity
        vm.stopPrank();
    }

    function testGetMaxBorrow() public {
        vm.startPrank(user);
        lending.deposit(1e18); // $2000 collateral
        vm.stopPrank();

        // Max borrow = 2000 * 0.8 = $1600 worth of BOR at $1 = 1600e18
        assertApproxEqAbs(lending.getMaxBorrow(user), 1600e18, 1e10);
    }

    function testSupplyBorrowToken() public {
        MockERC20 col2 = new MockERC20("COL2", "C2", 18);
        MockERC20 bor2 = new MockERC20("BOR2", "B2", 18);
        DeFiLend emptyLend = new DeFiLend(
            address(col2),
            address(bor2),
            address(collateralFeed),
            address(borrowFeed)
        );

        // Seed liquidity via supplyBorrowToken
        bor2.mint(address(this), 5000e18);
        bor2.approve(address(emptyLend), 5000e18);
        emptyLend.supplyBorrowToken(5000e18);

        assertEq(bor2.balanceOf(address(emptyLend)), 5000e18);

        // Now borrowing should work
        col2.mint(user, 100e18);
        vm.startPrank(user);
        col2.approve(address(emptyLend), type(uint256).max);
        emptyLend.deposit(1e18); // $2000 collateral
        emptyLend.borrow(1000e18); // $1000 borrow — within limit
        vm.stopPrank();

        assertEq(bor2.balanceOf(user), 1000e18);
    }
}
