require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  paths: {
    cache: "./public/contracts/cache",
    artifacts: "./public/contracts/artifacts",
  },
};
