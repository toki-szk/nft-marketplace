// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract NftMarket is ERC721URIStorage {
  using Counters for Counters.Counter;

  Counters.Counter private _listedItems;
  Counters.Counter private _tokenIds;
  uint public listingPrice = 0.025 ether;
  mapping(string => bool) private _usedTokenURIs;
  mapping(uint256 => NftItem) private _idToNftItem;

  struct NftItem {
    uint256 tokenId;
    uint256 price;
    address creator;
    bool isListed;
  }

  event NftItemCreated (
    uint256 tokenId,
    uint256 price,
    address creator,
    bool isListed
  );

  constructor() ERC721("CreaturesNFT", "CNFT") {}

  function getNftItem(uint256 tokenId) public view returns (NftItem memory) {
    return _idToNftItem[tokenId];
  }

  function listedItemsCount() public view returns (uint256) {
    return _listedItems.current();
  }

  function tokenURIExists(string memory tokenURI) public view returns (bool) {
    return _usedTokenURIs[tokenURI] == true;
  }

  function mintToken(string memory tokenURI, uint256 price) public payable returns(uint256) {
    require(!tokenURIExists(tokenURI), "Token URI already exists");
    require(msg.value == listingPrice, "Price must be equal to listing price");
    _tokenIds.increment();
    _listedItems.increment();

    uint256 newTokenId = _tokenIds.current();
    _safeMint(msg.sender, newTokenId);
    _setTokenURI(newTokenId, tokenURI);
    _createNftItem(newTokenId, price);
    _usedTokenURIs[tokenURI] = true;

    return newTokenId;
  }

  function buyNft(uint256 tokenId) public payable {
    uint price = _idToNftItem[tokenId].price;
    address owner = ERC721.ownerOf(tokenId);

    require(msg.sender != owner, "You already own this NFT");
    require(msg.value == price, "Please submit the asking price");

    _idToNftItem[tokenId].isListed = false;
    _listedItems.decrement();

    _transfer(owner, msg.sender, tokenId);
    payable(owner).transfer(msg.value);
  }

  function _createNftItem(uint256 tokenId, uint256 price) private {
    require(price > 0, "Price must be at least 1 wei");

    _idToNftItem[tokenId] = NftItem(
      tokenId,
      price,
      msg.sender,
      true
    );

    emit NftItemCreated(tokenId, price, msg.sender, true);
  }

}
