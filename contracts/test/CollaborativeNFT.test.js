const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CollaborativeNFT", function () {
  let collaborativeNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const CollaborativeNFT = await ethers.getContractFactory("CollaborativeNFT");
    collaborativeNFT = await CollaborativeNFT.deploy();
    await collaborativeNFT.deployed();
  });

  it("Should mint a new collaborative NFT", async function () {
    const tokenURI = "https://example.com/metadata/1";
    const initialRoyalty = 10000; // 100%
    const openToCollaboration = true;

    await expect(collaborativeNFT.mintCollaborativeNFT(tokenURI, initialRoyalty, openToCollaboration))
      .to.emit(collaborativeNFT, "NFTMinted")
      .withArgs(1, owner.address, tokenURI);

    expect(await collaborativeNFT.ownerOf(1)).to.equal(owner.address);
  });

  it("Should allow contribution requests", async function () {
    // First mint an NFT
    await collaborativeNFT.mintCollaborativeNFT("https://example.com/metadata/1", 10000, true);
    
    // Request contribution
    await expect(collaborativeNFT.connect(addr1).requestContribution(
      1, 
      "Lyrics", 
      "https://example.com/contribution/1", 
      1000
    )).to.emit(collaborativeNFT, "ContributionRequested");
  });
});
