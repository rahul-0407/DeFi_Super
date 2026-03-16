// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title DeFiToken
 * @notice The native governance and reward token for the DeFi Super App.
 */
contract DeFiToken is ERC20, Ownable {
    constructor() ERC20("DeFi Super Token", "DEFI") Ownable(msg.sender) {
        // Mint initial supply to owner for seeding pools and rewards
        _mint(msg.sender, 1_000_000 * 10 ** 18);
    }

    /**
     * @notice Allow owner (e.g., Staking contract) to mint rewards.
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
