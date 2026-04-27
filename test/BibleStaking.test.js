import { expect } from "chai";
import hre from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Contrato BibleStaking", function () {
  async function deployStakingFixture() {
    const [owner, staker1, staker2] = await hre.ethers.getSigners();

    const GraceToken = await hre.ethers.getContractFactory("GraceToken");
    const token = await GraceToken.deploy(owner.address);

    const BibleStaking = await hre.ethers.getContractFactory("BibleStaking");
    const staking = await BibleStaking.deploy(await token.getAddress());

    const initialStakerBalance = hre.ethers.parseUnits("1000", 18);
    await token.mint(staker1.address, initialStakerBalance);
    await token.mint(staker2.address, initialStakerBalance);

    const rewardPool = hre.ethers.parseUnits("100000", 18);
    await token.transfer(await staking.getAddress(), rewardPool);

    return { token, staking, owner, staker1, staker2 };
  }

  describe("Deploy Inicial", function () {
    it("Deve configurar o token de staking corretamente", async function () {
      const { token, staking } = await deployStakingFixture();
      expect(await staking.stakingToken()).to.equal(await token.getAddress());
    });

    it("Deve iniciar com a taxa de recompensa correta", async function () {
      const { staking } = await deployStakingFixture();
      expect(await staking.rewardRate()).to.equal(100);
    });
  });

  describe("Stake (Apostar tokens)", function () {
    it("Deve reverter se o valor for zero", async function () {
      const { staking, staker1 } = await deployStakingFixture();
      await expect(
        staking.connect(staker1).stake(0)
      ).to.be.revertedWith("Quantidade deve ser maior que zero");
    });

    it("Deve permitir que o usuario faca stake e atualize o saldo", async function () {
      const { token, staking, staker1 } = await deployStakingFixture();
      const amount = hre.ethers.parseUnits("100", 18);

      await token.connect(staker1).approve(await staking.getAddress(), amount);

      await expect(staking.connect(staker1).stake(amount))
        .to.emit(token, "Transfer")
        .withArgs(staker1.address, await staking.getAddress(), amount);

      expect(await staking.stakedBalance(staker1.address)).to.equal(amount);
    });
  });

  describe("Withdraw (Retirar tokens apostados)", function () {
    it("Deve reverter se tentar retirar 0 ou mais do que possui", async function () {
      const { staking, staker1 } = await deployStakingFixture();
      await expect(staking.connect(staker1).withdraw(0))
        .to.be.revertedWith("Quantidade deve ser maior que zero");

      const amount = hre.ethers.parseUnits("100", 18);
      await expect(staking.connect(staker1).withdraw(amount))
        .to.be.revertedWith("Saldo insuficiente");
    });

    it("Deve permitir retirar tokens apostados", async function () {
      const { token, staking, staker1 } = await deployStakingFixture();
      const amount = hre.ethers.parseUnits("100", 18);

      await token.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      const withdrawAmount = hre.ethers.parseUnits("50", 18);
      await expect(staking.connect(staker1).withdraw(withdrawAmount))
        .to.emit(token, "Transfer")
        .withArgs(await staking.getAddress(), staker1.address, withdrawAmount);

      expect(await staking.stakedBalance(staker1.address)).to.equal(hre.ethers.parseUnits("50", 18));
    });
  });

  describe("Recompensas", function () {
    it("Deve acumular recompensas com o passar do tempo", async function () {
      const { token, staking, staker1 } = await deployStakingFixture();
      const amount = hre.ethers.parseUnits("100", 18);

      await token.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      await time.increase(10);

      const reward = await staking.calculateReward(staker1.address);
      expect(reward).to.be.greaterThan(0);
      expect(reward).to.be.closeTo(1000n, 100n); 
    });

    it("Deve permitir ao usuario sacar suas recompensas", async function () {
      const { token, staking, staker1 } = await deployStakingFixture();
      const amount = hre.ethers.parseUnits("100", 18);

      await token.connect(staker1).approve(await staking.getAddress(), amount);
      await staking.connect(staker1).stake(amount);

      await time.increase(10);

      const balanceBefore = await token.balanceOf(staker1.address);

      await staking.connect(staker1).claimReward();

      const balanceAfter = await token.balanceOf(staker1.address);
      expect(balanceAfter).to.be.greaterThan(balanceBefore);

      expect(await staking.rewards(staker1.address)).to.equal(0);
    });

    it("Deve reverter se nao houver recompensas", async function () {
      const { staking, staker2 } = await deployStakingFixture();
      
      await expect(staking.connect(staker2).claimReward())
        .to.be.revertedWith("Nenhuma recompensa disponivel");
    });
  });
});
