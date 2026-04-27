// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";


contract BibleBadge is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;
    
    AggregatorV3Interface internal priceFeed;

    uint256 public constant USD_PRICE = 2;

    constructor(address initialOwner, address _priceFeed) 
        ERC721("BibleBadge", "BBDG") 
        Ownable(initialOwner) 
    {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

   
    function getMintPriceInETH() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        require(price > 0, "Preco invalido do oraculo");

        uint256 ethPriceInUsd = uint256(price) * 1e10;

        uint256 ethAmount = (USD_PRICE * 1e18 * 1e18) / ethPriceInUsd;
        
        return ethAmount;
    }

   
    function mintCertificate(string memory uri) public payable {
        uint256 requiredEth = getMintPriceInETH();
        require(msg.value >= requiredEth, "ETH insuficiente para pagar a taxa");

        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, uri);

        if (msg.value > requiredEth) {
            payable(msg.sender).transfer(msg.value - requiredEth);
        }
    }

   
    function withdrawFunds() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}