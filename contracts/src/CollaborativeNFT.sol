// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleCollaborativeNFT {
    struct NFT {
        address creator;
        string metadataURI;
        bool openToCollaboration;
    }
    
    mapping(uint256 => NFT) public nfts;
    mapping(uint256 => address[]) public contributors;
    mapping(uint256 => mapping(address => uint256)) public contributorShares;
    
    uint256 public nextTokenId = 1;
    
    event NFTCreated(uint256 tokenId, address creator, string metadataURI);
    event ContributionAdded(uint256 tokenId, address contributor, uint256 share);
    
    function createNFT(string memory metadataURI, bool openToCollaboration) public {
        nfts[nextTokenId] = NFT(msg.sender, metadataURI, openToCollaboration);
        contributors[nextTokenId].push(msg.sender);
        contributorShares[nextTokenId][msg.sender] = 10000; // 100%
        
        emit NFTCreated(nextTokenId, msg.sender, metadataURI);
        nextTokenId++;
    }
    
    function addContributor(uint256 tokenId, address contributor, uint256 share) public {
        require(msg.sender == nfts[tokenId].creator, "Only creator can add contributors");
        require(nfts[tokenId].openToCollaboration, "Not open to collaboration");
        
        contributors[tokenId].push(contributor);
        contributorShares[tokenId][contributor] = share;
        
        emit ContributionAdded(tokenId, contributor, share);
    }
}
