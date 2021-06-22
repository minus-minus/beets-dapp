//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract HarbergerAsset is ERC721URIStorage {
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  mapping(uint256 => Asset) public assets;
  mapping(uint256 => mapping(address => uint256)) public balances;

  string public baseURI = "https://ipfs.io/ipfs/";

  address public admin;
  uint256 public baseInterval = 43200 seconds;
  uint256 public baseTaxPrice = 1e16;
  uint256 public royaltyPercentage = 10;
  uint256 public taxPercentage = 10;

  uint256 private taxDenominator = 100 / taxPercentage;

  struct Asset {
    address creator;
    uint256 price;
    uint256 taxAmount;
    uint256 totalDeposit;
    uint256 deadline;
    uint256 lastDeposit;
  }

  event Mint   (address indexed _from, address indexed _to,      uint256 indexed _tokenId);
  event List   (address indexed _from, uint256 indexed _tokenId, uint256 indexed _price);
  event Deposit(address indexed _from, uint256 indexed _tokenId, uint256 indexed _taxAmount);
  event Sale   (address indexed _from, uint256 indexed _tokenId, uint256 indexed _amount);
  event Collect(address indexed _from, uint256 indexed _tokenId, uint256 indexed _taxFund);
  event Reclaim(address indexed _from, address indexed _to,      uint256 indexed _tokenId);

  constructor() ERC721("HarbergerAsset", "ASSET") {
    admin = _msgSender();
  }

  function _baseURI() override internal view virtual returns (string memory) {
    return baseURI;
  }

  function mintToken(string memory _tokenURI) public returns (uint256) {
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _safeMint(_msgSender(), newItemId);
    _setTokenURI(newItemId, _tokenURI);

    assets[newItemId] = Asset(_msgSender(), 0, 0, 0, block.timestamp.add(baseInterval), block.timestamp);
    balances[newItemId][admin] = 0;
    balances[newItemId][_msgSender()] = 0;

    emit Mint(address(0), _msgSender(), newItemId);
    return newItemId;
  }

  function listAssetForSaleInWei(uint256 _tokenId, uint256 _price) public {
    require(_exists(_tokenId), "Token does not exist");
    require(ownerOf(_tokenId) == _msgSender(), "You are not the owner of this asset");

    assets[_tokenId].price = _price;
    assets[_tokenId].taxAmount = _price.div(taxDenominator);

    emit List(_msgSender(), _tokenId, _price);
  }

  function buyAssetInWei(uint256 _tokenId) public payable {
    require(_exists(_tokenId), "Token does not exist");
    require(ownerOf(_tokenId) != _msgSender(), "You are already the owner of this asset");
    require(assets[_tokenId].price == msg.value, "Incorrect amount paid");

    address currentOwner = ownerOf(_tokenId);
    address creator = assets[_tokenId].creator;
    uint256 royalty = msg.value.div(royaltyPercentage);
    uint256 payment = msg.value.sub(msg.value.div(royaltyPercentage));

    payable(creator).transfer(royalty);
    payable(currentOwner).transfer(payment);
    this.safeTransferFrom(currentOwner, _msgSender(), _tokenId);
    refundTax(_tokenId, currentOwner);

    uint256 contractBalance = address(this).balance;
    uint256 adminBalance = balances[_tokenId][admin];
    uint256 creatorBalance = balances[_tokenId][creator];
    uint256 remainingBalance = contractBalance.sub(adminBalance).sub(creatorBalance);

    balances[_tokenId][admin] += remainingBalance.div(2).sub(adminBalance);
    balances[_tokenId][creator] += remainingBalance.div(2).sub(creatorBalance);

    resetAsset(_tokenId);

    baseTaxPrice += 1e15;
    /* baseInterval += 4320 seconds; */

    emit Sale(_msgSender(), _tokenId, msg.value);
  }

  function depositTaxInWei(uint256 _tokenId) public payable {
    require(_exists(_tokenId), "Token does not exist");
    require(ownerOf(_tokenId) == _msgSender(), "You are not the owner of this asset");
    require(assets[_tokenId].price > 0, "You must first set a sales price");
    require(msg.value >= assets[_tokenId].taxAmount, "Insufficient tax funds deposited");

    uint256 multiplier = msg.value.div(baseTaxPrice);
    assets[_tokenId].deadline += baseInterval.mul(multiplier);
    assets[_tokenId].lastDeposit = block.timestamp;
    assets[_tokenId].totalDeposit += msg.value;

    emit Deposit(_msgSender(), _tokenId, msg.value);
  }

  function collectFunds(uint256 _tokenId) public {
    require(_exists(_tokenId), "Token does not exist");
    require(balances[_tokenId][_msgSender()] > 0, "You do not have any funds available to withdraw");

    uint256 taxAmount = balances[_tokenId][_msgSender()];
    payable(_msgSender()).transfer(taxAmount);
    balances[_tokenId][_msgSender()] = 0;

    emit Collect(_msgSender(), _tokenId, taxAmount);
  }

  function reclaimAsset(uint256 _tokenId) public {
    require(_exists(_tokenId), "Token does not exist");
    require(_msgSender() == assets[_tokenId].creator, "You are not the creator of this asset");
    require(timeExpired(_tokenId), "Time has not yet expired for you to reclaim this asset");

    address currentOwner = ownerOf(_tokenId);
    safeTransferFrom(currentOwner, _msgSender(), _tokenId);

    emit Reclaim(currentOwner, _msgSender(), _tokenId);
  }

  function timeExpired(uint256 _tokenId) public view returns (bool) {
    require(_exists(_tokenId), "Token does not exist");

    return block.timestamp >= assets[_tokenId].deadline;
  }

  function refundTax(uint256 _tokenId, address _currentOwner) internal {
    uint256 deadline = assets[_tokenId].deadline;

    if (deadline - block.timestamp > baseInterval) {
      uint256 timeRemaining = deadline - block.timestamp;
      uint256 taxMultiplier = timeRemaining.div(baseInterval);
      uint256 refundAmount = baseTaxPrice.mul(taxMultiplier);

      payable(_currentOwner).transfer(refundAmount);
    }
  }

  function resetAsset(uint256 _tokenId) internal {
    assets[_tokenId].price = 0;
    assets[_tokenId].taxAmount = 0;
    assets[_tokenId].totalDeposit = 0;
    assets[_tokenId].deadline = block.timestamp.add(baseInterval);
    assets[_tokenId].lastDeposit = block.timestamp;
  }

  function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory _data) public virtual override {
    require(
      _isApprovedOrOwner(_msgSender(), tokenId) ||
      _msgSender() == assets[tokenId].creator && timeExpired(tokenId),
      "Transfer caller is not owner, approved nor creator"
    );

    _safeTransfer(from, to, tokenId, _data);
  }
}
