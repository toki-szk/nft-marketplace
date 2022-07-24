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

describe("Token transfers", () => {
  const tokenURI = "https://test-json-2.com";
  before(async () => {
    const txn = await contract
      .connect(contractOwner)
      .mintToken(tokenURI, _nftPrice, {
        value: _listingPrice,
      });
    await txn.wait();
  });

  it("shold have two NFTs created", async () => {
    const totalSupply = await contract.totalSupply();

    assert.equal(
      totalSupply.toNumber(),
      2,
      "Total supply of token is not correct"
    );
  });

  it("should be able to retreive nft by index", async () => {
    const nftid1 = await contract.tokenByIndex(0);
    const nftid2 = await contract.tokenByIndex(1);

    assert.equal(nftid1.toNumber(), 1, "NFT is is wrong");
    assert.equal(nftid2.toNumber(), 2, "NFT is is wrong");
  });

  it("should have one listed NFT", async () => {
    const allNfts = await contract.getAllNftsOnSale();
    assert.equal(allNfts[0].tokenId, 2, "Nft has a wrong id");
  });

  it("account[1] should have one owned NFT", async () => {
    const ownedNfts = await contract.connect(account1).getOwnedNfts();

    assert.equal(ownedNfts[0].tokenId, 1, "Nft has a wrong id");
  });

  it("account[0] should have one owned NFT", async () => {
    const ownedNfts = await contract.connect(contractOwner).getOwnedNfts();

    assert.equal(ownedNfts[0].tokenId, 2, "Nft has a wrong id");
  });
});

describe("Token transfer to new owner", () => {
  before(async () => {
    await contract
      .connect(contractOwner)
      .transferFrom(contractOwner.address, account1.address, 2);
  });

  it("accounts[0] should own 0 tokens", async () => {
    const ownedNfts = await contract.connect(contractOwner).getOwnedNfts();
    assert.equal(ownedNfts.length, 0, "Invalid length of tokens");
  });

  it("accounts[1] should own 2 tokens", async () => {
    const ownedNfts = await contract.connect(account1).getOwnedNfts();
    assert.equal(ownedNfts.length, 2, "Invalid length of tokens");
  });
});

describe("List an Nft", () => {
  before(async () => {
    await contract.connect(account1).placeNftOnSale(1, _nftPrice, {
      value: _listingPrice,
    });
  });

  it("should have two listed items", async () => {
    const listedNfts = await contract.getAllNftsOnSale();

    assert.equal(listedNfts.length, 2, "Invalid length of Nfts");
  });

  it("should set new listing price", async () => {
    await contract.connect(contractOwner).setListingPrice(_listingPrice);
    const listingPrice = await contract.listingPrice();

    assert.equal(listingPrice.toString(), _listingPrice, "Invalid Price");
  });
});
