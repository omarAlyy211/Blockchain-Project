// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract YieldFarm {
    IERC20 public immutable stakingToken; // sETH
    IERC20 public immutable rewardToken;  // RWD

    uint256 public constant REWARD_DELAY = 40; // seconds

    mapping(address => uint256) public stakedAmount;
    mapping(address => uint256) public lastStakeTime;

    constructor(address _stakingToken, address _rewardToken) {
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    function stake(uint256 amount) external {
        require(amount > 0, "Amount must be > 0");

        stakingToken.transferFrom(msg.sender, address(this), amount);

        stakedAmount[msg.sender] += amount;
        lastStakeTime[msg.sender] = block.timestamp;
    }

    function claimRewards() external {
        uint256 staked = stakedAmount[msg.sender];
        require(staked > 0, "Nothing staked");

        require(
            block.timestamp >= lastStakeTime[msg.sender] + REWARD_DELAY,
            "Reward not ready yet"
        );

        // FIXED REWARD LOGIC
        // reward = staked + (staked *0.5)
        uint256 reward = staked + (staked * 50) / 100;

        lastStakeTime[msg.sender] = block.timestamp;

        rewardToken.transfer(msg.sender, reward);
    }
}