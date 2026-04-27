// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBibleStaking {
    function stakedBalance(address account) external view returns (uint256);
}

contract BibleDAO {
    IBibleStaking public stakingContract;

    struct Proposal {
        uint256 id;
        string description;
        uint256 voteCount; 
        bool executed;    
        uint256 endTime;   
    }

    uint256 public proposalCount;
    
    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ProposalCreated(uint256 id, string description, uint256 endTime);
    event Voted(uint256 proposalId, address voter, uint256 weight);
    event ProposalExecuted(uint256 id);

    constructor(address _stakingContract) {
        stakingContract = IBibleStaking(_stakingContract);
    }

  
    function createProposal(string memory _description, uint256 _durationInMinutes) external {
        require(stakingContract.stakedBalance(msg.sender) > 0, "Apenas stakers podem criar propostas");

        proposalCount++;
        uint256 endTime = block.timestamp + (_durationInMinutes * 1 minutes);

        proposals[proposalCount] = Proposal({
            id: proposalCount,
            description: _description,
            voteCount: 0,
            executed: false,
            endTime: endTime
        });

        emit ProposalCreated(proposalCount, _description, endTime);
    }

 
    function vote(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp < proposal.endTime, "Votacao encerrada");
        require(!hasVoted[_proposalId][msg.sender], "Voce ja votou nesta proposta");

        uint256 votingPower = stakingContract.stakedBalance(msg.sender);
        require(votingPower > 0, "Sem poder de voto. Faca stake primeiro.");

        proposal.voteCount += votingPower;
        hasVoted[_proposalId][msg.sender] = true;

        emit Voted(_proposalId, msg.sender, votingPower);
    }

  
    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        
        require(block.timestamp >= proposal.endTime, "Votacao ainda em andamento");
        require(!proposal.executed, "Proposta ja executada");

        proposal.executed = true;
        
        emit ProposalExecuted(_proposalId);
    }
}