// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
// Import this file to use console.log
import "hardhat/console.sol";

contract NftMarket is ERC721URIStorage {
  constructor() ERC721("CreaturesNFT", "CNFT") {}
}
