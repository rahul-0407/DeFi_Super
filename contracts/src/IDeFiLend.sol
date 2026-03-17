// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IDeFiLend {
    function collateralToken() external view returns (IERC20);
    function borrowToken() external view returns (IERC20);

    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;

    function supplyBorrowToken(uint256 amount) external;
    function withdrawLiquidity(uint256 amount) external;

    function receiptToken() external view returns (address);
    function suppliedLiquidity(address account) external view returns (uint256);
}
