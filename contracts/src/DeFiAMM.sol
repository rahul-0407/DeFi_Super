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
 * @title DeFiAMM
 * @author DeFi Super
 * @notice Constant Product AMM (x * y = k) with ERC20 LP tokens, fee accrual, and production-grade security.
 * @dev LP tokens represent proportional pool ownership. 0.3% swap fee accrues to LP holders via k-value growth.
 *
 * Security: ReentrancyGuard, Ownable, Pausable, SafeERC20
 * Gas: Custom errors, unchecked math, storage caching, immutable vars
 */
contract DeFiAMM is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ──────────────────── Custom Errors ────────────────────
    error InsufficientLiquidityMinted();
    error InsufficientLiquidityBurned();
    error InsufficientOutputAmount();
    error InsufficientLiquidity();
    error InsufficientInputAmount();
    error KInvariantFailed();
    error InvalidRecipient();

    // ──────────────────── Constants & Immutables ────────────────────
    uint256 public constant MINIMUM_LIQUIDITY = 1000;
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    // ──────────────────── State Variables ────────────────────
    uint256 public reserve0;
    uint256 public reserve1;

    // LP Token (inline ERC20)
    string public constant name = "DeFi LP Token";
    string public constant symbol = "DLP";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    // ──────────────────── Events ────────────────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
    event Mint(
        address indexed sender,
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    );
    event Burn(
        address indexed sender,
        uint256 amount0,
        uint256 amount1,
        address indexed to
    );
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint256 reserve0, uint256 reserve1);

    // ──────────────────── Constructor ────────────────────
    constructor(address _token0, address _token1) Ownable(msg.sender) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    // ──────────────────── LP Token Functions ────────────────────
    function _mint(address to, uint256 amount) private {
        balanceOf[to] += amount;
        totalSupply += amount;
        emit Transfer(address(0), to, amount);
    }

    function _burn(address from, uint256 amount) private {
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    // ──────────────────── Internal Helpers ────────────────────
    function _update(uint256 _reserve0, uint256 _reserve1) private {
        reserve0 = _reserve0;
        reserve1 = _reserve1;
        emit Sync(_reserve0, _reserve1);
    }

    // ──────────────────── Core AMM Functions ────────────────────

    /**
     * @notice Add liquidity to the pool and receive LP tokens.
     * @dev First deposit locks MINIMUM_LIQUIDITY to address(1) to prevent price manipulation.
     * @param amount0 Amount of token0 to deposit
     * @param amount1 Amount of token1 to deposit
     * @return shares LP tokens minted
     */
    function addLiquidity(
        uint256 amount0,
        uint256 amount1
    ) external nonReentrant whenNotPaused returns (uint256 shares) {
        token0.safeTransferFrom(msg.sender, address(this), amount0);
        token1.safeTransferFrom(msg.sender, address(this), amount1);

        // Cache storage reads
        uint256 _totalSupply = totalSupply;

        if (_totalSupply == 0) {
            shares = _sqrt(amount0 * amount1);
            if (shares <= MINIMUM_LIQUIDITY)
                revert InsufficientLiquidityMinted();
            unchecked {
                shares -= MINIMUM_LIQUIDITY;
            }
            _mint(address(1), MINIMUM_LIQUIDITY); // Permanent lock
        } else {
            // Cache reserves
            uint256 _reserve0 = reserve0;
            uint256 _reserve1 = reserve1;
            shares = _min(
                (amount0 * _totalSupply) / _reserve0,
                (amount1 * _totalSupply) / _reserve1
            );
        }

        if (shares == 0) revert InsufficientLiquidityMinted();
        _mint(msg.sender, shares);
        _update(
            token0.balanceOf(address(this)),
            token1.balanceOf(address(this))
        );
        emit Mint(msg.sender, amount0, amount1, shares);
    }

    /**
     * @notice Burn LP tokens and withdraw proportional liquidity.
     * @param shares Amount of LP tokens to burn
     * @return amount0 Token0 amount returned
     * @return amount1 Token1 amount returned
     */
    function removeLiquidity(
        uint256 shares
    )
        external
        nonReentrant
        whenNotPaused
        returns (uint256 amount0, uint256 amount1)
    {
        uint256 bal0 = token0.balanceOf(address(this));
        uint256 bal1 = token1.balanceOf(address(this));
        uint256 _totalSupply = totalSupply; // Cache

        amount0 = (shares * bal0) / _totalSupply;
        amount1 = (shares * bal1) / _totalSupply;

        if (amount0 == 0 || amount1 == 0) revert InsufficientLiquidityBurned();

        _burn(msg.sender, shares);
        _update(bal0 - amount0, bal1 - amount1);

        token0.safeTransfer(msg.sender, amount0);
        token1.safeTransfer(msg.sender, amount1);

        emit Burn(msg.sender, amount0, amount1, msg.sender);
    }

    /**
     * @notice Swap tokens through the pool.
     * @dev Enforces constant product invariant with 0.3% fee.
     * @param amount0Out Desired output of token0
     * @param amount1Out Desired output of token1
     * @param to Recipient address
     */
    function swap(
        uint256 amount0Out,
        uint256 amount1Out,
        address to
    ) external nonReentrant whenNotPaused {
        if (amount0Out == 0 && amount1Out == 0)
            revert InsufficientOutputAmount();
        if (to == address(0)) revert InvalidRecipient();

        // Cache reserves
        uint256 _reserve0 = reserve0;
        uint256 _reserve1 = reserve1;

        if (amount0Out >= _reserve0 || amount1Out >= _reserve1)
            revert InsufficientLiquidity();

        if (amount0Out > 0) token0.safeTransfer(to, amount0Out);
        if (amount1Out > 0) token1.safeTransfer(to, amount1Out);

        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));

        uint256 amount0In = balance0 > _reserve0 - amount0Out
            ? balance0 - (_reserve0 - amount0Out)
            : 0;
        uint256 amount1In = balance1 > _reserve1 - amount1Out
            ? balance1 - (_reserve1 - amount1Out)
            : 0;

        if (amount0In == 0 && amount1In == 0) revert InsufficientInputAmount();

        // Constant Product with 0.3% fee
        uint256 balance0Adjusted = balance0 * 1000 - amount0In * 3;
        uint256 balance1Adjusted = balance1 * 1000 - amount1In * 3;
        if (
            balance0Adjusted * balance1Adjusted <
            _reserve0 * _reserve1 * (1000 ** 2)
        ) {
            revert KInvariantFailed();
        }

        _update(balance0, balance1);
        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }

    // ──────────────────── Owner Functions ────────────────────
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ──────────────────── Pure Helpers ────────────────────
    function _sqrt(uint256 y) private pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }
}
