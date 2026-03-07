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
 * @title DeFiStaking
 * @author DeFi Super
 * @notice Staking contract with reward-per-token distribution model.
 * @dev Efficiently distributes rewards proportionally to stakers using cumulative reward-per-token.
 *
 * Security: ReentrancyGuard, Ownable, Pausable, SafeERC20
 * Gas: Custom errors, unchecked arithmetic, storage caching, immutable vars
 */
contract DeFiStaking is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    // ──────────────────── Custom Errors ────────────────────
    error ZeroAmount();

    // ──────────────────── Constants & Immutables ────────────────────
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    // ──────────────────── State Variables ────────────────────
    uint256 public rewardRate = 1e18; // 1 reward token per second
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    // ──────────────────── Events ────────────────────
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    // ──────────────────── Constructor ────────────────────
    constructor(
        address _stakingToken,
        address _rewardToken
    ) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    // ──────────────────── View Functions ────────────────────

    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }

    function rewardPerToken() public view returns (uint256) {
        uint256 supply = _totalSupply; // Cache
        if (supply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((block.timestamp - lastUpdateTime) * rewardRate * 1e18) / supply);
    }

    function earned(address account) public view returns (uint256) {
        return
            ((_balances[account] *
                (rewardPerToken() - userRewardPerTokenPaid[account])) / 1e18) +
            rewards[account];
    }

    // ──────────────────── Modifiers ────────────────────

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = block.timestamp;
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    // ──────────────────── Core Functions ────────────────────

    /**
     * @notice Stake tokens to earn rewards.
     * @param amount Amount of staking tokens to stake
     */
    function stake(
        uint256 amount
    ) external nonReentrant whenNotPaused updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /**
     * @notice Withdraw staked tokens.
     * @param amount Amount of staking tokens to withdraw
     */
    function withdraw(
        uint256 amount
    ) external nonReentrant whenNotPaused updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Claim accumulated rewards.
     */
    function getReward()
        external
        nonReentrant
        whenNotPaused
        updateReward(msg.sender)
    {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            rewardToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    // ──────────────────── Owner Functions ────────────────────

    /**
     * @notice Update reward rate. Only callable by owner.
     * @param newRate New reward tokens per second
     */
    function setRewardRate(
        uint256 newRate
    ) external onlyOwner updateReward(address(0)) {
        rewardRate = newRate;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
