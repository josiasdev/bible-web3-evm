// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BibleBadge is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner) 
        ERC721("BibleBadge", "BBDG") 
        Ownable(initialOwner) 
    {}

    function mintCertificate(address to, string memory uri) public onlyOwner {
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _mint(to, tokenId);
        
        _setTokenURI(tokenId, uri);
    }

   
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }
}