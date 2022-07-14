const { assert } = require("chai");
const { ethers } = require("hardhat");
const hre = require("hardhat");

let contractFactory = null;
let contract = null;
let contractOwner;
let account1;
let account2;
let account3;

before(async () => {
  contractFactory = await hre.ethers.getContractFactory("NftMarket");
  contract = await contractFactory.deploy();
  [contractOwner, account1, account2, account3] = await ethers.getSigners();
});

describe("Mint token", () => {
  const tokenURI = "https://test.com";

  it("owner of the first token should be address[0]", async () => {
    const txn = await contract.connect(contractOwner).mintToken(tokenURI);
    await txn.wait();
    const owner = await contract.ownerOf(1);

    assert.equal(
      owner,
      contractOwner.address,
      "Owner of token is not matching address[0]"
    );
  });
});
