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

    // ──────────────────── Modifiers ────────────────────
    modifier ensure(uint256 deadline) {
        if (block.timestamp > deadline) revert DeadlineExpired();
        _;
    }

    // ──────────────────── Core Functions ────────────────────

    /**
     * @notice Add liquidity to a pool, handling token transfers and approvals.
     * @param pool Address of the AMM pool
     * @param amount0Desired Amount of token0 to add
     * @param amount1Desired Amount of token1 to add
     * @param deadline Transaction deadline timestamp
     * @return shares LP tokens received
     */
    function addLiquidity(
        address pool,
        uint256 amount0Desired,
        uint256 amount1Desired,
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

        // Transfer LP shares back to user
        IERC20(pool).safeTransfer(msg.sender, shares);
    }

    /**
     * @notice Swap tokens through the AMM with slippage protection.
     * @param pool Address of the AMM pool
     * @param amountIn Amount of input tokens
     * @param isToken0 True if swapping token0 → token1
     * @param amountOutMin Minimum acceptable output (slippage protection)
     * @param deadline Transaction deadline timestamp
     * @return amountOut Actual output amount
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

        // dy = (y * dx * 997) / (x * 1000 + dx * 997)
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;

        if (amountOut < amountOutMin) revert InsufficientOutputAmount();

        if (isToken0) {
            amm.swap(0, amountOut, msg.sender);
        } else {
            amm.swap(amountOut, 0, msg.sender);
        }
    }
}
