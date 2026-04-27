import { expect } from "chai";
import hre from "hardhat";

describe("Contrato GraceToken", function () {
  async function deployTokenFixture() {
    const [owner, leitor1, leitor2] = await hre.ethers.getSigners();

    const GraceToken = await hre.ethers.getContractFactory("GraceToken");
    const graceToken = await GraceToken.deploy(owner.address);

    return { graceToken, owner, leitor1, leitor2 };
  }

  describe("Deploy Inicial", function () {
    it("Deve ter o nome e símbolo corretos", async function () {
      const { graceToken } = await deployTokenFixture();
      expect(await graceToken.name()).to.equal("GraceToken");
      expect(await graceToken.symbol()).to.equal("GRC");
    });

    it("Deve atribuir todo o supply inicial ao dono", async function () {
      const { graceToken, owner } = await deployTokenFixture();
      const ownerBalance = await graceToken.balanceOf(owner.address);
      expect(await graceToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Mintagem (Emissão de novas moedas)", function () {
    it("Deve permitir que o dono minte tokens para um leitor", async function () {
      const { graceToken, leitor1 } = await deployTokenFixture();

      const amount = hre.ethers.parseUnits("100", 18);

      await graceToken.mint(leitor1.address, amount);
      expect(await graceToken.balanceOf(leitor1.address)).to.equal(amount);
    });

    it("Deve falhar se um usuário comum tentar mintar tokens", async function () {
      const { graceToken, leitor1, leitor2 } = await deployTokenFixture();
      const amount = hre.ethers.parseUnits("50", 18);

      await expect(
        graceToken.connect(leitor1).mint(leitor2.address, amount)
      ).to.be.revertedWithCustomError(graceToken, "OwnableUnauthorizedAccount");
    });
  });
});
