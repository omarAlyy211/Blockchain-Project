const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Liquid Staking Protocol", function () {
  let sETH;
  let staking;
  let OmarOwner, Ahmed, Eyad;

  beforeEach(async function () {
    [OmarOwner, Ahmed, Eyad] = await ethers.getSigners();

    const SETH = await ethers.getContractFactory("sETH", OmarOwner);
    sETH = await SETH.deploy();
    await sETH.waitForDeployment();

    const Staking = await ethers.getContractFactory("LiquidStaking", OmarOwner);
    staking = await Staking.deploy(await sETH.getAddress());
    await staking.waitForDeployment();

    await sETH.transferOwnership(await staking.getAddress());
  });

  it("Ahmed stakes ETH and transfers sETH to Eyad", async function () {
    await staking.connect(Ahmed).stake({
      value: ethers.parseEther("1"),
    });

    await sETH.connect(Ahmed).transfer(
      Eyad.address,
      ethers.parseEther("1")
    );

    expect(await sETH.balanceOf(Eyad.address))
      .to.equal(ethers.parseEther("1"));
  });

  it("Eyad can unstake ETH after receiving sETH from Ahmed", async function () {
    await staking.connect(Ahmed).stake({
      value: ethers.parseEther("1"),
    });

    await sETH.connect(Ahmed).transfer(
      Eyad.address,
      ethers.parseEther("1")
    );

    const balanceBefore = await ethers.provider.getBalance(Eyad.address);

    await staking.connect(Eyad).unstake(ethers.parseEther("1"));

    const balanceAfter = await ethers.provider.getBalance(Eyad.address);

    expect(balanceAfter).to.be.gt(balanceBefore);
  });

  it("Rewards increase the value of sETH (exchange rate test)", async function () {
    await staking.connect(Ahmed).stake({
      value: ethers.parseEther("1"),
    });

    const rateBefore = await staking.getExchangeRate();

    await staking.injectRewards({
      value: ethers.parseEther("1"),
    });

    const rateAfter = await staking.getExchangeRate();

    expect(rateAfter).to.be.gt(rateBefore);
  });
});
