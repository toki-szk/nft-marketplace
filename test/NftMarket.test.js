const { assert } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

let contractFactory = null;
let contract = null;
let contractOwner;
let account1;
let account2;
let account3;
let tokenURI;
let _nftPrice;
let _listingPrice;

before(async () => {
  contractFactory = await hre.ethers.getContractFactory("NftMarket");
  contract = await contractFactory.deploy();
  [contractOwner, account1, account2, account3] = await ethers.getSigners();
  tokenURI = "https://test.com";
  _nftPrice = ethers.utils.parseEther("0.3").toString();
  _listingPrice = ethers.utils.parseEther("0.025").toString();
});

describe("Mint token", () => {
  it("owner of the first token should be address[0]", async () => {
    const txn = await contract
      .connect(contractOwner)
      .mintToken(tokenURI, _nftPrice, {
        value: _listingPrice,
      });
    await txn.wait();
    const owner = await contract.ownerOf(1);

    assert.equal(
      owner,
      contractOwner.address,
      "Owner of token is not matching address[0]"
    );
  });

  it("first token should point to the correct tokenURI", async () => {
    const actualTokenURI = await contract.tokenURI(1);

    assert.equal(actualTokenURI, tokenURI, "tokenURI is not correctly set");
  });

  it("should not be possible to create a NFT with used tokenURI", async () => {
    try {
      const txn = await contract
        .connect(contractOwner)
        .mintToken(tokenURI, _nftPrice, {
          value: _listingPrice,
        });
      await txn.wait();
    } catch (error) {
      assert(error, "NFT was minted with previously used tokenURI");
    }
  });

  it("should have one listed item", async () => {
    const listedItemCount = await contract.listedItemsCount();
    assert.equal(listedItemCount.toNumber(), 1, "Listed items count is not 1");
  });

  it("should have create NFT item", async () => {
    const nftItem = await contract.getNftItem(1);

    assert.equal(nftItem.tokenId, 1, "Token id is not 1");
    assert.equal(nftItem.price, _nftPrice, "Nft price is not correct");
    assert.equal(
      nftItem.creator,
      contractOwner.address,
      "Creator is not account[0]"
    );
    assert.equal(nftItem.isListed, true, "Token is not listed");
  });
});

describe("Buy NFT", () => {
  before(async () => {
    await contract.connect(account1).buyNft(1, {
      value: _nftPrice,
    });
  });

  it("should unlist the item", async () => {
    const listedItem = await contract.getNftItem(1);
    assert.equal(listedItem.isListed, false, "Item is still listed");
  });

  it("should decrease listed items count", async () => {
    const listedItemsCount = await contract.listedItemsCount();
    assert.equal(
      listedItemsCount.toNumber(),
      0,
      "Count has not been decrement"
    );
  });

  it("should change the owner", async () => {
    const currentOwner = await contract.ownerOf(1);
    assert.equal(currentOwner, account1.address, "Item is still listed");
  });
});
