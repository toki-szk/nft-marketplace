const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const nftMarket = await hre.ethers.getContractFactory("NftMarket");
  const NFTMARKET = await nftMarket.deploy();

  await NFTMARKET.deployed();

  NFTMARKET.mintToken(
    "https://gateway.pinata.cloud/ipfs/Qmb4aom5xNRE5CBRHZsxCsYSdcmX8zfHXgM7ovZxLp3CqL",
    "500000000000000000",
    {
      value: "25000000000000000",
      from: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    }
  );

  NFTMARKET.mintToken(
    "https://gateway.pinata.cloud/ipfs/QmVZadDmv8JCUAtFUbt8p1BCLncTtzE3pRVYvNme1YKr7J",
    "500000000000000000",
    {
      value: "25000000000000000",
      from: "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    }
  );

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
