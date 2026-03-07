// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAggregatorV3
 * @notice Minimal Chainlink AggregatorV3Interface for oracle price feeds.
 * @dev Only includes `latestRoundData()` and `decimals()` — the two functions needed
 *      for on-chain price lookups. This avoids an external Chainlink dependency.
 */
interface IAggregatorV3 {
    function decimals() external view returns (uint8);

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}
