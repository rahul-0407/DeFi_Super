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
    error LiquidationRepaidExceedsCloseFactor();
    error BorrowCapExceeded();
    error PriceDeviationExceeded();

    // ──────────────────── Structs (packed) ────────────────────
    struct UserAccount {
        uint128 collateralAmount;
        uint128 borrowAmount;
        uint256 interestIndex; // User's interest index at last interaction
    }

    // ──────────────────── Constants & Immutables ────────────────────
    IERC20 public immutable collateralToken;
    IERC20 public immutable borrowToken;
    IAggregatorV3 public immutable collateralPriceFeed;
    IAggregatorV3 public immutable borrowPriceFeed;

    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant LIQUIDATION_BONUS = 5; // 5% bonus to liquidators
    uint256 public constant CLOSE_FACTOR = 50; // 50% max liquidation per txn
    uint256 public constant ORACLE_STALENESS = 1 hours;
    uint256 public constant PRICE_DEVIATION_THRESHOLD = 5e16; // 5% (1e18 scale)
    uint256 public constant SECONDS_PER_YEAR = 31536000;

    // ──────────────────── State Variables ────────────────────
    mapping(address => UserAccount) public userAccounts;
    uint256 public totalBorrowed;
    uint256 public borrowCap;

    // Interest Rate state
    uint256 public baseRate = 2e16; // 2% Base APR
    uint256 public multiplier = 1e17; // 10% Slope
    uint256 public reserveFactor = 1e17; // 10% of interest to treasury
    uint256 public interestIndex = 1e18; // Global interest index
    uint256 public lastAccrualTime;

    // Price Protection state
    uint256 public lastPriceCollateral;
    uint256 public lastPriceBorrow;

    address public treasury;

    // ──────────────────── Events ────────────────────
    event PositionUpdated(
        address indexed user,
        address indexed asset,
        string action,
        uint256 amount,
        uint128 newCollateral,
        uint128 newBorrow,
        uint256 timestamp
    );

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

    event BorrowCapUpdated(uint256 newCap);
    event InterestAccrued(uint256 totalBorrowed, uint256 interestIndex);
    event TreasuryUpdated(address indexed newTreasury);

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
        lastAccrualTime = block.timestamp;
        treasury = msg.sender;
    }

    // ──────────────────── Admin Functions ────────────────────
    function setBorrowCap(uint256 newCap) external onlyOwner {
        borrowCap = newCap;
        emit BorrowCapUpdated(newCap);
    }

    // ──────────────────── Core Functions ────────────────────

    /**
     * @notice Deposit collateral to the lending pool.
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        accrueInterest();
        _updateUserDebt(msg.sender);

        collateralToken.safeTransferFrom(msg.sender, address(this), amount);
        userAccounts[msg.sender].collateralAmount += uint128(amount);

        // 4️⃣ Seed/Update price for manipulation protection
        _getPriceWithDeviation(collateralPriceFeed, true);

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
     */
    function withdraw(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        accrueInterest();
        _updateUserDebt(msg.sender);

        userAccounts[msg.sender].collateralAmount -= uint128(amount);
        _getPriceWithDeviation(collateralPriceFeed, true);
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
     */
    function borrow(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        accrueInterest();
        _updateUserDebt(msg.sender);

        // Enforce global borrow cap
        uint256 newTotalBorrowed = totalBorrowed + amount;
        if (borrowCap > 0 && newTotalBorrowed > borrowCap)
            revert BorrowCapExceeded();
        if (borrowToken.balanceOf(address(this)) < amount)
            revert InsufficientCollateral(); // Not enough liquidity in pool

        totalBorrowed = newTotalBorrowed;
        userAccounts[msg.sender].borrowAmount += uint128(amount);

        _getPriceWithDeviation(collateralPriceFeed, true);
        _getPriceWithDeviation(borrowPriceFeed, false);

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
     */
    function repay(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        accrueInterest();
        _updateUserDebt(msg.sender);

        uint128 userBorrowed = userAccounts[msg.sender].borrowAmount;
        uint256 actualRepay = amount > userBorrowed ? userBorrowed : amount;

        borrowToken.safeTransferFrom(msg.sender, address(this), actualRepay);
        userAccounts[msg.sender].borrowAmount -= uint128(actualRepay);
        totalBorrowed -= actualRepay;

        UserAccount storage acct = userAccounts[msg.sender];
        emit PositionUpdated(
            msg.sender,
            address(borrowToken),
            "repay",
            actualRepay,
            acct.collateralAmount,
            acct.borrowAmount,
            block.timestamp
        );
    }

    /**
     * @notice Liquidate an unhealthy account with CLOSE_FACTOR enforcement.
     */
    function liquidate(
        address user,
        uint256 amountToRepay
    ) external nonReentrant whenNotPaused {
        accrueInterest();
        _updateUserDebt(user);

        uint256 healthFactorBefore = _getHealthFactorInternal(user);
        if (healthFactorBefore >= 1e18) revert AccountStillHealthy();

        UserAccount storage account = userAccounts[user];
        uint256 maxRepay = (uint256(account.borrowAmount) * CLOSE_FACTOR) / 100;
        if (amountToRepay > maxRepay)
            revert LiquidationRepaidExceedsCloseFactor();

        borrowToken.safeTransferFrom(msg.sender, address(this), amountToRepay);

        (uint256 colPrice, uint8 colDec) = _getPrice(collateralPriceFeed);
        (uint256 borPrice, uint8 borDec) = _getPrice(borrowPriceFeed);

        // Calculate collateral to seize: (debtRepaid * borPrice * 1.05) / colPrice
        uint256 collateralToSeize = (amountToRepay *
            borPrice *
            (10 ** (18 - borDec)) *
            (100 + LIQUIDATION_BONUS)) /
            (colPrice * (10 ** (18 - colDec)) * 100);

        // 5️⃣ Seizure Cap (Accounting Improvement)
        if (collateralToSeize > account.collateralAmount)
            collateralToSeize = account.collateralAmount;

        account.borrowAmount -= uint128(amountToRepay);
        account.collateralAmount -= uint128(collateralToSeize);
        totalBorrowed -= amountToRepay;

        collateralToken.safeTransfer(msg.sender, collateralToSeize);

        emit LiquidationExecuted(
            msg.sender,
            user,
            address(collateralToken),
            address(borrowToken),
            amountToRepay,
            collateralToSeize,
            healthFactorBefore,
            block.timestamp
        );
    }

    // ──────────────────── View Functions ────────────────────

    function getHealthFactor(address user) external view returns (uint256) {
        return _getHealthFactorInternal(user);
    }

    function _getHealthFactorInternal(
        address user
    ) internal view returns (uint256) {
        UserAccount storage account = userAccounts[user];
        uint256 borrows = account.borrowAmount;
        if (borrows == 0) return 1000e18;

        (uint256 colPrice, uint8 colDec) = _getPrice(collateralPriceFeed);
        (uint256 borPrice, uint8 borDec) = _getPrice(borrowPriceFeed);

        uint256 colValue = (uint256(account.collateralAmount) *
            colPrice *
            (10 ** (18 - colDec)));
        uint256 borValue = (uint256(borrows) *
            borPrice *
            (10 ** (18 - borDec)));

        return (colValue * LIQUIDATION_THRESHOLD * 1e18) / (borValue * 100);
    }

    // ──────────────────── Internal Functions ────────────────────

    /**
     * @notice 1️⃣ Interest Rate Model (Linear Utilization-based)
     */
    function accrueInterest() public {
        uint256 timeElapsed = block.timestamp - lastAccrualTime;
        if (timeElapsed == 0) return;

        uint256 _totalBorrowed = totalBorrowed;
        if (_totalBorrowed > 0) {
            uint256 cash = borrowToken.balanceOf(address(this));
            uint256 utilization = (_totalBorrowed * 1e18) /
                (_totalBorrowed + cash);
            uint256 borrowRate = baseRate + (multiplier * utilization) / 1e18;
            uint256 interest = (_totalBorrowed * borrowRate * timeElapsed) /
                SECONDS_PER_YEAR;

            totalBorrowed = _totalBorrowed + interest;
            interestIndex =
                interestIndex +
                (interestIndex * interest * 1e18) /
                (_totalBorrowed * 1e18);

            // 2️⃣ Protocol Treasury Fee (from interest)
            if (reserveFactor > 0 && treasury != address(0)) {
                uint256 reserveAmount = (interest * reserveFactor) / 1e18;
                if (reserveAmount > 0 && cash >= reserveAmount) {
                    borrowToken.safeTransfer(treasury, reserveAmount);
                }
            }
        }

        lastAccrualTime = block.timestamp;
        emit InterestAccrued(totalBorrowed, interestIndex);
    }

    function _updateUserDebt(address user) internal {
        UserAccount storage acct = userAccounts[user];
        if (acct.interestIndex == 0) {
            acct.interestIndex = interestIndex;
            return;
        }
        if (acct.borrowAmount > 0) {
            uint256 ratio = (interestIndex * 1e18) / acct.interestIndex;
            acct.borrowAmount = uint128(
                (uint256(acct.borrowAmount) * ratio) / 1e18
            );
        }
        acct.interestIndex = interestIndex;
    }

    /**
     * @notice 4️⃣ Price Manipulation Protection (Deviation Check)
     */
    function _getPriceWithDeviation(
        IAggregatorV3 feed,
        bool isCollateral
    ) internal returns (uint256 price, uint8 feedDecimals) {
        (price, feedDecimals) = _getPrice(feed);
        uint256 lastPrice = isCollateral
            ? lastPriceCollateral
            : lastPriceBorrow;

        if (lastPrice > 0) {
            uint256 diff = price > lastPrice
                ? price - lastPrice
                : lastPrice - price;
            if ((diff * 1e18) / lastPrice > PRICE_DEVIATION_THRESHOLD) {
                revert PriceDeviationExceeded();
            }
        }

        if (isCollateral) lastPriceCollateral = price;
        else lastPriceBorrow = price;
    }

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
        return _getHealthFactorInternal(user) >= 1e18;
    }

    // ──────────────────── Owner Functions ────────────────────
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert OwnableInvalidOwner(address(0)); // Re-using a standard approach
        treasury = _treasury;
        emit TreasuryUpdated(_treasury);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
