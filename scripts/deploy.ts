import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Iniciando deploy com a conta:", deployer.address);

  // 1. Deploy GraceToken (ERC-20)
  const GraceToken = await ethers.getContractFactory("GraceToken");
  const token = await GraceToken.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ GraceToken implantado em:", tokenAddress);

  // 2. Deploy BibleBadge (NFT + Oráculo)
  // Endereço do Price Feed ETH/USD na Sepolia
  const SEPOLIA_ORACLE = "0x694AA1769357215DE4FAC081bf1f309aDC325306";
  const BibleBadge = await ethers.getContractFactory("BibleBadge");
  const badge = await BibleBadge.deploy(deployer.address, SEPOLIA_ORACLE);
  await badge.waitForDeployment();
  const badgeAddress = await badge.getAddress();
  console.log("✅ BibleBadge implantado em:", badgeAddress);

  // 3. Deploy BibleStaking
  const BibleStaking = await ethers.getContractFactory("BibleStaking");
  const staking = await BibleStaking.deploy(tokenAddress);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();
  console.log("✅ BibleStaking implantado em:", stakingAddress);

  // 4. Deploy BibleDAO
  const BibleDAO = await ethers.getContractFactory("BibleDAO");
  const dao = await BibleDAO.deploy(stakingAddress);
  await dao.waitForDeployment();
  const daoAddress = await dao.getAddress();
  console.log("✅ BibleDAO implantado em:", daoAddress);

  console.log("\n--- RESUMO PARA O RELATÓRIO ---");
  console.log(`Token: ${tokenAddress}`);
  console.log(`NFT: ${badgeAddress}`);
  console.log(`Staking: ${stakingAddress}`);
  console.log(`DAO: ${daoAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});