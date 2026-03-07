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
import {IAggregatorV3} from "./IAggregatorV3.sol";

/**
 * @title DeFiLend
 * @author DeFi Super
 * @notice Over-collateralized lending protocol with Chainlink oracle pricing and liquidation.
 * @dev Uses Chainlink AggregatorV3 price feeds for accurate collateral/borrow valuation.
 *
 * Security: ReentrancyGuard, Ownable, Pausable, SafeERC20, oracle staleness checks
 * Gas: Custom errors, struct packing (uint128), unchecked math, storage caching
 */
contract DeFiLend is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ──────────────────── Custom Errors ────────────────────
    error UnhealthyAccountAfterWithdrawal();
    error InsufficientCollateral();
    error AccountStillHealthy();
    error ZeroAmount();
    error StaleOraclePrice();
    error InvalidOraclePrice();

    // ──────────────────── Structs (packed) ────────────────────
    /// @dev Packed into single 256-bit slot for gas efficiency
    struct UserAccount {
        uint128 collateralAmount;
        uint128 borrowAmount;
    }

    // ──────────────────── Constants & Immutables ────────────────────
    IERC20 public immutable collateralToken;
    IERC20 public immutable borrowToken;
    IAggregatorV3 public immutable collateralPriceFeed;
    IAggregatorV3 public immutable borrowPriceFeed;

    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant LIQUIDATION_BONUS = 5; // 5% bonus to liquidators
    uint256 public constant ORACLE_STALENESS = 1 hours;

    // ──────────────────── State Variables ────────────────────
    mapping(address => UserAccount) public userAccounts;

    // ──────────────────── Events ────────────────────

    /// @notice Emitted when a user's position changes (deposit, withdraw, borrow, repay)
    event PositionUpdated(
        address indexed user,
        address indexed asset,
        string action,
        uint256 amount,
        uint128 newCollateral,
        uint128 newBorrow,
        uint256 timestamp
    );

    /// @notice Emitted when a liquidation is executed
    event LiquidationExecuted(
        address indexed liquidator,
        address indexed user,
        address indexed collateralAsset,
        address borrowAsset,
        uint256 debtRepaid,
        uint256 collateralSeized,
        uint256 healthFactorBefore,
        uint256 timestamp
    );

    // ──────────────────── Constructor ────────────────────
    constructor(
        address _collateralToken,
        address _borrowToken,
        address _collateralPriceFeed,
        address _borrowPriceFeed
    ) Ownable(msg.sender) {
        collateralToken = IERC20(_collateralToken);
        borrowToken = IERC20(_borrowToken);
        collateralPriceFeed = IAggregatorV3(_collateralPriceFeed);
        borrowPriceFeed = IAggregatorV3(_borrowPriceFeed);
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

        UserAccount storage acct = userAccounts[msg.sender];
        emit PositionUpdated(
            msg.sender,
            address(collateralToken),
            "deposit",
            amount,
            acct.collateralAmount,
            acct.borrowAmount,
            block.timestamp
        );
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

        UserAccount storage acct = userAccounts[msg.sender];
        emit PositionUpdated(
            msg.sender,
            address(collateralToken),
            "withdraw",
            amount,
            acct.collateralAmount,
            acct.borrowAmount,
            block.timestamp
        );
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

        UserAccount storage acct = userAccounts[msg.sender];
        emit PositionUpdated(
            msg.sender,
            address(borrowToken),
            "borrow",
            amount,
            acct.collateralAmount,
            acct.borrowAmount,
            block.timestamp
        );
    }

    /**
     * @notice Repay borrowed tokens.
     * @param amount Amount to repay
     */
    function repay(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
        userAccounts[msg.sender].borrowAmount -= uint128(amount);

        UserAccount storage acct = userAccounts[msg.sender];
        emit PositionUpdated(
            msg.sender,
            address(borrowToken),
            "repay",
            amount,
            acct.collateralAmount,
            acct.borrowAmount,
            block.timestamp
        );
    }

    /**
     * @notice Liquidate an unhealthy account. Liquidator repays debt and receives collateral + bonus.
     * @dev Uses Chainlink oracle prices for valuation. Collateral seized accounts for price difference.
     * @param user Address of the unhealthy borrower
     * @param amountToRepay Amount of debt to repay on behalf of user
     */
    function liquidate(
        address user,
        uint256 amountToRepay
    ) external nonReentrant whenNotPaused {
        uint256 healthFactorBefore = this.getHealthFactor(user);
        if (healthFactorBefore >= 1e18) revert AccountStillHealthy();

        borrowToken.safeTransferFrom(msg.sender, address(this), amountToRepay);

        // Calculate collateral to seize using oracle prices
        // collateralToSeize = (debtRepaid * borrowPrice * (100 + bonus)) / (collateralPrice * 100)
        (uint256 collateralPrice, uint8 colDecimals) = _getPrice(
            collateralPriceFeed
        );
        (uint256 borrowPrice, uint8 borDecimals) = _getPrice(borrowPriceFeed);

        uint256 collateralToReceive;
        unchecked {
            // Normalize both prices to 18 decimals for consistent math
            uint256 normalizedBorrowPrice = borrowPrice *
                (10 ** (18 - borDecimals));
            uint256 normalizedCollateralPrice = collateralPrice *
                (10 ** (18 - colDecimals));

            collateralToReceive =
                (amountToRepay *
                    normalizedBorrowPrice *
                    (100 + LIQUIDATION_BONUS)) /
                (normalizedCollateralPrice * 100);
        }

        userAccounts[user].borrowAmount -= uint128(amountToRepay);
        userAccounts[user].collateralAmount -= uint128(collateralToReceive);

        collateralToken.safeTransfer(msg.sender, collateralToReceive);

        emit LiquidationExecuted(
            msg.sender,
            user,
            address(collateralToken),
            address(borrowToken),
            amountToRepay,
            collateralToReceive,
            healthFactorBefore,
            block.timestamp
        );
    }

    // ──────────────────── View Functions ────────────────────

    /**
     * @notice Get health factor for a user. Returns 1000e18 if no borrows.
     * @dev Health factor = (collateralValue * threshold) / (borrowValue * 100), scaled by 1e18
     *      collateralValue = collateral * collateralPrice
     *      borrowValue = borrow * borrowPrice
     */
    function getHealthFactor(address user) external view returns (uint256) {
        UserAccount storage account = userAccounts[user];
        uint128 _borrowAmount = account.borrowAmount;
        if (_borrowAmount == 0) return 1000e18;

        (uint256 collateralPrice, uint8 colDecimals) = _getPrice(
            collateralPriceFeed
        );
        (uint256 borrowPrice, uint8 borDecimals) = _getPrice(borrowPriceFeed);

        // Normalize to 18 decimals
        uint256 collateralValue = uint256(account.collateralAmount) *
            collateralPrice *
            (10 ** (18 - colDecimals));
        uint256 borrowValue = uint256(_borrowAmount) *
            borrowPrice *
            (10 ** (18 - borDecimals));

        return
            (collateralValue * LIQUIDATION_THRESHOLD * 1e18) /
            (borrowValue * 100);
    }

    // ──────────────────── Internal Functions ────────────────────

    /**
     * @notice Fetch price from Chainlink feed with staleness and validity checks.
     * @param feed The Chainlink price feed to query
     * @return price The latest price (always positive)
     * @return feedDecimals The decimals of the price feed
     */
    function _getPrice(
        IAggregatorV3 feed
    ) internal view returns (uint256 price, uint8 feedDecimals) {
        (, int256 answer, , uint256 updatedAt, ) = feed.latestRoundData();
        if (answer <= 0) revert InvalidOraclePrice();
        if (block.timestamp - updatedAt > ORACLE_STALENESS)
            revert StaleOraclePrice();
        return (uint256(answer), feed.decimals());
    }

    function _isHealthy(address user) internal view returns (bool) {
        UserAccount storage account = userAccounts[user];
        uint128 _borrowAmount = account.borrowAmount;
        if (_borrowAmount == 0) return true;

        (uint256 collateralPrice, uint8 colDecimals) = _getPrice(
            collateralPriceFeed
        );
        (uint256 borrowPrice, uint8 borDecimals) = _getPrice(borrowPriceFeed);

        uint256 collateralValue = uint256(account.collateralAmount) *
            collateralPrice *
            (10 ** (18 - colDecimals));
        uint256 borrowValue = uint256(_borrowAmount) *
            borrowPrice *
            (10 ** (18 - borDecimals));

        return (collateralValue * LIQUIDATION_THRESHOLD) / 100 >= borrowValue;
    }

    // ──────────────────── Owner Functions ────────────────────
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
