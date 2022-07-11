const hre = require("hardhat");

async function main() {
  const nftMarket = await hre.ethers.getContractFactory("NftMarket");
  const NFTMARKET = await nftMarket.deploy();

  await NFTMARKET.deployed();

  console.log("deployed to:", NFTMARKET.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
