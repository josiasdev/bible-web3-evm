// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BibleStaking is ReentrancyGuard {
    IERC20 public stakingToken;

    uint256 public rewardRate = 100;

    mapping(address => uint256) public stakedBalance;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public lastUpdateTime;

    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    modifier updateReward(address account) {
        if (account != address(0)) {
            rewards[account] += calculateReward(account);
            lastUpdateTime[account] = block.timestamp;
        }
        _;
    }

    
    function calculateReward(address account) public view returns (uint256) {
        if (stakedBalance[account] == 0) {
            return 0;
        }
        uint256 timeStaked = block.timestamp - lastUpdateTime[account];
        return timeStaked * rewardRate; 
    }

    function stake(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Quantidade deve ser maior que zero");
        
        stakedBalance[msg.sender] += amount;
        
        require(stakingToken.transferFrom(msg.sender, address(this), amount), "Falha na transferencia");
    }

    function withdraw(uint256 amount) external nonReentrant updateReward(msg.sender) {
        require(amount > 0, "Quantidade deve ser maior que zero");
        require(stakedBalance[msg.sender] >= amount, "Saldo insuficiente");

        stakedBalance[msg.sender] -= amount;
        
        require(stakingToken.transfer(msg.sender, amount), "Falha na transferencia");
    }

    
    function claimReward() external nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        require(reward > 0, "Nenhuma recompensa disponivel");

        rewards[msg.sender] = 0;
        
        require(stakingToken.transfer(msg.sender, reward), "Falha ao pagar recompensa");
    }
}