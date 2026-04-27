import hre from "hardhat";
import "@nomicfoundation/hardhat-ethers";

async function main() {
  console.log("=================================================");
  console.log("   INICIANDO SIMULAÇÃO DO FRONTEND (ETHERS.JS)   ");
  console.log("=================================================\n");

  const [admin, leitor] = await hre.ethers.getSigners();
  console.log(`Admin conectado: ${admin.address}`);
  console.log(`Leitor conectado: ${leitor.address}\n`);

  // ==========================================
  // DEPLOY LOCAL (Para o script funcionar de forma autônoma)
  // ==========================================
  console.log("Fazendo deploy dos contratos no ambiente local...");
  const GraceToken = await hre.ethers.getContractFactory("GraceToken");
  const token: any = await GraceToken.deploy(admin.address);
  const tokenAddress = await token.getAddress();

  const BibleStaking = await hre.ethers.getContractFactory("BibleStaking");
  const staking: any = await BibleStaking.deploy(tokenAddress);
  const stakingAddress = await staking.getAddress();

  const BibleDAO = await hre.ethers.getContractFactory("BibleDAO");
  const dao: any = await BibleDAO.deploy(stakingAddress);
  const daoAddress = await dao.getAddress();

  console.log("Deploy concluído!\n");

  // ==========================================
  // SIMULAÇÃO 1: STAKE DE TOKENS
  // ==========================================
  console.log("--- 1. INICIANDO STAKE ---");
  
  // O admin envia 100 moedas para o leitor testar o sistema
  const stakeAmount = hre.ethers.parseUnits("100", 18);
  await token.mint(leitor.address, stakeAmount);
  console.log(`Admin enviou 100 GRC para o Leitor.`);

  // O Leitor assina a permissão (Approve) no frontend
  console.log("Leitor assinando a transação de APPROVE no MetaMask...");
  await token.connect(leitor).approve(stakingAddress, stakeAmount);

  // O Leitor faz o Stake
  console.log("Leitor assinando a transação de STAKE...");
  await staking.connect(leitor).stake(stakeAmount);
  
  const saldoStaking = await staking.stakedBalance(leitor.address);
  console.log(`SUCESSO! Saldo travado no Staking: ${hre.ethers.formatUnits(saldoStaking, 18)} GRC\n`);

  // ==========================================
  // SIMULAÇÃO 2: VOTAÇÃO NA DAO
  // ==========================================
  console.log("--- 2. INICIANDO GOVERNANÇA (DAO) ---");

  // Leitor cria uma proposta
  console.log("Leitor criando uma nova proposta na DAO...");
  await dao.connect(leitor).createProposal("Doar 500 GRC para o Asilo São Vicente", 60);

  // Leitor vota na proposta (ID 1)
  console.log("Leitor assinando a transação de VOTO na Proposta #1...");
  await dao.connect(leitor).vote(1);

  const proposta = await dao.proposals(1);
  console.log(`SUCESSO! Proposta recebeu peso de voto igual a: ${hre.ethers.formatUnits(proposta.voteCount, 18)} (Baseado no Stake do eleitor)\n`);

  // ==========================================
  // SIMULAÇÃO 3: MINT DE NFT COM ORÁCULO
  // ==========================================
  console.log("--- 3. MINT DO CERTIFICADO NFT (BibleBadge) ---");
  console.log("Para chamar a função payable com Ethers.js, o Frontend envia ETH no objeto 'value':");
  
  console.log(`
  // Código real que estaria no Frontend:
  const tx = await bibleBadge.connect(leitor).mintCertificate("ipfs://link-metadados", {
      value: ethers.parseEther("0.0006") // Equivalente a $2 USD
  });
  await tx.wait();
  console.log("NFT Mintado com sucesso!");
  `);

  console.log("=================================================");
  console.log("SIMULAÇÃO FINALIZADA COM SUCESSO!");
  console.log("=================================================");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});