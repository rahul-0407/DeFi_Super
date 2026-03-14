// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {DeFiFlashLoan} from "../src/DeFiFlashLoan.sol";
import {IFlashBorrower} from "../src/IFlashBorrower.sol";
import {MockERC20} from "./MockERC20.sol";

/// @dev Mock borrower that properly repays the flash loan
contract MockFlashBorrower is IFlashBorrower {
    bool public shouldRepay = true;
    bool public shouldReturnCorrectHash = true;

    function setShouldRepay(bool _shouldRepay) external {
        shouldRepay = _shouldRepay;
    }

    function setShouldReturnCorrectHash(bool _shouldReturn) external {
        shouldReturnCorrectHash = _shouldReturn;
    }

    function onFlashLoan(
        address,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata
    ) external override returns (bytes32) {
        if (shouldRepay) {
            // Repay principal + fee to the lender (msg.sender)
            MockERC20(token).transfer(msg.sender, amount + fee);
        }

        if (shouldReturnCorrectHash) {
            return keccak256("IFlashBorrower.onFlashLoan");
        } else {
            return bytes32(0);
        }
    }
}

contract DeFiFlashLoanTest is Test {
    DeFiFlashLoan flashLoan;
    MockERC20 token;
    MockFlashBorrower borrower;
    address owner;

    function setUp() public {
        owner = address(this);
        token = new MockERC20("Test Token", "TST", 18);
        flashLoan = new DeFiFlashLoan();
        borrower = new MockFlashBorrower();

        // Fund the flash loan pool
        token.mint(address(flashLoan), 10000e18);
        // Fund the borrower so it can pay fees
        token.mint(address(borrower), 100e18);

        // Enable the token
        flashLoan.setSupportedToken(address(token), true);
    }

    function testFlashLoanSuccess() public {
        uint256 loanAmount = 1000e18;
        uint256 expectedFee = (loanAmount * 9) / 10000; // 0.09%

        uint256 poolBalanceBefore = token.balanceOf(address(flashLoan));

        vm.expectEmit(true, true, true, false);
        emit DeFiFlashLoan.FlashLoanExecuted(
            address(this),
            address(borrower),
            address(token),
            loanAmount,
            expectedFee,
            block.timestamp
        );
        flashLoan.flashLoan(borrower, address(token), loanAmount, "");

        uint256 poolBalanceAfter = token.balanceOf(address(flashLoan));

        // Pool should have gained the fee
        assertEq(poolBalanceAfter, poolBalanceBefore + expectedFee);
        assertEq(flashLoan.feesCollected(address(token)), expectedFee);
    }

    function testFlashFeeCalculation() public view {
        // 1000e18 * 9 / 10000 = 0.9e18
        uint256 computed = flashLoan.flashFee(1000e18);
        uint256 expected = 9e17; // 0.09% of 1000
        assertEq(computed, expected);
    }

    function testFlashLoanNotRepaidReverts() public {
        borrower.setShouldRepay(false);

        vm.expectRevert(DeFiFlashLoan.FlashLoanNotRepaid.selector);
        flashLoan.flashLoan(borrower, address(token), 1000e18, "");
    }

    function testFlashLoanBadCallbackReverts() public {
        borrower.setShouldReturnCorrectHash(false);

        vm.expectRevert(DeFiFlashLoan.FlashLoanCallbackFailed.selector);
        flashLoan.flashLoan(borrower, address(token), 1000e18, "");
    }

    function testUnsupportedTokenReverts() public {
        MockERC20 unsupported = new MockERC20("Bad", "BAD", 18);
        vm.expectRevert(DeFiFlashLoan.UnsupportedToken.selector);
        flashLoan.flashLoan(borrower, address(unsupported), 1000e18, "");
    }

    function testZeroAmountReverts() public {
        vm.expectRevert(DeFiFlashLoan.ZeroAmount.selector);
        flashLoan.flashLoan(borrower, address(token), 0, "");
    }

    function testMaxFlashLoan() public view {
        assertEq(flashLoan.maxFlashLoan(address(token)), 10000e18);
    }

    function testMaxFlashLoanUnsupported() public view {
        address unsupported = address(999);
        assertEq(flashLoan.maxFlashLoan(unsupported), 0);
    }

    function testWithdrawFees() public {
        // Generate some fees
        flashLoan.flashLoan(borrower, address(token), 1000e18, "");

        uint256 fees = flashLoan.feesCollected(address(token));
        assertGt(fees, 0);

        // Treasury defaults to owner (address(this))
        uint256 balanceBefore = token.balanceOf(address(this));
        flashLoan.withdrawFees(address(token));

        assertEq(token.balanceOf(address(this)), balanceBefore + fees);
        assertEq(flashLoan.feesCollected(address(token)), 0);
    }

    function testSetTreasury() public {
        address newTreasury = address(123);
        flashLoan.setTreasury(newTreasury);
        assertEq(flashLoan.treasury(), newTreasury);
    }

    function testPauseBlock() public {
        flashLoan.pause();

        vm.expectRevert();
        flashLoan.flashLoan(borrower, address(token), 1000e18, "");
    }

    function testOnlyOwnerSetToken() public {
        vm.prank(address(42));
        vm.expectRevert();
        flashLoan.setSupportedToken(address(token), false);
    }
}
