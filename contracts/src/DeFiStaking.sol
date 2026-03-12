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
    error InsufficientRewardBalance();

    // ──────────────────── Constants & Immutables ────────────────────
    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardToken;

    // ──────────────────── State Variables ────────────────────
    uint256 public rewardRate;
    uint256 public periodFinish;
    uint256 public rewardDuration = 7 days;
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
    event RewardAdded(uint256 reward);
    event RewardDurationUpdated(uint256 newDuration);

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

    function lastTimeRewardApplicable() public view returns (uint256) {
        return block.timestamp < periodFinish ? block.timestamp : periodFinish;
    }

    function rewardPerToken() public view returns (uint256) {
        uint256 supply = _totalSupply;
        if (supply == 0) {
            return rewardPerTokenStored;
        }
        return
            rewardPerTokenStored +
            (((lastTimeRewardApplicable() - lastUpdateTime) *
                rewardRate *
                1e18) / supply);
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
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    // ──────────────────── Core Functions ────────────────────

    function stake(
        uint256 amount
    ) external nonReentrant whenNotPaused updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    function withdraw(
        uint256 amount
    ) external nonReentrant whenNotPaused updateReward(msg.sender) {
        if (amount == 0) revert ZeroAmount();
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

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
     * @notice Fund the contract with rewards and update distribution parameters.
     */
    function notifyRewardAmount(
        uint256 reward
    ) external onlyOwner updateReward(address(0)) {
        if (block.timestamp >= periodFinish) {
            rewardRate = reward / rewardDuration;
        } else {
            uint256 remaining = periodFinish - block.timestamp;
            uint256 leftover = remaining * rewardRate;
            rewardRate = (reward + leftover) / rewardDuration;
        }

        // Ensure the contract has enough balance to pay out
        uint256 balance = rewardToken.balanceOf(address(this));
        if (rewardRate > balance / rewardDuration)
            revert InsufficientRewardBalance();

        lastUpdateTime = block.timestamp;
        periodFinish = block.timestamp + rewardDuration;
        emit RewardAdded(reward);
    }

    function setRewardDuration(uint256 _rewardDuration) external onlyOwner {
        if (block.timestamp < periodFinish)
            revert("Reward period still active");
        rewardDuration = _rewardDuration;
        emit RewardDurationUpdated(_rewardDuration);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
