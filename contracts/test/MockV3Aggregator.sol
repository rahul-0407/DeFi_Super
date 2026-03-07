// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IAggregatorV3} from "../src/IAggregatorV3.sol";

/**
 * @title MockV3Aggregator
 * @notice Mock Chainlink price feed for testing oracle-dependent contracts.
 * @dev Supports updateAnswer() to simulate price changes and setUpdatedAt() for staleness tests.
 */
contract MockV3Aggregator is IAggregatorV3 {
    uint8 private _decimals;
    int256 private _answer;
    uint256 private _updatedAt;
    uint80 private _roundId;

    constructor(uint8 decimals_, int256 initialAnswer) {
        _decimals = decimals_;
        _answer = initialAnswer;
        _updatedAt = block.timestamp;
        _roundId = 1;
    }

    function decimals() external view override returns (uint8) {
        return _decimals;
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        return (_roundId, _answer, _updatedAt, _updatedAt, _roundId);
    }

    /// @notice Update the price answer (simulates a new oracle round)
    function updateAnswer(int256 newAnswer) external {
        _answer = newAnswer;
        _updatedAt = block.timestamp;
        _roundId++;
    }

    /// @notice Set updatedAt directly (for staleness testing)
    function setUpdatedAt(uint256 timestamp) external {
        _updatedAt = timestamp;
    }
}
