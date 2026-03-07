// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {IFlashBorrower} from "./IFlashBorrower.sol";

/**
 * @title DeFiFlashLoan
 * @author DeFi Super
 * @notice Flash loan provider — borrow tokens without collateral, repay + fee in same transaction.
 * @dev Follows EIP-3156 pattern. The borrower must implement IFlashBorrower and repay principal + fee
 *      within the same transaction. A 0.09% fee (9 bps) is charged.
 *
 * Security: ReentrancyGuard, Ownable, Pausable, SafeERC20
 * Gas: Custom errors, immutable fee, unchecked math
 */
contract DeFiFlashLoan is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ──────────────────── Custom Errors ────────────────────
    error UnsupportedToken();
    error FlashLoanCallbackFailed();
    error FlashLoanNotRepaid();
    error ZeroAmount();

    // ──────────────────── Constants ────────────────────
    /// @notice Flash loan fee: 0.09% (9 basis points)
    uint256 public constant FLASH_LOAN_FEE = 9; // basis points
    uint256 private constant BPS_DENOMINATOR = 10_000;

    /// @dev Expected return value from IFlashBorrower.onFlashLoan
    bytes32 private constant CALLBACK_SUCCESS =
        keccak256("IFlashBorrower.onFlashLoan");

    // ──────────────────── State Variables ────────────────────
    /// @notice Tokens supported for flash loans
    mapping(address => bool) public supportedTokens;

    /// @notice Total fees collected per token
    mapping(address => uint256) public feesCollected;

    // ──────────────────── Events ────────────────────
    event FlashLoanExecuted(
        address indexed initiator,
        address indexed borrower,
        address indexed token,
        uint256 amount,
        uint256 fee,
        uint256 timestamp
    );
    event TokenSupported(address indexed token, bool supported);
    event FeesWithdrawn(
        address indexed token,
        uint256 amount,
        address indexed to
    );

    // ──────────────────── Constructor ────────────────────
    constructor() Ownable(msg.sender) {}

    // ──────────────────── Admin Functions ────────────────────

    /**
     * @notice Add or remove a token from the supported list.
     * @param token Token address to configure
     * @param supported Whether to enable or disable
     */
    function setSupportedToken(
        address token,
        bool supported
    ) external onlyOwner {
        supportedTokens[token] = supported;
        emit TokenSupported(token, supported);
    }

    /**
     * @notice Withdraw accumulated fees.
     * @param token Token to withdraw fees for
     * @param to Recipient address
     */
    function withdrawFees(address token, address to) external onlyOwner {
        uint256 amount = feesCollected[token];
        feesCollected[token] = 0;
        IERC20(token).safeTransfer(to, amount);
        emit FeesWithdrawn(token, amount, to);
    }

    // ──────────────────── Core Functions ────────────────────

    /**
     * @notice Execute a flash loan.
     * @dev The borrower must implement IFlashBorrower and return CALLBACK_SUCCESS.
     *      The contract verifies full repayment (principal + fee) after the callback.
     * @param receiver The flash loan borrower contract
     * @param token The token to borrow
     * @param amount The amount to borrow
     * @param data Arbitrary data to pass to the borrower
     */
    function flashLoan(
        IFlashBorrower receiver,
        address token,
        uint256 amount,
        bytes calldata data
    ) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        if (!supportedTokens[token]) revert UnsupportedToken();

        uint256 fee = flashFee(amount);
        uint256 balanceBefore = IERC20(token).balanceOf(address(this));

        // Transfer tokens to borrower
        IERC20(token).safeTransfer(address(receiver), amount);

        // Call borrower's callback
        bytes32 result = receiver.onFlashLoan(
            msg.sender,
            token,
            amount,
            fee,
            data
        );
        if (result != CALLBACK_SUCCESS) revert FlashLoanCallbackFailed();

        // Verify repayment
        uint256 balanceAfter = IERC20(token).balanceOf(address(this));
        if (balanceAfter < balanceBefore + fee) revert FlashLoanNotRepaid();

        // Track fees
        unchecked {
            feesCollected[token] += fee;
        }

        emit FlashLoanExecuted(
            msg.sender,
            address(receiver),
            token,
            amount,
            fee,
            block.timestamp
        );
    }

    // ──────────────────── View Functions ────────────────────

    /**
     * @notice Calculate flash loan fee for a given amount.
     * @param amount The loan amount
     * @return The fee amount
     */
    function flashFee(uint256 amount) public pure returns (uint256) {
        return (amount * FLASH_LOAN_FEE) / BPS_DENOMINATOR;
    }

    /**
     * @notice Get the maximum flash loan amount available for a token.
     * @param token The token address
     * @return The maximum loan amount
     */
    function maxFlashLoan(address token) external view returns (uint256) {
        if (!supportedTokens[token]) return 0;
        return IERC20(token).balanceOf(address(this));
    }

    // ──────────────────── Owner Functions ────────────────────
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
