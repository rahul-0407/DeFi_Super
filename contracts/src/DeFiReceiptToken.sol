// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DeFiReceiptToken
 * @author DeFi Super
 * @notice Receipt token (like aUSDC or cUSDC) representing a share in the lending pool.
 * @dev Only the DeFiLend contract can mint or burn these tokens.
 */
contract DeFiReceiptToken is ERC20, Ownable {
    uint8 private immutable _decimals;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals_,
        address initialOwner
    ) ERC20(name, symbol) Ownable(initialOwner) {
        _decimals = decimals_;
    }

    /**
     * @notice Mint receipt tokens to a user.
     * @dev Only owner (DeFiLend contract) can call this.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Burn receipt tokens from a user.
     * @dev Only owner (DeFiLend contract) can call this.
     */
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }

    /**
     * @notice Override decimals to match the underlying asset (e.g., 6 for USDC).
     */
    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
