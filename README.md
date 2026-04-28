# Bible Web3 EVM

Bem-vindo ao repositório do **Bible Web3 EVM**, um ecossistema completo de contratos inteligentes (Smart Contracts) para a rede Ethereum (EVM). Este projeto inclui a criação de um token nativo, um sistema de recompensas (staking), governança descentralizada (DAO) e certificados em formato de NFT.

O projeto foi construído utilizando **Solidity**, framework **Hardhat**, e integrações modernas como **OpenZeppelin** e Oráculos da **Chainlink**.

---

## Arquitetura dos Contratos

O ecossistema é composto por quatro pilares principais, que interagem entre si:

### 1. `GraceToken.sol` (Token ERC20)
O token utilitário nativo do ecossistema, com o símbolo **GRC**.
- Possui um suprimento inicial (mint) para o criador do contrato.
- Apenas o proprietário (Owner) tem permissão de cunhar (mintar) novas moedas e injetar no mercado.

### 2. `BibleStaking.sol` (Sistema de Recompensas)
Permite que os usuários depositem seus `GraceToken` em "Stake" para gerar rendimento passivo.
- Funciona como uma poupança descentralizada.
- A taxa de recompensa atual é fixa, recompensando a lealdade dos usuários que mantêm seus tokens bloqueados.
- Contém proteções contra ataques de reentrada (`ReentrancyGuard`).

### 3. `BibleDAO.sol` (Governança e Votações)
O centro de decisões comunitárias do projeto. Em vez de usar saldo líquido na carteira, o poder de voto de um membro da DAO é baseado no saldo de tokens que ele possui depositado no **BibleStaking**.
- Membros podem criar **Propostas** com durações definidas.
- Membros podem **Votar** a favor usando seu peso em Staking.
- Uma vez encerrado o período de votação, a proposta pode ser executada.

### 4. `BibleBadge.sol` (Certificados NFT ERC721)
Um sistema de emblemas/certificados que não podem ser alterados ou falsificados.
- Utiliza a extensão `ERC721URIStorage` para armazenar metadados detalhados via IPFS.
- O ato de mintar um certificado possui um custo fixo equivalente a **US$ 2,00** em ETH.
- Utiliza os **Oráculos da Chainlink** (`AggregatorV3Interface`) para converter e cobrar a taxa em tempo real na cotação correta do Dólar para Ethereum.

---

## Como Instalar e Rodar o Projeto

Este projeto requer o [Node.js](https://nodejs.org/) instalado em sua máquina.

### 1. Clonando e Instalando Dependências
Abra seu terminal e rode:
```bash
git clone git@github.com:josiasdev/bible-web3-evm.git
cd bible-web3-evm
npm install
```

### 2. Compilando os Contratos
Para compilar todos os arquivos `.sol` usando o compilador Solidity:
```bash
npx hardhat compile
```

### 3. Executando a Bateria de Testes
Toda a lógica foi rigorosamente testada (Chai/Mocha) em uma rede simulada. Para rodar todos os testes do projeto:
```bash
npx hardhat test
```
*Se você deseja rodar testes específicos, basta apontar para o arquivo:*
```bash
npx hardhat test test/BibleBadge.test.js
```

---

## Como fazer Deploy (Lançamento) na Rede

As implantações (deploys) dos contratos são feitas através de um script automatizado.

1. Crie um arquivo `.env` na raiz do projeto com suas variáveis:
```env
SEPOLIA_RPC_URL="SUA_URL_DO_ALCHEMY_OU_INFURA"
SEPOLIA_PRIVATE_KEY="SUA_CHAVE_PRIVADA_DA_CARTEIRA"
```

2. Execute o script de deploy apontando para a rede desejada (Exemplo: Sepolia):
```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

---

## Frontend (DApp)

O projeto conta também com uma interface de usuário simplificada em HTML, CSS e JavaScript (Ethers.js v6) puro, localizada em `frontend/index.html`. 

Esta interface descentralizada (DApp) permite aos usuários finais interagir com os contratos inteligentes diretamente do navegador:
- **Conectar Carteira:** Integração direta com a extensão MetaMask.
- **Staking:** Interface para depositar `GraceToken` no sistema de recompensas.
- **Governança:** Formulário para participação ativa na DAO através de votação nas propostas.
- **Certificados NFT:** Botão para mintar o BibleBadge na carteira conectada, efetuando o pagamento da taxa.

Para utilizar, basta preencher as constantes de endereço de contrato (`STAKING_ADDRESS`, `DAO_ADDRESS` e `NFT_ADDRESS`) no código-fonte com os endereços gerados pelo seu deploy e abrir o arquivo `index.html` em qualquer navegador moderno.

---

## Ferramentas Utilizadas
- **Hardhat**: Ambiente de desenvolvimento e testes.
- **OpenZeppelin Contracts**: Padrões seguros de código EVM (ERC20, ERC721, Ownable, etc).
- **Chainlink Price Feeds**: Oráculos descentralizados para conversão de moedas.
- **Ethers.js**: Biblioteca de interação com a Blockchain.
- **Chai**: Framework de asserções para testes.

---
*Feito com propósito e governança descentralizada.*
