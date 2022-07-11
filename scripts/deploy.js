const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const nftMarket = await hre.ethers.getContractFactory("NftMarket");
  const NFTMARKET = await nftMarket.deploy();

  await NFTMARKET.deployed();

  console.log("deployed to:", NFTMARKET.address);
  let config = `
  {
    "address": "${NFTMARKET.address}"
  }
`;
  let data = JSON.stringify(config);
  fs.writeFileSync("./public/contracts/config.json", JSON.parse(data));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
