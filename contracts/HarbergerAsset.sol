// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.3;

/////////////////////////////////////////////////////////////////////////////////
//                                                                             //
//                                                                             //
//      ██████╗░███████╗███████╗████████╗░██████╗██████╗░░█████╗░░█████╗░      //
//      ██╔══██╗██╔════╝██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔══██╗██╔══██╗      //
//      ██████╦╝█████╗░░█████╗░░░░░██║░░░╚█████╗░██║░░██║███████║██║░░██║      //
//      ██╔══██╗██╔══╝░░██╔══╝░░░░░██║░░░░╚═══██╗██║░░██║██╔══██║██║░░██║      //
//      ██████╦╝███████╗███████╗░░░██║░░░██████╔╝██████╔╝██║░░██║╚█████╔╝      //
//      ╚═════╝░╚══════╝╚══════╝░░░╚═╝░░░╚═════╝░╚═════╝░╚═╝░░╚═╝░╚════╝░      //
//                                                                             //
//                                                                             //
/////////////////////////////////////////////////////////////////////////////////

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

/*
 * External Sources:
 * https://github.com/yosriady/PatronageCollectibles
 * https://github.com/simondlr/thisartworkisalwaysonsale
 */

/**
 * @author swaHili
 * @title HarbergerAsset
 * @dev Assets are controlled through the property rights enforced by Harberger taxation
 */
contract HarbergerAsset is ERC721URIStorage {
  using SafeMath for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // Owner of contract
  address public admin;

  // Base time interval in seconds used to calculate foreclosure date (24 hours)
  uint256 public baseInterval = 86400 seconds;

  // Prepend baseURI to Arweave ID to create tokenURI
  string  public baseURI = "https://arweave.net/";

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

  // Mapping tokenId to Mapping of tax collector address to balance amount
  mapping(uint256 => mapping(address => uint256)) public balances;

  // Mapping tokenId to base tax value in wei which is used to calculate foreclosure date
  mapping(uint256 => uint256) public baseTaxValues;

  // Mapping tokenId to content identifiers (IPFS Hashes)
  mapping(uint256 => string) public contentIds;

  // Mapping tokenId to Mapping of previous owner address to total deposit amount after refund
  mapping(uint256 => mapping(address => uint256)) public depositHistory;

  // Mapping tokenId to total count of previous owners
  mapping(uint256 => uint256) public totalOwners;

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
   * @dev List of possible events emitted after every user transaction.
   */
  event Mint       (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to);
  event List       (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, uint256 value);
  event Deposit    (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value);
  event Sale       (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value);
  event Refund     (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value);
  event Collect    (uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to, uint256 value);
  event Foreclosure(uint256 indexed timestamp, uint256 indexed tokenId, address indexed from, address to);

  /**
   * @dev Initializes contract and sets `admin` to specified owner of contract.
   * @param _admin Address of the contract admin
   */
  constructor(address _admin) ERC721("HarbergerAsset", "ASSET") {
    admin = _admin;
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
   * @dev See {IERC721-baseURI}.
   */
  function _baseURI() override internal view virtual returns (string memory) {
    return baseURI;
  }

  /**
   * @dev Mints `tokenId`, transfers it to `creator`, and sets `tokenURI`
   * @param _arweaveId Arweave ID used to create tokenURI
   * @param _ipfsHash Content ID generated from JSON metadata
   * @param _creator Address of artist who created the asset
   * @return the newly created `tokenId`
   *
   * Requirements:
   *
   * - `admin` must be equal to `msgSender()`.
   *
   * Emits a {Mint & Transfer} event.
   */
  function mintAsset(string memory _arweaveId, string memory _ipfsHash, address _creator) public onlyAdmin returns (uint256) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();

    emit Mint(block.timestamp, newItemId, address(0), _creator);

    _safeMint(_creator, newItemId);
    _setTokenURI(newItemId, _arweaveId);
    contentIds[newItemId] = _ipfsHash;

    initializeAsset(newItemId, _creator);
    balances[newItemId][admin] = 0;
    balances[newItemId][_creator] = 0;
    baseTaxValues[newItemId] = 10000000000000000; // .01 ETH

    return newItemId;
  }

  /**
   * @dev Lists asset for sale in wei and sets corresponding tax price in wei.
   * @param _tokenId ID of the token
   * @param _priceAmount Price amount in wei of the asset
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `owner` of asset must be equal to `msgSender()`.
   * - 'priceAmount' of asset must be greater than 0.
   * - 'foreclosure()' of asset must not be in process OR `msgSender()` must be equal to creator of asset.
   *
   * Emits a {List} event.
   */
  function listAssetForSaleInWei(uint256 _tokenId, uint256 _priceAmount) public validToken(_tokenId) onlyOwner(_tokenId) {
    require(_priceAmount > 0, "You must set a sales price greater than 0");
    require(foreclosure(_tokenId) == false || assets[_tokenId].creator == _msgSender(), "A foreclosure on this asset has already begun");

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
   * - 'foreclosure()' of asset must not be in process.
   *
   * Emits a {Deposit} event.
   */
  function depositTaxInWei(uint256 _tokenId) public payable validToken(_tokenId) onlyOwner(_tokenId) {
    require(assets[_tokenId].priceAmount > 0, "You must first set a sales price");
    require(msg.value > 0, "You must deposit a tax amount greater than 0");
    require(assets[_tokenId].taxAmount <= msg.value || assets[_tokenId].totalDepositAmount > 0, "Your initial deposit must not be less than the current tax price");
    require(foreclosure(_tokenId) == false, "A foreclosure on this asset has already begun");

    uint256 baseTaxValue = baseTaxValues[_tokenId];
    uint256 taxMultiplier = msg.value.div(baseTaxValue);

    assets[_tokenId].foreclosureTimestamp += baseInterval.mul(taxMultiplier);
    assets[_tokenId].lastDepositTimestamp = block.timestamp;
    assets[_tokenId].totalDepositAmount += msg.value;

    emit Deposit(block.timestamp, _tokenId, _msgSender(), address(this), msg.value);
  }

  /**
   * @dev Purchase of asset triggers payment transfers, tax refund, asset transfer, asset history and balance updates.
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
    require(assets[_tokenId].priceAmount == msg.value, "Invalid payment amount");

    address currentOwner = ownerOf(_tokenId);
    address creator = assets[_tokenId].creator;

    transferPayment(msg.value, currentOwner, creator);
    uint256 refundAmount = refundTax(_tokenId, currentOwner);
    uint256 depositAfterRefund = updateAssetHistory(_tokenId, currentOwner, refundAmount);

    updateBalance(_tokenId, creator, depositAfterRefund);
    initializeAsset(_tokenId, creator);
    baseTaxValues[_tokenId] += 1000000000000000; // 0.001 ETH

    emit Sale(block.timestamp, _tokenId, _msgSender(), currentOwner, msg.value);
    this.safeTransferFrom(currentOwner, _msgSender(), _tokenId);
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
   * @return refund amount from excess of taxes deposited
   *
   * Emits a {Refund} event if `timeRemaining` is more than `baseInterval`.
   */
  function refundTax(uint256 _tokenId, address _currentOwner) internal returns(uint256) {
    uint256 foreclosureTimestamp = assets[_tokenId].foreclosureTimestamp;
    uint256 timeRemainingTimestamp = foreclosureTimestamp.sub(block.timestamp);

    if (int256(timeRemainingTimestamp) > int256(baseInterval)) {
      uint256 taxMultiplier = timeRemainingTimestamp.div(baseInterval);
      uint256 baseTaxValue = baseTaxValues[_tokenId];
      uint256 refundAmount = baseTaxValue.mul(taxMultiplier);

      payable(_currentOwner).transfer(refundAmount);
      emit Refund(block.timestamp, _tokenId, address(this), _currentOwner, refundAmount);

      return refundAmount;
    }

    return 0;
  }

  /**
   * @dev Updates the `depositHistory` and `totalOwners` mappings to keep track of asset provenance.
   * @param _tokenId ID of the token
   * @param _currentOwner Address of the previous owner
   * @param _refundAmount Amount used to calculate actual `totalDepositAmount` of the previous owner
   * @return total deposit amount after refund
   */
  function updateAssetHistory(uint256 _tokenId, address _currentOwner, uint256 _refundAmount) internal returns (uint256) {
    uint256 totalDepositAmount = assets[_tokenId].totalDepositAmount;

    if (depositHistory[_tokenId][_currentOwner] == 0 && totalDepositAmount > 0) {
      totalOwners[_tokenId] += 1;
    }

    uint256 depositAfterRefund = totalDepositAmount.sub(_refundAmount);
    depositHistory[_tokenId][_currentOwner] += depositAfterRefund;

    return depositAfterRefund;
  }

  /**
   * @dev Updates the `admin` and `creator` balances.
   * @param _tokenId ID of the token
   * @param _creator Address of artist who created the asset
   * @param _totalDeposit Amount deposited after refund used to update balances
   */
  function updateBalance(uint256 _tokenId, address _creator, uint256 _totalDeposit) internal {
    uint256 splitBalance = _totalDeposit.div(2);

    balances[_tokenId][admin] += splitBalance;
    balances[_tokenId][_creator] += splitBalance;
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

    emit Collect(block.timestamp, _tokenId, address(this), _msgSender(), amount);
  }

  /**
   * @dev Reclaims asset and transfers it back to `creator`.
   * @param _tokenId ID of the token
   *
   * Requirements:
   *
   * - `tokenId` must exist.
   * - `creator` must be equal to `msgSender()`.
   * - `foreclosure()` of asset must be equal to true.
   * - `creator` must not be current owner of the asset.
   *
   * Emits a {Foreclosure} event.
   */
  function reclaimAsset(uint256 _tokenId) public validToken(_tokenId) onlyCreator(_tokenId) {
    require(foreclosure(_tokenId), "Time has not yet expired for you to reclaim this asset");
    require(ownerOf(_tokenId) != _msgSender(), "You are already the owner of this asset");

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
  function foreclosure(uint256 _tokenId) public view validToken(_tokenId) returns (bool) {
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
   * - `creator` may only update value when in posession of the asset.
   */
  function setBaseTaxValueInWei(uint256 _tokenId, uint256 _amount) public validToken(_tokenId) onlyCreator(_tokenId) {
    require(baseTaxValues[_tokenId] != _amount, "New value must be different than the current value");
    require(ownerOf(_tokenId) == _msgSender(), "You may only update this value once you are in possession of the asset");

    baseTaxValues[_tokenId] = _amount;
  }

  /**
   * @dev Updates the state variable `royaltyPercentage`.
   * @param _percentage New royalty percentage
   *
   * Requirements:
   *
   * - `admin` must be equal to `msgSender()`.
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
   * - `admin` must be equal to `msgSender()`.
   * - `percentage` must be different than the current value.
   */
  function setTaxRatePercentage(uint256 _percentage) public onlyAdmin {
    require(taxRatePercentage != _percentage, "New value must be different than the current value");

    taxRatePercentage = _percentage;
  }

  /**
   * @dev See {IERC721-safeTransferFrom}.
   *
   * Requirements:
   *
   * - `currentOwner` or `approvedAccount` must be equal to `msgSender()` OR
   * - `creator` must be equal to `msgSender` AND `foreclosure()` must be equal to true.
   */
  function safeTransferFrom(
      address from,
      address to,
      uint256 tokenId,
      bytes memory _data
    ) public virtual override {
    require(
      _isApprovedOrOwner(_msgSender(), tokenId) ||
      (assets[tokenId].creator == _msgSender() && foreclosure(tokenId)),
      "Transfer caller is not the owner, approved nor the creator of the asset"
    );

    _safeTransfer(from, to, tokenId, _data);
  }
}
