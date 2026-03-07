// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IFlashBorrower
 * @author DeFi Super
 * @notice Interface for flash loan receiver contracts.
 * @dev Implement this interface to receive flash loans from DeFiFlashLoan.
 */
interface IFlashBorrower {
    /**
     * @notice Called by flash loan provider after funds have been sent.
     * @dev The borrower must approve amount + fee to the flash loan contract before returning.
     * @param initiator The address that initiated the flash loan
     * @param token The token borrowed
     * @param amount The amount borrowed
     * @param fee The fee to pay on top of the amount
     * @param data Arbitrary data passed from the initiator
     * @return Must return keccak256("IFlashBorrower.onFlashLoan") to confirm receipt
     */
    function onFlashLoan(
        address initiator,
        address token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external returns (bytes32);
}
