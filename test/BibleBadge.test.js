import { expect } from "chai";
import hre from "hardhat";

describe("Contrato BibleBadge", function () {
  async function deployBadgeFixture() {
    const [owner, aluno1, aluno2] = await hre.ethers.getSigners();

    const BibleBadge = await hre.ethers.getContractFactory("BibleBadge");
    const badge = await BibleBadge.deploy(owner.address);

    return { badge, owner, aluno1, aluno2 };
  }

  describe("Deploy Inicial", function () {
    it("Deve ter o nome e simbolo corretos", async function () {
      const { badge } = await deployBadgeFixture();
      expect(await badge.name()).to.equal("BibleBadge");
      expect(await badge.symbol()).to.equal("BBDG");
    });

    it("Deve atribuir o dono correto", async function () {
      const { badge, owner } = await deployBadgeFixture();
      expect(await badge.owner()).to.equal(owner.address);
    });
  });

  describe("Mintagem de Certificados", function () {
    it("Deve permitir que o dono minte um certificado para um aluno", async function () {
      const { badge, aluno1 } = await deployBadgeFixture();
      const tokenUri = "ipfs://QmExampleHash/certificado.json";

      // O dono minta o NFT para o aluno1
      await expect(badge.mintCertificate(aluno1.address, tokenUri))
        .to.emit(badge, "Transfer")
        .withArgs(hre.ethers.ZeroAddress, aluno1.address, 0);

      // Checa o balance do aluno e dono do token
      expect(await badge.balanceOf(aluno1.address)).to.equal(1);
      expect(await badge.ownerOf(0)).to.equal(aluno1.address);
      
      // Checa o URI que foi salvo (metadados do NFT)
      expect(await badge.tokenURI(0)).to.equal(tokenUri);
    });

    it("Deve incrementar o ID do token a cada mintagem", async function () {
      const { badge, aluno1, aluno2 } = await deployBadgeFixture();
      
      await badge.mintCertificate(aluno1.address, "uri1");
      await badge.mintCertificate(aluno2.address, "uri2");

      expect(await badge.ownerOf(0)).to.equal(aluno1.address);
      expect(await badge.ownerOf(1)).to.equal(aluno2.address);
    });

    it("Deve falhar se um usuario comum tentar mintar", async function () {
      const { badge, aluno1, aluno2 } = await deployBadgeFixture();
      const tokenUri = "ipfs://hacker-uri";

      // aluno1 tenta mintar para aluno2
      await expect(
        badge.connect(aluno1).mintCertificate(aluno2.address, tokenUri)
      ).to.be.revertedWithCustomError(badge, "OwnableUnauthorizedAccount");
    });
  });
});
