// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

/*
 * Powered By: BeetsDAO
 * External Sources:
 *    https://github.com/yosriady/PatronageCollectibles
 *    https://github.com/simondlr/thisartworkisalwaysonsale
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/**
 * @author swaHili
 * @title An asset tied to Harberger Taxes
 * @dev Each asset is controlled by it's own custom marketplace
 */
contract HarbergerAsset is ERC721URIStorage {
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // Owner of contract
  address public admin;

  // Base time interval in seconds used to calculate foreclosure date (24 hours)
  uint256 public baseInterval = 86400 seconds;

  // Prepend baseURI to IPFS Hash to create tokenURI (alternate baseURI: `ipfs://`)
  string  public baseURI = "https://ipfs.io/ipfs/";

  // Percentage of sales price shows how royalty amount is calculated
  uint256 public royaltyPercentage = 10;

  // Percentage of sales price shows how tax amount is calculated
  uint256 public taxRatePercentage = 10;

  // Denominator used to calculate royalty amount
  uint256 private royaltyDenominator = 100 / royaltyPercentage;

  // Denominator used to calculate tax amount
  uint256 private taxDenominator = 100 / taxRatePercentage;

  // Mapping tokenId to Asset struct
  mapping(uint256 => Asset) public assets;

  // Mapping tokenId to Mapping from tax collector address to balance amount
  mapping(uint256 => mapping(address => uint256)) public balances;

  // Mapping tokenId to base tax value in wei which is used to calculate foreclosure date
  mapping(uint256 => uint256) public baseTaxValues;

  // Mapping tokenURI to boolean value
  mapping(string => bool) public tokenURIs;

  /**
   * @dev Object that represents the current state of each asset
   * `tokenId` ID of the token
   * `creator` Address of the artist who created the asset
   * `priceAmount` Price amount in wei of the asset
   * `taxAmount` Tax amount in wei of the asset
   * `totalDepositAmount` Total amount deposited in wei by the current owner of the asset
   * `lastDepositTimestamp` Timestamp of the last tax deposit performed by the current owner
   * `foreclosureTimestamp` Timestamp of the foreclosure for which taxes must be paid by the current owner
   */
  struct Asset {
    uint256 tokenId;
    address creator;
    uint256 priceAmount;
    uint256 taxAmount;
    uint256 totalDepositAmount;
    uint256 lastDepositTimestamp;
    uint256 foreclosureTimestamp;
  }

  /**
   * @dev List of possible events emitted to log each and every user transaction
   */
  event List       (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value);
  event Deposit    (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value);
  event Sale       (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value);
  event Refund     (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value);
  event Collect    (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value);
  event Foreclosure(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to);

  /**
   * @dev Initializes contract and sets `admin` to address that deploys contract.
   */
  constructor() ERC721("HarbergerAsset", "ASSET") {
    admin = _msgSender();
  }

  /**
   * @dev Modifier that checks if `admin` is equal to `msgSender()`.
   */
  modifier onlyAdmin() {
    require(admin == _msgSender(), "You are not authorized to perform this action");
    _;
  }

  /**
   * @dev Modifier that checks if `creator` of asset is equal to `msgSender()`.
   * @param _tokenId ID of the token
   */
  modifier onlyCreator(uint256 _tokenId) {
    require(assets[_tokenId].creator == _msgSender(), "You are not the creator of this asset");
    _;
  }

  /**
   * @dev Modifier that checks if `admin` or `creator` of asset is equal to `msgSender()`.
   * @param _tokenId ID of the token
   */
  modifier onlyAdminOrCreator(uint256 _tokenId) {
    require(admin == _msgSender() || assets[_tokenId].creator == _msgSender(), "You are not the admin nor creator of this asset");
    _;
  }

  /**
   * @dev Modifier that checks if `owner` of asset is equal to `msgSender()`.
   * @param _tokenId ID of the token
   */
  modifier onlyOwner(uint256 _tokenId) {
    require(ownerOf(_tokenId) == _msgSender(), "You are not the owner of this asset");
    _;
  }

  /**
   * @dev Modifier that checks if `tokenId` exists.
   * @param _tokenId ID of the token
   */
  modifier validToken(uint256 _tokenId) {
    require(_exists(_tokenId), "Token does not exist");
    _;
  }

  /**
   * @dev Mints `tokenId`, transfers it to `creator`, and sets `tokenURI`
   * @param _tokenURI IPFS hash generated from JSON metadata
   * @param _creator Address of artist who created the asset
   * @return the newly created `tokenId`
   *
   * Requirements:
   *
   * - `tokenURI` must not exist.
   *
   * Emits a {Transfer} event.
   */
  function mintAsset(string memory _tokenURI, address _creator) public onlyAdmin returns (uint256) {
    require(tokenURIs[_tokenURI] == false, "TokenURI already exists");

    tokenURIs[_tokenURI] = true;
    _tokenIds.increment();

    uint256 newItemId = _tokenIds.current();
    _safeMint(_creator, newItemId);
    _setTokenURI(newItemId, _tokenURI);

    initializeAsset(newItemId, _creator);
    balances[newItemId][admin] = 0;
    balances[newItemId][_creator] = 0;
    baseTaxValues[newItemId] = 10000000000000000; // .01 ETH

    return newItemId;
  }

  /**
   * @dev See {IERC721-baseURI}.
   */
  function _baseURI() override internal view virtual returns (string memory) {
    return baseURI;
  }

  /**
   * @dev Lists asset for sale in wei.
   * @param _tokenId ID of the token
   * @param _priceAmount Price amount in wei of the asset
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `owner` of asset must be equal to `msgSender()`.
   * - 'priceAmount' of asset must be greater than 0.
   *
   * Emits a {List} event.
   */
  function listAssetForSaleInWei(uint256 _tokenId, uint256 _priceAmount) public validToken(_tokenId) onlyOwner(_tokenId) {
    require(_priceAmount > 0, "You must set a sales price greater than 0");
    require(timeExpired(_tokenId) == false, "A foreclosure on this asset has already begun");

    assets[_tokenId].priceAmount = _priceAmount;
    assets[_tokenId].taxAmount = _priceAmount.div(taxDenominator);

    emit List(block.timestamp, _tokenId, _msgSender(), _priceAmount);
  }

  /**
   * @dev Deposits taxes into contract.
   * @param _tokenId ID of the token
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `owner` of asset must be equal to `msgSender()`.
   * - `priceAmount` of asset must be greater than 0.
   * - `msg.value` must be greater than 0.
   * - `msg.value` must be greater than or equal to `taxAmount` of asset OR `totalDepositAmount` must be greater than 0.
   *
   * Emits a {Deposit} event.
   */
  function depositTaxInWei(uint256 _tokenId) public payable validToken(_tokenId) onlyOwner(_tokenId) {
    require(assets[_tokenId].priceAmount > 0, "You must first set a sales price");
    require(msg.value > 0, "You must deposit a tax amount greater than 0");
    require(assets[_tokenId].taxAmount <= msg.value || assets[_tokenId].totalDepositAmount > 0, "Your initial deposit must not be less than the current tax price");
    require(timeExpired(_tokenId) == false, "A foreclosure on this asset has already begun");

    uint256 baseTaxValue = baseTaxValues[_tokenId];
    uint256 taxMultiplier = msg.value.div(baseTaxValue);

    assets[_tokenId].foreclosureTimestamp += baseInterval.mul(taxMultiplier);
    assets[_tokenId].lastDepositTimestamp = block.timestamp;
    assets[_tokenId].totalDepositAmount += msg.value;

    emit Deposit(block.timestamp, _tokenId, _msgSender(), address(this), msg.value);
  }

  /**
   * @dev Purchase of asset triggers payment transfers, tax refund, asset transfer and balance updates.
   * @param _tokenId ID of the token
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `owner` of asset must not be equal to `msgSender()`.
   * - `priceAmount` of asset must be greater than 0.
   * - `priceAmount` of asset must be equal to `msg.value`.
   *
   * Emits a {Sale} event.
   */
  function buyAssetInWei(uint256 _tokenId) public payable validToken(_tokenId) {
    require(ownerOf(_tokenId) != _msgSender(), "You are already the owner of this asset");
    require(assets[_tokenId].priceAmount > 0, "This asset is currently not up for sale");
    require(assets[_tokenId].priceAmount == msg.value, "Incorrect payment amount");

    address currentOwner = ownerOf(_tokenId);
    address creator = assets[_tokenId].creator;

    transferPayment(msg.value, currentOwner, creator);
    refundTax(_tokenId, currentOwner);

    emit Sale(block.timestamp, _tokenId, _msgSender(), msg.value);
    this.safeTransferFrom(currentOwner, _msgSender(), _tokenId);

    updateBalance(_tokenId, creator);
    initializeAsset(_tokenId, creator);

    /* baseTaxValues[_tokenId] += 1000000000000000; // 0.001 ETH */
  }

  /**
   * @dev Transfers royalties to `admin` and `creator` of asset and transfers remaining payment to `currentOwner`.
   * @param _payment Value in wei paid by the new owner
   * @param _currentOwner Address of current owner of the asset
   * @param _creator Address of artist who created the asset
   */
  function transferPayment(uint256 _payment, address _currentOwner, address _creator) internal {
    uint256 royaltyAmount = _payment.div(royaltyDenominator);
    uint256 paymentAmount = _payment.sub(royaltyAmount);

    payable(admin).transfer(royaltyAmount.div(2));
    payable(_creator).transfer(royaltyAmount.div(2));
    payable(_currentOwner).transfer(paymentAmount);
  }

  /**
   * @dev Refunds `currentOwner` the remaining tax amount. Since taxes are paid in advance based on a time interval, if the asset is purchased before the foreclosure date is reached, the `currentOwner` should receive a portion of those taxes back. The refund calculation is simply the reverse of how the asset foreclosure date is calculated.
   * @param _tokenId ID of the token
   * @param _currentOwner Address of current owner of the asset
   *
   * Emits a {Refund} event if `timeRemaining` is more than `baseInterval`.
   */
  function refundTax(uint256 _tokenId, address _currentOwner) internal {
    uint256 foreclosureTimestamp = assets[_tokenId].foreclosureTimestamp;
    uint256 timeRemainingTimestamp = foreclosureTimestamp - block.timestamp;

    if (int256(timeRemainingTimestamp) > int256(baseInterval)) {
      uint256 taxMultiplier = timeRemainingTimestamp.div(baseInterval);
      uint256 baseTaxValue = baseTaxValues[_tokenId];
      uint256 refundAmount = baseTaxValue.mul(taxMultiplier);

      payable(_currentOwner).transfer(refundAmount);

      emit Refund(block.timestamp, _tokenId, address(this), _currentOwner, refundAmount);
    }
  }

  /**
   * @dev Updates the `admin` and `creator` balances.
   * @param _tokenId ID of the token
   * @param _creator Address of artist who created the asset
   */
  function updateBalance(uint256 _tokenId, address _creator) internal {
    uint256 contractBalance = address(this).balance;
    uint256 adminBalance = balances[_tokenId][admin];
    uint256 creatorBalance = balances[_tokenId][_creator];
    uint256 remainingBalance = contractBalance.sub(adminBalance).sub(creatorBalance);
    uint256 splitBalance = remainingBalance.div(2);

    balances[_tokenId][admin] += splitBalance.sub(adminBalance);
    balances[_tokenId][_creator] += splitBalance.sub(creatorBalance);
  }

  /**
   * @dev Collects `balance` and transfers it to `msgSender()`.
   * @param _tokenId ID of the token
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `admin` or `creator` of the asset must be equal to `msgSender()`.
   * - `balance` of `msgSender()` must be greater than 0.
   *
   * Emits a {Collect} event.
   */
  function collectFunds(uint256 _tokenId) public validToken(_tokenId) onlyAdminOrCreator(_tokenId) {
    require(balances[_tokenId][_msgSender()] > 0, "You do not have any funds available to withdraw");

    uint256 amount = balances[_tokenId][_msgSender()];
    payable(_msgSender()).transfer(amount);
    balances[_tokenId][_msgSender()] = 0;

    emit Collect(block.timestamp, _tokenId, _msgSender(), amount);
  }

  /**
   * @dev Reclaims asset and transfers it back to `creator`.
   * @param _tokenId ID of the token
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `creator` must be equal to `msgSender()`.
   * - `timeExpired()` of `tokenId` must be equal to true.
   *
   * Emits a {Foreclosure} event.
   */
  function reclaimAsset(uint256 _tokenId) public validToken(_tokenId) onlyCreator(_tokenId) {
    require(timeExpired(_tokenId), "Time has not yet expired for you to reclaim this asset");

    address currentOwner = ownerOf(_tokenId);
    emit Foreclosure(block.timestamp, _tokenId, _msgSender(), currentOwner);

    safeTransferFrom(currentOwner, _msgSender(), _tokenId);
    initializeAsset(_tokenId, _msgSender());
  }

  /**
   * @dev Checks if current time is greater than `foreclosure` timestamp of asset.
   * @param _tokenId ID of the token
   * @return boolean value to determine status of asset foreclosure
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   */
  function timeExpired(uint256 _tokenId) public view validToken(_tokenId) returns (bool) {
    return block.timestamp >= assets[_tokenId].foreclosureTimestamp;
  }

  /**
   * @dev Resets asset to initial state.
   * @param _tokenId ID of the token
   * @param _creator Address of the creator of the asset
   */
  function initializeAsset(uint256 _tokenId, address _creator) internal {
    assets[_tokenId].tokenId = _tokenId;
    assets[_tokenId].creator = _creator;
    assets[_tokenId].priceAmount = 0;
    assets[_tokenId].taxAmount = 0;
    assets[_tokenId].totalDepositAmount = 0;
    assets[_tokenId].lastDepositTimestamp = block.timestamp;
    assets[_tokenId].foreclosureTimestamp = block.timestamp.add(baseInterval);
  }

  /**
   * @dev Fetches inventory of assets that currently exist on this contract
   */
  function fetchAssets() public view returns(Asset[] memory) {
    uint256 totalCount = _tokenIds.current();
    Asset[] memory inventory = new Asset[](totalCount);

    for (uint i = 0; i < totalCount; i++) {
      inventory[i] = assets[i + 1];
    }

    return inventory;
  }

  /**
   * @dev Updates the mapping value of `baseTaxValues`.
   * @param _tokenId ID of the token
   * @param _amount New base tax value in wei
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `creator` must be equal to `_msgSender()`.
   * - `amount` must be different than the current value.
   */
  function setBaseTaxValueInWei(uint256 _tokenId, uint256 _amount) public validToken(_tokenId) onlyCreator(_tokenId) {
    require(baseTaxValues[_tokenId] != _amount, "New value must be different than the current value");

    baseTaxValues[_tokenId] = _amount;
  }

  /**
   * @dev Updates the state variable `baseInterval`.
   * @param _interval New base time interval in seconds
   *
   * Requirements:
   *
   * - `admin` must be equal to `_msgSender()`.
   * - `interval` must be different than the current value.
   */
  function setBaseIntervalInSeconds(uint256 _interval) public onlyAdmin {
    require(baseInterval != _interval, "New value must be different than the current value");

    baseInterval = _interval;
  }

  /**
   * @dev Updates the state variable `royaltyPercentage`.
   * @param _percentage New royalty percentage
   *
   * Requirements:
   *
   * - `admin` must be equal to `_msgSender()`.
   * - `percentage` must be different than the current value.
   */
  function setRoyaltyPercentage(uint256 _percentage) public onlyAdmin {
    require(royaltyPercentage != _percentage, "New value must be different than the current value");

    royaltyPercentage = _percentage;
  }

  /**
   * @dev Updates the state variable `taxRatePercentage`.
   * @param _percentage New tax percentage
   *
   * Requirements:
   *
   * - `admin` must be equal to `_msgSender()`.
   * - `percentage` must be different than the current value.
   */
  function setTaxRatePercentage(uint256 _percentage) public onlyAdmin {
    require(taxRatePercentage != _percentage, "New value must be different than the current value");

    taxRatePercentage = _percentage;
  }

  /**
   * @dev See {IERC721-safeTransferFrom}.
   */
  function safeTransferFrom(
      address from,
      address to,
      uint256 tokenId,
      bytes memory _data
    ) public virtual override {
    require(
      _isApprovedOrOwner(_msgSender(), tokenId) ||
      (assets[tokenId].creator == _msgSender() && timeExpired(tokenId)),
      "Transfer caller is not the owner, approved nor the creator of the asset"
    );

    _safeTransfer(from, to, tokenId, _data);
  }
}
