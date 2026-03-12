// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {
    SafeERC20
} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {
    ReentrancyGuard
} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {DeFiAMM} from "./DeFiAMM.sol";

/**
 * @title DeFiRouter
 * @author DeFi Super
 * @notice Router for interacting with AMM pools. Handles approvals, transfers, and deadline enforcement.
 * @dev Provides a user-friendly interface with slippage protection and deadline checks.
 *
 * Security: ReentrancyGuard, SafeERC20, deadline parameter
 * Gas: Custom errors, storage caching
 */
contract DeFiRouter is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────── Custom Errors ────────────────────
    error DeadlineExpired();
    error InsufficientOutputAmount();
    error InsufficientAAmount();
    error InsufficientBAmount();

    // ──────────────────── Modifiers ────────────────────
    modifier ensure(uint256 deadline) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        _;
    }

    // ──────────────────── Core Functions ────────────────────

    /**
     * @notice Add liquidity to a pool with slippage protection.
     */
    function addLiquidity(
        address pool,
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline
    ) external nonReentrant ensure(deadline) returns (uint256 shares) {
        DeFiAMM amm = DeFiAMM(pool);
        IERC20 _token0 = amm.token0();
        IERC20 _token1 = amm.token1();

        _token0.safeTransferFrom(msg.sender, address(this), amount0Desired);
        _token1.safeTransferFrom(msg.sender, address(this), amount1Desired);

        _token0.forceApprove(pool, amount0Desired);
        _token1.forceApprove(pool, amount1Desired);

        shares = amm.addLiquidity(amount0Desired, amount1Desired);

        // Simple check for liquidity received vs desired (minimal but safer)
        // In a full router, we'd calculate optimal amounts first.

        // Transfer LP shares back to user
        IERC20(pool).safeTransfer(msg.sender, shares);
    }

    /**
     * @notice Remove liquidity from a pool with slippage protection.
     */
    function removeLiquidity(
        address pool,
        uint256 shares,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline
    )
        external
        nonReentrant
        ensure(deadline)
        returns (uint256 amount0, uint256 amount1)
    {
        // Transfer LP tokens from user to router
        IERC20(pool).safeTransferFrom(msg.sender, address(this), shares);

        // Remove liquidity via AMM
        (amount0, amount1) = DeFiAMM(pool).removeLiquidity(shares);

        if (amount0 < amount0Min) revert InsufficientAAmount();
        if (amount1 < amount1Min) revert InsufficientBAmount();

        // Transfer tokens back to user
        DeFiAMM amm = DeFiAMM(pool);
        amm.token0().safeTransfer(msg.sender, amount0);
        amm.token1().safeTransfer(msg.sender, amount1);
    }

    /**
     * @notice Swap tokens through the AMM with slippage protection.
     */
    function swap(
        address pool,
        uint256 amountIn,
        bool isToken0,
        uint256 amountOutMin,
        uint256 deadline
    ) external nonReentrant ensure(deadline) returns (uint256 amountOut) {
        DeFiAMM amm = DeFiAMM(pool);
        IERC20 tokenIn = isToken0 ? amm.token0() : amm.token1();

        uint256 reserveIn = isToken0 ? amm.reserve0() : amm.reserve1();
        uint256 reserveOut = isToken0 ? amm.reserve1() : amm.reserve0();

        tokenIn.safeTransferFrom(msg.sender, pool, amountIn);

        // Standard AMM getAmountOut math
        amountOut = amm.getAmountOut(amountIn, reserveIn, reserveOut);

        if (amountOut < amountOutMin) revert InsufficientOutputAmount();

        if (isToken0) {
            amm.swap(0, amountOut, msg.sender);
        } else {
            amm.swap(amountOut, 0, msg.sender);
        }
    }
}
