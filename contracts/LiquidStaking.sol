// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./sETH.sol";

contract LiquidStaking {
    sETH public sToken;

    constructor(address _sToken) {
        sToken = sETH(_sToken);
    }

    function stake() external payable {
        require(msg.value > 0, "No ETH sent");
        sToken.mint(msg.sender, msg.value);
    }

    function unstake(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        sToken.burn(msg.sender, amount);
        payable(msg.sender).transfer(amount);
    }
}