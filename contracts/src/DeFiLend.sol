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

/**
 * @title DeFiLend
 * @author DeFi Super
 * @notice Over-collateralized lending protocol with liquidation mechanism.
 * @dev Collateral/borrow tokens are fixed per deployment. Uses 1:1 price mock (production would use Chainlink oracle).
 *
 * Security: ReentrancyGuard, Ownable, Pausable, SafeERC20
 * Gas: Custom errors, struct packing (uint128), unchecked math, storage caching
 */
contract DeFiLend is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ──────────────────── Custom Errors ────────────────────
    error UnhealthyAccountAfterWithdrawal();
    error InsufficientCollateral();
    error AccountStillHealthy();
    error ZeroAmount();

    // ──────────────────── Structs (packed) ────────────────────
    /// @dev Packed into single 256-bit slot for gas efficiency
    struct UserAccount {
        uint128 collateralAmount;
        uint128 borrowAmount;
    }

    // ──────────────────── Constants & Immutables ────────────────────
    IERC20 public immutable collateralToken;
    IERC20 public immutable borrowToken;
    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant LIQUIDATION_BONUS = 5; // 5% bonus to liquidators

    // ──────────────────── State Variables ────────────────────
    mapping(address => UserAccount) public userAccounts;

    // ──────────────────── Events ────────────────────
    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event Borrow(address indexed user, uint256 amount);
    event Repay(address indexed user, uint256 amount);
    event Liquidate(
        address indexed liquidator,
        address indexed user,
        uint256 debtRepaid,
        uint256 collateralSeized
    );

    // ──────────────────── Constructor ────────────────────
    constructor(
        address _collateralToken,
        address _borrowToken
    ) Ownable(msg.sender) {
        collateralToken = IERC20(_collateralToken);
        borrowToken = IERC20(_borrowToken);
    }

    // ──────────────────── Core Functions ────────────────────

    /**
     * @notice Deposit collateral to the lending pool.
     * @param amount Amount of collateral to deposit
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        userAccounts[msg.sender].collateralAmount += uint128(amount);
        emit Deposit(msg.sender, amount);
    }

    /**
     * @notice Withdraw collateral if account remains healthy after withdrawal.
     * @param amount Amount of collateral to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        userAccounts[msg.sender].collateralAmount -= uint128(amount);
        if (!_isHealthy(msg.sender)) revert UnhealthyAccountAfterWithdrawal();
        collateralToken.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }

    /**
     * @notice Borrow tokens against deposited collateral.
     * @param amount Amount to borrow
     */
    function borrow(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        userAccounts[msg.sender].borrowAmount += uint128(amount);
        if (!_isHealthy(msg.sender)) revert InsufficientCollateral();
        borrowToken.safeTransfer(msg.sender, amount);
        emit Borrow(msg.sender, amount);
    }

    /**
     * @notice Repay borrowed tokens.
     * @param amount Amount to repay
     */
    function repay(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
        userAccounts[msg.sender].borrowAmount -= uint128(amount);
        emit Repay(msg.sender, amount);
    }

    /**
     * @notice Liquidate an unhealthy account. Liquidator repays debt and receives collateral + bonus.
     * @dev Anyone can call. Uses 1:1 price assumption (production should use oracle).
     * @param user Address of the unhealthy borrower
     * @param amountToRepay Amount of debt to repay on behalf of user
     */
    function liquidate(
        address user,
        uint256 amountToRepay
    ) external nonReentrant whenNotPaused {
        if (_isHealthy(user)) revert AccountStillHealthy();

        borrowToken.safeTransferFrom(msg.sender, address(this), amountToRepay);

        // Collateral to seize = debt repaid * (100 + bonus) / 100
        uint256 collateralToReceive;
        unchecked {
            collateralToReceive =
                (amountToRepay * (100 + LIQUIDATION_BONUS)) /
                100;
        }

        userAccounts[user].borrowAmount -= uint128(amountToRepay);
        userAccounts[user].collateralAmount -= uint128(collateralToReceive);

        collateralToken.safeTransfer(msg.sender, collateralToReceive);
        emit Liquidate(msg.sender, user, amountToRepay, collateralToReceive);
    }

    // ──────────────────── View Functions ────────────────────

    /**
     * @notice Get health factor for a user. Returns 1000e18 if no borrows.
     * @dev Health factor = (collateral * threshold / 100) / borrow * 1e18
     */
    function getHealthFactor(address user) external view returns (uint256) {
        UserAccount storage account = userAccounts[user];
        uint128 _borrowAmount = account.borrowAmount; // Cache
        if (_borrowAmount == 0) return 1000e18;
        return
            (uint256(account.collateralAmount) * LIQUIDATION_THRESHOLD * 1e18) /
            (uint256(_borrowAmount) * 100);
    }

    // ──────────────────── Internal Functions ────────────────────

    function _isHealthy(address user) internal view returns (bool) {
        UserAccount storage account = userAccounts[user];
        uint128 _borrowAmount = account.borrowAmount; // Cache
        if (_borrowAmount == 0) return true;
        return
            (uint256(account.collateralAmount) * LIQUIDATION_THRESHOLD) / 100 >=
            uint256(_borrowAmount);
    }

    // ──────────────────── Owner Functions ────────────────────
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
