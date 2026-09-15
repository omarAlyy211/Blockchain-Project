const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Yield Farm", function () {
  let sETH;
  let rewardToken;
  let farm;
  let OmarOwner, Ahmed;

  beforeEach(async function () {
    [OmarOwner, Ahmed] = await ethers.getSigners();

    // Deploy sETH
    const SETH = await ethers.getContractFactory("sETH", OmarOwner);
    sETH = await SETH.deploy();
    await sETH.waitForDeployment();

    // Deploy Reward Token
    const Reward = await ethers.getContractFactory("RewardToken", OmarOwner);
    rewardToken = await Reward.deploy();
    await rewardToken.waitForDeployment();

    // Deploy Yield Farm
    const Farm = await ethers.getContractFactory("YieldFarm", OmarOwner);
    farm = await Farm.deploy(
      await sETH.getAddress(),
      await rewardToken.getAddress(),
      ethers.parseEther("1")
    );
    await farm.waitForDeployment();

    // Give farm permission to mint rewards
    await rewardToken.transferOwnership(await farm.getAddress());
  });

  it("Contracts are deployed and linked correctly", async function () {
    expect(await farm.stakingToken()).to.equal(await sETH.getAddress());
    expect(await farm.rewardToken()).to.equal(await rewardToken.getAddress());
  });

  it("Ahmed stakes sETH and earns reward tokens", async function () {
    // ONLY OWNER can mint sETH
    await sETH.connect(OmarOwner).mint(
      Ahmed.address,
      ethers.parseEther("10")
    );

    // Ahmed approves farm
    await sETH.connect(Ahmed).approve(
      await farm.getAddress(),
      ethers.parseEther("10")
    );

    // Ahmed stakes
    await farm.connect(Ahmed).stake(ethers.parseEther("10"));

    // Simulate time passing
    await ethers.provider.send("evm_increaseTime", [10]);
    await ethers.provider.send("evm_mine");

    // Claim rewards
    await farm.connect(Ahmed).claimReward();

    const rewardBalance = await rewardToken.balanceOf(Ahmed.address);
    expect(rewardBalance).to.be.gt(0);
  });
});
