// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

contract NftMarket is ERC721URIStorage {
  using Counters for Counters.Counter;

  uint public listingPrice = 0.025 ether;
  Counters.Counter private _listedItems;
  Counters.Counter private _tokenIds;

  mapping(string => bool) private _usedTokenURIs;
  mapping(uint256 => NftItem) private _idToNftItem;

  mapping(address => mapping(uint256 => uint256)) private _ownedTokens;
  mapping (uint256 => uint256) private _idToOwnedIndex;

  uint256[] private _allNfts;
  mapping (uint256 => uint256) private _idToNftIndex;

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

  function totalSupply() public view returns (uint256) {
    return _allNfts.length;
  }

  function tokenByIndex(uint256 index) public view returns (uint256) {
    require(index < totalSupply(), "Index out of bounds");
    return _allNfts[index];
  }

  function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256) {
    require(index < ERC721.balanceOf(owner), "Index out of bounds");
    return _ownedTokens[owner][index];
  }

  function getAllNftsOnSale() public view returns(NftItem[] memory) {
    uint256 allItemsCounts = totalSupply();
    uint256 currentIndex = 0;
    
    NftItem[] memory items = new NftItem[](_listedItems.current());

    for (uint256 i = 0; i < allItemsCounts; i++) {
      uint256 tokenId = tokenByIndex(i);
      NftItem storage item = _idToNftItem[tokenId];

      if(item.isListed == true) {
        items[currentIndex] = item;
        currentIndex += 1;

      }
    }

    return items;
  }

  function tokenURIExists(string memory tokenURI) public view returns (bool) {
    return _usedTokenURIs[tokenURI] == true;
  }

  function getOwnedNfts() public view returns(NftItem[] memory) {
    uint256 ownedItemsCount = ERC721.balanceOf(msg.sender);
    NftItem[] memory items = new NftItem[](ownedItemsCount);

    for(uint i = 0; i < ownedItemsCount; i++) {
      uint256 tokenId = tokenOfOwnerByIndex(msg.sender, i);
      NftItem storage item = _idToNftItem[tokenId];
      items[i] = item;
    }

    return items;
  }

  function burnToken(uint tokenId) public {
    _burn(tokenId);
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

  function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal virtual override {
    super._beforeTokenTransfer(from, to, tokenId);
    if(from == address(0)) {
      _addTokenToAllTokensEnumeration(tokenId);
    }

    if(to == address(0)) {
      _removeTokenFromAllTokensEnumeration(tokenId);
    } else if(to != from) {
      _addTokenToOwnerEnumeration(to, tokenId);
    }
  }

  function _addTokenToAllTokensEnumeration(uint256 tokenId) private {
    _idToNftIndex[tokenId] = _allNfts.length;
    _allNfts.push(tokenId);
  }

  function _addTokenToOwnerEnumeration(address to, uint256 tokenId) private {
    uint256 length = ERC721.balanceOf(to);

    _ownedTokens[to][length] = tokenId;
    _idToOwnedIndex[tokenId] = length;
  }

  function _removeTokenFromAllTokensEnumeration(uint256 tokenId) private {
    uint lastTokenIndex = _allNfts.length - 1;
    uint tokenIndex = _idToNftIndex[tokenId];
    uint lastTokenId = _allNfts[lastTokenIndex];

    _allNfts[tokenIndex] = lastTokenId;
    _idToNftIndex[lastTokenId] = tokenIndex;

    delete _idToNftIndex[tokenId];
    _allNfts.pop();
  }
}
