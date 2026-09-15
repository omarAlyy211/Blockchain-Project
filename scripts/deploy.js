const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying with:", deployer.address);
  console.log(
    "Balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );

  // sETH
  const SETH = await ethers.getContractFactory("sETH");
  const sETH = await SETH.deploy();
  await sETH.waitForDeployment();
  console.log("sETH deployed to:", sETH.target);

  // Liquid Staking
  const LiquidStaking = await ethers.getContractFactory("LiquidStaking");
  const liquidStaking = await LiquidStaking.deploy(sETH.target);
  await liquidStaking.waitForDeployment();
  console.log("LiquidStaking deployed to:", liquidStaking.target);

  // Transfer ownership so staking can mint/burn
  await sETH.transferOwnership(liquidStaking.target);
  console.log("sETH ownership transferred");

  // Reward Token
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();
  await rewardToken.waitForDeployment();
  console.log("RewardToken deployed to:", rewardToken.target);

  // Yield Farm
  const YieldFarm = await ethers.getContractFactory("YieldFarm");
  const yieldFarm = await YieldFarm.deploy(
    sETH.target,
    rewardToken.target
  );
  await yieldFarm.waitForDeployment();
  console.log("YieldFarm deployed to:", yieldFarm.target);

  // Mint rewards to farm
  await rewardToken.mint(
    yieldFarm.target,
    ethers.parseEther("1000")
  );
  console.log("Funded YieldFarm with rewards");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
