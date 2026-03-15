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
 * @notice Production-grade over-collateralized lending protocol using Chainlink-only pricing.
 * @dev Uses Chainlink AggregatorV3 price feeds exclusively — no AMM dependency.
 *
 * Decimal normalization:
 *   USD value (1e18) = (tokenAmount × oraclePrice × 1e18) / (10^tokenDecimals × 10^oracleDecimals)
 *
 * Security: ReentrancyGuard, Ownable, Pausable, SafeERC20, oracle staleness + zero-price checks
 * Gas: Custom errors, struct packing (uint128), storage caching
 */
contract DeFiLend is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ──────────────────── Custom Errors ────────────────────
    error UnhealthyAccountAfterWithdrawal();
    error InsufficientCollateral();
    error InsufficientPoolLiquidity();
    error AccountStillHealthy();
    error ZeroAmount();
    error StaleOraclePrice();
    error InvalidOraclePrice();
    error LiquidationRepaidExceedsCloseFactor();
    error BorrowCapExceeded();

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

    uint8 public immutable collateralTokenDecimals;
    uint8 public immutable borrowTokenDecimals;

    uint256 public constant LIQUIDATION_THRESHOLD = 80; // 80%
    uint256 public constant LIQUIDATION_BONUS = 5; // 5% bonus to liquidators
    uint256 public constant CLOSE_FACTOR = 50; // 50% max liquidation per txn
    uint256 public constant ORACLE_STALENESS = 48 hours;
    uint256 public constant SECONDS_PER_YEAR = 31536000;

    // ──────────────────── State Variables ────────────────────
    mapping(address => UserAccount) public userAccounts;
    mapping(address => uint256) public suppliedLiquidity; // USDC Lender balances
    uint256 public totalBorrowed;
    uint256 public borrowCap;

    // Interest Rate state
    uint256 public baseRate = 2e16; // 2% Base APR
    uint256 public multiplier = 1e17; // 10% Slope
    uint256 public reserveFactor = 1e17; // 10% of interest to treasury
    uint256 public interestIndex = 1e18; // Global interest index
    uint256 public lastAccrualTime;

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

        // Cache token decimals at deploy time (saves gas on every price calc)
        collateralTokenDecimals = _getTokenDecimals(_collateralToken);
        borrowTokenDecimals = _getTokenDecimals(_borrowToken);
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
     * @dev Uses Chainlink oracles exclusively for price. No AMM dependency.
     */
    function borrow(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        accrueInterest();
        _updateUserDebt(msg.sender);

        // Check pool has enough liquidity
        if (borrowToken.balanceOf(address(this)) < amount)
            revert InsufficientPoolLiquidity();

        // Enforce global borrow cap
        uint256 newTotalBorrowed = totalBorrowed + amount;
        if (borrowCap > 0 && newTotalBorrowed > borrowCap)
            revert BorrowCapExceeded();

        totalBorrowed = newTotalBorrowed;
        userAccounts[msg.sender].borrowAmount += uint128(amount);

        // Check health factor AFTER updating state (Aave pattern)
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
     * @notice Supply borrow tokens to the pool (liquidity provider / seeding).
     * @dev Anyone can supply USDC to enable borrowing. Simple transfer, no yield in this version.
     */
    function supplyBorrowToken(
        uint256 amount
    ) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        accrueInterest();

        borrowToken.safeTransferFrom(msg.sender, address(this), amount);
        suppliedLiquidity[msg.sender] += amount;

        emit PositionUpdated(
            msg.sender,
            address(borrowToken),
            "supply_liquidity",
            amount,
            0,
            0,
            block.timestamp
        );
    }

    /**
     * @notice Withdraw supplied USDC liquidity from the pool.
     */
    function withdrawLiquidity(
        uint256 amount
    ) external nonReentrant whenNotPaused {
        if (amount == 0) revert ZeroAmount();
        if (suppliedLiquidity[msg.sender] < amount)
            revert InsufficientPoolLiquidity();

        // Ensure pool has enough cash (not all borrowed)
        if (borrowToken.balanceOf(address(this)) < amount)
            revert InsufficientPoolLiquidity();

        accrueInterest();
        suppliedLiquidity[msg.sender] -= amount;
        borrowToken.safeTransfer(msg.sender, amount);

        emit PositionUpdated(
            msg.sender,
            address(borrowToken),
            "withdraw_liquidity",
            amount,
            0,
            0,
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

        // Calculate collateral to seize using normalized USD values
        uint256 debtValueUSD = _toUSD(
            amountToRepay,
            borrowPriceFeed,
            borrowTokenDecimals
        );
        uint256 seizeValueUSD = (debtValueUSD * (100 + LIQUIDATION_BONUS)) /
            100;

        // Convert USD value back to collateral token amount
        (uint256 colPrice, uint8 colPriceDec) = _getPrice(collateralPriceFeed);
        uint256 collateralToSeize = (seizeValueUSD *
            (10 ** uint256(collateralTokenDecimals)) *
            (10 ** uint256(colPriceDec))) / (colPrice * 1e18);

        // Seizure Cap
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

    /**
     * @notice Get user's current borrow balance including accrued interest.
     */
    function getBorrowBalance(address user) public view returns (uint256) {
        UserAccount storage acct = userAccounts[user];
        if (acct.borrowAmount == 0) return 0;

        // Calculate live interest index
        uint256 _interestIndex = interestIndex;
        uint256 timeElapsed = block.timestamp - lastAccrualTime;
        if (timeElapsed > 0) {
            uint256 _totalBorrowed = totalBorrowed;
            if (_totalBorrowed > 0) {
                uint256 cash = borrowToken.balanceOf(address(this));
                uint256 utilization = (_totalBorrowed * 1e18) /
                    (_totalBorrowed + cash);
                uint256 borrowRate = baseRate +
                    (multiplier * utilization) /
                    1e18;
                uint256 interest = (_totalBorrowed * borrowRate * timeElapsed) /
                    (SECONDS_PER_YEAR * 1e18);
                _interestIndex =
                    _interestIndex +
                    (_interestIndex * interest) /
                    _totalBorrowed;
            }
        }

        uint256 ratio = (_interestIndex * 1e18) / acct.interestIndex;
        return (uint256(acct.borrowAmount) * ratio) / 1e18;
    }

    /**
     * @notice Get the maximum amount of borrow token a user can borrow.
     */
    function getMaxBorrow(address user) external view returns (uint256) {
        UserAccount storage account = userAccounts[user];
        uint256 colValueUSD = _toUSD(
            account.collateralAmount,
            collateralPriceFeed,
            collateralTokenDecimals
        );
        uint256 maxBorrowUSD = (colValueUSD * LIQUIDATION_THRESHOLD) / 100;

        // Subtract existing borrow value
        uint256 currentBorrowUSD = _toUSD(
            account.borrowAmount,
            borrowPriceFeed,
            borrowTokenDecimals
        );

        if (maxBorrowUSD <= currentBorrowUSD) return 0;
        uint256 remainingUSD = maxBorrowUSD - currentBorrowUSD;

        // Convert remaining USD to borrow token amount
        (uint256 borPrice, uint8 borPriceDec) = _getPrice(borrowPriceFeed);
        return
            (remainingUSD *
                (10 ** uint256(borrowTokenDecimals)) *
                (10 ** uint256(borPriceDec))) / (borPrice * 1e18);
    }

    /**
     * @notice Calculate health factor.
     * @dev HF = (collateralValueUSD × LTV) / borrowValueUSD
     *      All USD values normalized to 1e18 scale.
     *      HF >= 1e18 means healthy. HF < 1e18 means liquidatable.
     */
    function _getHealthFactorInternal(
        address user
    ) internal view returns (uint256) {
        UserAccount storage account = userAccounts[user];
        uint256 borrows = account.borrowAmount;
        if (borrows == 0) return 1000e18;

        uint256 colValueUSD = _toUSD(
            account.collateralAmount,
            collateralPriceFeed,
            collateralTokenDecimals
        );
        uint256 borValueUSD = _toUSD(
            borrows,
            borrowPriceFeed,
            borrowTokenDecimals
        );

        // HF = (colValueUSD * LTV * 1e18) / (borValueUSD * 100)
        return
            (colValueUSD * LIQUIDATION_THRESHOLD * 1e18) / (borValueUSD * 100);
    }

    // ──────────────────── Internal Functions ────────────────────

    /**
     * @notice Convert a token amount to its USD value (normalized to 1e18).
     * @param amount The token amount in its native decimals.
     * @param feed The Chainlink price feed for the token.
     * @param tokenDecimals The token's decimal places (e.g., 18 for WETH, 6 for USDC).
     * @return USD value with 18 decimal precision.
     *
     * Formula: usdValue = (amount × price × 1e18) / (10^tokenDecimals × 10^priceDecimals)
     *
     * Example (1 WETH @ $3000):
     *   amount=1e18, price=3000e8, tokenDec=18, priceDec=8
     *   = (1e18 × 3000e8 × 1e18) / (1e18 × 1e8) = 3000e18
     *
     * Example (1500 USDC @ $1):
     *   amount=1500e6, price=1e8, tokenDec=6, priceDec=8
     *   = (1500e6 × 1e8 × 1e18) / (1e6 × 1e8) = 1500e18
     */
    function _toUSD(
        uint256 amount,
        IAggregatorV3 feed,
        uint8 tokenDecimals
    ) internal view returns (uint256) {
        if (amount == 0) return 0;
        (uint256 price, uint8 priceDecimals) = _getPrice(feed);
        return
            (amount * price * 1e18) /
            (10 ** uint256(tokenDecimals) * 10 ** uint256(priceDecimals));
    }

    /**
     * @notice Interest Rate Model (Linear Utilization-based)
     */
    function accrueInterest() public {
        uint256 timeElapsed = block.timestamp - lastAccrualTime;
        if (timeElapsed == 0) return;

        uint256 _totalBorrowed = totalBorrowed;
        if (_totalBorrowed > 0) {
            uint256 currentCash = borrowToken.balanceOf(address(this));
            uint256 utilization = (_totalBorrowed * 1e18) /
                (_totalBorrowed + currentCash);
            uint256 borrowRate = baseRate + (multiplier * utilization) / 1e18;
            uint256 interest = (_totalBorrowed * borrowRate * timeElapsed) /
                (SECONDS_PER_YEAR * 1e18);

            totalBorrowed = _totalBorrowed + interest;
            interestIndex =
                interestIndex +
                (interestIndex * interest) /
                _totalBorrowed;

            // Protocol Treasury Fee (from interest)
            if (reserveFactor > 0 && treasury != address(0)) {
                uint256 reserveAmount = (interest * reserveFactor) / 1e18;
                if (reserveAmount > 0) {
                    uint256 currentCashInternal = borrowToken.balanceOf(
                        address(this)
                    );
                    if (currentCashInternal >= reserveAmount) {
                        borrowToken.safeTransfer(treasury, reserveAmount);
                    }
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
     * @notice Fetch price from Chainlink with staleness & validity checks.
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
        return _getHealthFactorInternal(user) >= 1e18;
    }

    /**
     * @notice Fetch token decimals. Fallback to 18 if call fails.
     */
    function _getTokenDecimals(address token) internal view returns (uint8) {
        // Try calling decimals() — most ERC20 tokens support this
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("decimals()")
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (uint8));
        }
        return 18; // Safe default
    }

    // ──────────────────── Owner Functions ────────────────────
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert OwnableInvalidOwner(address(0));
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
