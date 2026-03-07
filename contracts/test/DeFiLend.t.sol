// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {DeFiLend} from "../src/DeFiLend.sol";
import {MockERC20} from "./MockERC20.sol";

contract DeFiLendTest is Test {
    DeFiLend lending;
    MockERC20 collateralToken;
    MockERC20 borrowToken;
    address user = address(1);
    address liquidator = address(2);

    function setUp() public {
        collateralToken = new MockERC20("Collateral", "COL");
        borrowToken = new MockERC20("Borrow", "BOR");
        lending = new DeFiLend(address(collateralToken), address(borrowToken));

        collateralToken.mint(user, 1000e18);
        borrowToken.mint(address(lending), 1000e18);

        vm.prank(user);
        collateralToken.approve(address(lending), type(uint256).max);
    }

    function testDepositAndBorrow() public {
        vm.startPrank(user);
        lending.deposit(100e18);
        lending.borrow(50e18);
        vm.stopPrank();

        assertEq(lending.getHealthFactor(user), 160e16); // 1.6 * 1e18
        assertEq(borrowToken.balanceOf(user), 50e18);
    }

    function testBorrowOverLimitReverts() public {
        vm.startPrank(user);
        lending.deposit(100e18);
        vm.expectRevert(DeFiLend.InsufficientCollateral.selector);
        lending.borrow(81e18);
        vm.stopPrank();
    }

    function testRepay() public {
        vm.startPrank(user);
        lending.deposit(100e18);
        lending.borrow(50e18);

        borrowToken.approve(address(lending), type(uint256).max);
        lending.repay(25e18);
        vm.stopPrank();

        // Health factor should improve: (100 * 80 / 100) / 25 * 1e18 = 3.2e18
        assertEq(lending.getHealthFactor(user), 320e16);
    }

    function testLiquidation() public {
        // Create a fresh lending pool for a clean test
        DeFiLend lending2 = new DeFiLend(
            address(collateralToken),
            address(borrowToken)
        );
        borrowToken.mint(address(lending2), 1000e18);

        address borrower = address(10);
        collateralToken.mint(borrower, 1000e18);

        vm.startPrank(borrower);
        collateralToken.approve(address(lending2), type(uint256).max);
        lending2.deposit(100e18);
        lending2.borrow(80e18); // HF = 1.0 exactly
        vm.stopPrank();

        // Simulate price crash: override storage to set collateral = 90e18, borrow = 80e18
        // OZ v5 uses transient-like storage — we try each possible mapping slot
        uint128 newCollateral = 90e18;
        uint128 currentBorrow = 80e18;
        bytes32 packedValue = bytes32(
            (uint256(currentBorrow) << 128) | uint256(newCollateral)
        );

        bool found = false;
        for (uint256 s = 0; s <= 10; s++) {
            bytes32 accountSlot = keccak256(abi.encode(borrower, s));
            vm.store(address(lending2), accountSlot, packedValue);
            (uint128 col, uint128 bor) = lending2.userAccounts(borrower);
            if (col == newCollateral && bor == currentBorrow) {
                found = true;
                break;
            }
            // Reset if wrong slot
            vm.store(address(lending2), accountSlot, bytes32(0));
        }
        assertTrue(found, "Could not find storage slot for userAccounts");

        // Verify account is now unhealthy
        assertTrue(lending2.getHealthFactor(borrower) < 1e18);

        // Liquidator repays some debt
        borrowToken.mint(liquidator, 1000e18);
        vm.startPrank(liquidator);
        borrowToken.approve(address(lending2), type(uint256).max);
        lending2.liquidate(borrower, 40e18);
        vm.stopPrank();

        // Liquidator should receive 40 * 1.05 = 42e18 collateral
        assertEq(collateralToken.balanceOf(liquidator), 42e18);
    }

    function testLiquidationRevertsOnHealthyAccount() public {
        vm.startPrank(user);
        lending.deposit(100e18);
        lending.borrow(50e18);
        vm.stopPrank();

        borrowToken.mint(liquidator, 100e18);
        vm.startPrank(liquidator);
        borrowToken.approve(address(lending), type(uint256).max);
        vm.expectRevert(DeFiLend.AccountStillHealthy.selector);
        lending.liquidate(user, 25e18);
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
        lending.deposit(100e18);
        vm.stopPrank();

        lending.unpause();

        vm.startPrank(user);
        lending.deposit(100e18);
        vm.stopPrank();
    }
}
